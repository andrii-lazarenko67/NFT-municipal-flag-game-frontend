/**
 * Flag Detail Page - Full flag information with actions
 *
 * MATCHING GAME FEATURE:
 * =====================
 * - Flag details are hidden until user shows interest
 * - "Show Interest" reveals the flag information
 * - After interest, user can claim the first NFT (free)
 * - After claiming first NFT, user can purchase the second NFT
 *
 * MULTI-NFT FEATURE DOCUMENTATION:
 * ================================
 * This page displays the NFT requirements for obtaining a flag:
 * - nfts_required=1: Standard single NFT acquisition
 * - nfts_required=3: Grouped NFTs requiring 3 NFTs to obtain
 *
 * UI Changes:
 * - Shows "Requires X NFTs" badge for grouped flags
 * - Displays total price (base price * nfts_required)
 * - Shows per-NFT price breakdown
 * - Updated action buttons to reflect grouped acquisition
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchFlag,
  fetchDiscountedPrice,
  registerInterest,
  claimFirstNFT,
  purchaseSecondNFT,
  selectCurrentFlag,
  selectFlagsLoading,
  selectActionLoading,
  selectDiscountedPrice,
} from '../store/slices/flagsSlice';
import { selectAddress, selectIsConnected, connectWallet } from '../store/slices/walletSlice';
import { claimFirstNFT as web3ClaimFirst, purchaseSecondNFT as web3PurchaseSecond } from '../services/web3';
import config from '../config';
import Loading from '../components/Loading';

const FlagDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const flag = useSelector(selectCurrentFlag);
  const loading = useSelector(selectFlagsLoading);
  const actionLoading = useSelector(selectActionLoading);
  const address = useSelector(selectAddress);
  const isConnected = useSelector(selectIsConnected);
  const discountedPrice = useSelector(selectDiscountedPrice(id));

  // MULTI-NFT: Get number of NFTs required (default to 1 for backward compatibility)
  const nftsRequired = flag?.nfts_required || 1;

  // Local loading states for each action
  const [interestLoading, setInterestLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  // MATCHING GAME: Track reveal animation state
  const [isRevealing, setIsRevealing] = useState(false);

  // Combined loading state
  const isActionLoading = actionLoading || interestLoading || claimLoading || purchaseLoading;

  useEffect(() => {
    dispatch(fetchFlag(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (flag && address && config.contractAddress) {
      dispatch(fetchDiscountedPrice({ flagId: flag.id, address }));
    }
  }, [dispatch, flag, address]);

  // MATCHING GAME: Determine if flag is revealed to current user
  const isRevealed = (() => {
    if (!flag) return false;

    // If pair is complete, everyone can see it
    if (flag.is_pair_complete) return true;

    // If user has shown interest
    const hasInterest = flag.interests?.some(
      i => i.user?.wallet_address?.toLowerCase() === address?.toLowerCase()
    );
    if (hasInterest) return true;

    // If user owns any NFT of this flag
    const ownsNft = flag.ownerships?.some(
      o => o.user?.wallet_address?.toLowerCase() === address?.toLowerCase()
    );
    if (ownsNft) return true;

    return false;
  })();

  const handleShowInterest = async () => {
    if (!isConnected) {
      dispatch(connectWallet());
      return;
    }
    setInterestLoading(true);
    try {
      await dispatch(registerInterest({ flagId: flag.id, address })).unwrap();
      // Trigger reveal animation
      setIsRevealing(true);
      setTimeout(() => setIsRevealing(false), 1000);
    } catch (err) {
      alert(err.message || 'Failed to register interest');
    } finally {
      setInterestLoading(false);
    }
  };

  const handleClaimFirst = async () => {
    if (!isConnected) {
      dispatch(connectWallet());
      return;
    }
    setClaimLoading(true);
    try {
      const result = await web3ClaimFirst(flag.id);
      await dispatch(claimFirstNFT({ flagId: flag.id, address, transactionHash: result.transactionHash })).unwrap();
      // MULTI-NFT: Update success message based on NFTs required
      if (nftsRequired > 1) {
        alert(`Successfully claimed ${nftsRequired} first NFTs!`);
      } else {
        alert('First NFT claimed successfully!');
      }
    } catch (err) {
      alert(err.message || 'Transaction error');
    } finally {
      setClaimLoading(false);
    }
  };

  const handlePurchaseSecond = async () => {
    if (!isConnected) {
      dispatch(connectWallet());
      return;
    }
    setPurchaseLoading(true);
    try {
      // MULTI-NFT: Calculate total price for all required NFTs
      const pricePerNft = discountedPrice || flag.price;
      const totalPrice = parseFloat(pricePerNft) * nftsRequired;
      const result = await web3PurchaseSecond(flag.id, totalPrice.toString());
      await dispatch(purchaseSecondNFT({ flagId: flag.id, address, transactionHash: result.transactionHash })).unwrap();
      // MULTI-NFT: Update success message based on NFTs required
      if (nftsRequired > 1) {
        alert(`Successfully purchased ${nftsRequired} second NFTs! Pair complete!`);
      } else {
        alert('Second NFT purchased! Pair complete!');
      }
    } catch (err) {
      alert(err.message || 'Transaction error');
    } finally {
      setPurchaseLoading(false);
    }
  };

  if (loading) return <Loading text="Loading flag details..." />;
  if (!flag) return <ErrorDisplay message="Flag not found" />;

  const imageUrl = flag.image_ipfs_hash
    ? config.getIpfsUrl(flag.image_ipfs_hash)
    : `https://placehold.co/500x500/1a1a2e/e94560?text=${encodeURIComponent(flag.location_type)}`;

  const hasUserInterest = flag.interests?.some(i => i.user?.wallet_address?.toLowerCase() === address?.toLowerCase());

  // MULTI-NFT: Calculate total prices
  const basePricePerNft = parseFloat(flag.price);
  const totalBasePrice = basePricePerNft * nftsRequired;
  const discountedPricePerNft = discountedPrice ? parseFloat(discountedPrice) : basePricePerNft;
  const totalDiscountedPrice = discountedPricePerNft * nftsRequired;

  // MATCHING GAME: Render mystery/hidden view
  if (!isRevealed) {
    return (
      <div className="page-container">
        <nav className="breadcrumb">
          <button
            onClick={() => navigate('/countries')}
            data-animate="fade-right"
            data-duration="fast"
            className="bg-transparent border-none cursor-pointer text-inherit hover:text-primary"
          >
            Countries
          </button>
          {flag.municipality && (
            <>
              <span data-animate="fade" data-duration="fast">/</span>
              <button
                onClick={() => navigate(`/municipalities/${flag.municipality.id}`)}
                data-animate="fade-right"
                data-duration="fast"
                className="bg-transparent border-none cursor-pointer text-inherit hover:text-primary"
              >
                {flag.municipality.name}
              </button>
            </>
          )}
          <span data-animate="fade" data-duration="fast">/</span>
          <span
            data-animate="fade-left"
            data-duration="fast"
            className="text-white"
          >
            Mystery Flag
          </span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Mystery Image Section */}
          <div>
            <div
              data-animate="zoom-in"
              data-duration="slow"
              className="card overflow-hidden relative"
            >
              {/* Mystery card background */}
              <div className="w-full aspect-square bg-gradient-to-br from-dark to-dark-darker relative overflow-hidden">
                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 20px,
                    rgba(233, 69, 96, 0.1) 20px,
                    rgba(233, 69, 96, 0.1) 40px
                  )`
                }} />

                {/* Large question mark */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 rounded-full bg-primary/20 border-4 border-primary/40 flex items-center justify-center animate-pulse">
                    <svg className="w-20 h-20 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>

                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" style={{
                  animation: 'shimmer 3s infinite'
                }} />
              </div>
            </div>
            <div
              data-animate="fade-up"
              data-duration="normal"
              className="flex gap-2 mt-4 flex-wrap"
            >
              <span className={`badge badge-${flag.category.toLowerCase()}`}>{flag.category}</span>
              {nftsRequired > 1 && (
                <span className="badge bg-purple-600/80 text-purple-100">
                  Requires {nftsRequired} NFTs
                </span>
              )}
              <span className="badge bg-gray-700 text-gray-300">Mystery</span>
            </div>
          </div>

          {/* Mystery Info Section */}
          <div>
            <h1
              data-animate="fade-down"
              data-duration="normal"
              className="text-3xl font-bold text-white mb-2"
            >
              Mystery Flag
            </h1>
            <p
              data-animate="fade-up"
              data-duration="normal"
              className="text-gray-400 mb-6"
            >
              Show interest to reveal this flag's details
            </p>

            {/* Mystery Info Box */}
            <div
              data-animate="fade-right"
              data-duration="normal"
              className="card p-6 mb-6 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Discover This Flag</h3>
                  <p className="text-gray-400 text-sm">Click below to reveal the flag details</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>See the actual flag image</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Learn about the location</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Claim the first NFT for free</span>
                </div>
              </div>
            </div>

            {/* Price Preview */}
            <div
              data-animate="fade-up"
              data-duration="normal"
              className="card p-6 mb-6"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Second NFT Price:</span>
                <span className="text-primary font-bold text-lg">
                  {config.formatPrice(totalBasePrice)} MATIC
                </span>
              </div>
              {nftsRequired > 1 && (
                <p className="text-gray-500 text-sm">
                  ({config.formatPrice(flag.price)} MATIC x {nftsRequired} NFTs)
                </p>
              )}
              <p className="text-gray-500 text-sm mt-2">
                First NFT is always FREE!
              </p>
            </div>

            {/* Show Interest Button */}
            <div
              data-animate="fade-up"
              data-duration="normal"
              className="space-y-3"
            >
              {!isConnected ? (
                <button
                  onClick={() => dispatch(connectWallet())}
                  className="btn btn-primary w-full py-4 text-lg"
                >
                  Connect Wallet to Reveal
                </button>
              ) : (
                <button
                  onClick={handleShowInterest}
                  disabled={isActionLoading}
                  className="btn btn-primary w-full py-4 text-lg relative overflow-hidden group"
                >
                  <span className="relative z-10">
                    {interestLoading ? 'Revealing...' : 'Show Interest & Reveal Flag'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-primary bg-[length:200%_100%] animate-gradient opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
            </div>

            {/* Interested Users Count */}
            <div
              data-animate="fade-left"
              data-duration="normal"
              className="card p-4 mt-6 text-center"
            >
              <span className="text-gray-400">
                <span className="text-primary font-bold">{flag.interest_count || 0}</span> users interested
              </span>
            </div>
          </div>
        </div>

        {/* CSS for shimmer animation */}
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient {
            animation: gradient 2s ease infinite;
          }
        `}</style>
      </div>
    );
  }

  // MATCHING GAME: Render revealed view (with optional flip animation)
  return (
    <div className="page-container">
      <nav className="breadcrumb">
        <button
          onClick={() => navigate('/countries')}
          data-animate="fade-right"
          data-duration="fast"
          className="bg-transparent border-none cursor-pointer text-inherit hover:text-primary"
        >
          Countries
        </button>
        {flag.municipality && (
          <>
            <span data-animate="fade" data-duration="fast">/</span>
            <button
              onClick={() => navigate(`/municipalities/${flag.municipality.id}`)}
              data-animate="fade-right"
              data-duration="fast"
              className="bg-transparent border-none cursor-pointer text-inherit hover:text-primary"
            >
              {flag.municipality.name}
            </button>
          </>
        )}
        <span data-animate="fade" data-duration="fast">/</span>
        <span
          data-animate="fade-left"
          data-duration="fast"
          className="text-white"
        >
          {flag.location_type}
        </span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image Section */}
        <div>
          <div
            data-animate="zoom-in"
            data-duration="slow"
            className={`card overflow-hidden ${isRevealing ? 'animate-flip' : ''}`}
          >
            <img src={imageUrl} alt={flag.name} className="w-full aspect-square object-cover" />
          </div>
          <div
            data-animate="fade-up"
            data-duration="normal"
            className="flex gap-2 mt-4 flex-wrap"
          >
            <span className={`badge badge-${flag.category.toLowerCase()}`}>{flag.category}</span>
            {/* MULTI-NFT: Badge showing NFTs required */}
            {nftsRequired > 1 && (
              <span className="badge bg-purple-600/80 text-purple-100">
                Requires {nftsRequired} NFTs
              </span>
            )}
            <span className={`badge ${flag.is_pair_complete ? 'badge-complete' : flag.first_nft_status === 'claimed' ? 'badge-claimed' : 'badge-available'}`}>
              {flag.is_pair_complete ? 'Complete' : flag.first_nft_status === 'claimed' ? 'First Claimed' : 'Available'}
            </span>
          </div>
        </div>

        {/* Info Section */}
        <div>
          <h1
            data-animate="fade-down"
            data-duration="normal"
            className="text-3xl font-bold text-white mb-2"
          >
            {flag.location_type} Flag
          </h1>
          <p
            data-animate="fade-up"
            data-duration="normal"
            className="text-gray-400 font-mono mb-6"
          >
            {flag.name}
          </p>

          {/* MULTI-NFT: NFT Requirements Info Box */}
          {nftsRequired > 1 && (
            <div
              data-animate="fade-right"
              data-duration="normal"
              className="card p-4 mb-4 bg-purple-900/20 border border-purple-600/30"
            >
              <h3 className="text-purple-300 font-semibold mb-2">Grouped NFT Flag</h3>
              <p className="text-gray-400 text-sm">
                This flag requires <span className="text-purple-300 font-bold">{nftsRequired} NFTs</span> to obtain.
                You will mint/purchase {nftsRequired} NFT pairs in a single transaction.
              </p>
            </div>
          )}

          {/* Price - Updated for Multi-NFT */}
          <div
            data-animate="fade-up"
            data-duration="normal"
            className="card p-6 mb-6"
          >
            {/* MULTI-NFT: Show per-NFT and total price */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Price per NFT:</span>
              <span className="text-white font-semibold">{config.formatPrice(flag.price)} MATIC</span>
            </div>

            {nftsRequired > 1 && (
              <div className="flex justify-between items-center mb-2 pt-2 border-t border-gray-700">
                <span className="text-gray-400">Total Price ({nftsRequired} NFTs):</span>
                <span className="text-primary font-bold text-lg">{config.formatPrice(totalBasePrice)} MATIC</span>
              </div>
            )}

            {/* Show discounted price if applicable */}
            {discountedPrice && parseFloat(discountedPrice) !== basePricePerNft && (
              <>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
                  <span className="text-gray-400">Your Price per NFT:</span>
                  <span className="text-green-400 font-semibold">{config.formatPrice(discountedPrice)} MATIC</span>
                </div>
                {nftsRequired > 1 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Your Total Price:</span>
                    <span className="text-green-400 font-bold text-lg">{config.formatPrice(totalDiscountedPrice)} MATIC</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Actions - Updated for Multi-NFT */}
          <div
            data-animate="fade-up"
            data-duration="normal"
            className="space-y-3 mb-8"
          >
            {!flag.is_pair_complete && (
              <>
                {flag.first_nft_status === 'available' && (
                  <>
                    {!hasUserInterest && (
                      <button
                        onClick={handleShowInterest}
                        disabled={isActionLoading}
                        className="btn btn-secondary w-full"
                      >
                        {interestLoading ? 'Registering Interest...' : 'Show Interest'}
                      </button>
                    )}
                    <button
                      onClick={handleClaimFirst}
                      disabled={isActionLoading}
                      className="btn btn-primary w-full"
                    >
                      {claimLoading ? 'Claiming NFT...' : (
                        nftsRequired > 1
                          ? `Claim First ${nftsRequired} NFTs (Free)`
                          : 'Claim First NFT (Free)'
                      )}
                    </button>
                  </>
                )}
                {flag.first_nft_status === 'claimed' && flag.second_nft_status === 'available' && (
                  <button
                    onClick={handlePurchaseSecond}
                    disabled={isActionLoading}
                    className="btn btn-primary w-full"
                  >
                    {purchaseLoading ? 'Purchasing NFT...' : (
                      nftsRequired > 1
                        ? `Purchase ${nftsRequired} Second NFTs (${config.formatPrice(totalDiscountedPrice)} MATIC)`
                        : `Purchase Second NFT (${config.formatPrice(discountedPrice || flag.price)} MATIC)`
                    )}
                  </button>
                )}
              </>
            )}
            {flag.is_pair_complete && (
              <div className="card p-4 bg-primary/10 border-primary/30 text-center">
                <p className="text-primary">This flag pair has been completed</p>
              </div>
            )}
          </div>

          {/* Interested Users */}
          <div
            data-animate="fade-left"
            data-duration="normal"
            className="card p-6 mb-4"
          >
            <h3 className="text-white font-semibold mb-4">Interested Users ({flag.interests?.length || 0})</h3>
            {flag.interests?.length > 0 ? (
              <ul className="space-y-2">
                {flag.interests.map((interest) => (
                  <li
                    key={interest.id}
                    data-animate="fade-right"
                    data-duration="fast"
                    className="text-gray-400 text-sm font-mono"
                  >
                    {config.truncateAddress(interest.user?.wallet_address)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No one has shown interest yet</p>
            )}
          </div>

          {/* Owners */}
          <div
            data-animate="fade-left"
            data-duration="normal"
            className="card p-6"
          >
            <h3 className="text-white font-semibold mb-4">Owners</h3>
            {flag.ownerships?.length > 0 ? (
              <ul className="space-y-2">
                {flag.ownerships.map((ownership) => (
                  <li
                    key={ownership.id}
                    data-animate="fade-right"
                    data-duration="fast"
                    className="flex justify-between text-sm"
                  >
                    <span className="text-gray-400 font-mono">{config.truncateAddress(ownership.user?.wallet_address)}</span>
                    <span className="text-gray-500">{ownership.ownership_type}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No owners yet</p>
            )}
          </div>
        </div>
      </div>

      {/* CSS for flip animation */}
      <style>{`
        @keyframes flip {
          0% { transform: rotateY(0deg); }
          50% { transform: rotateY(90deg); }
          100% { transform: rotateY(0deg); }
        }
        .animate-flip {
          animation: flip 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
};

const ErrorDisplay = ({ message }) => (
  <div className="page-container">
    <div
      data-animate="zoom-in"
      data-duration="fast"
      className="text-center py-16"
    >
      <p className="text-red-400">{message}</p>
    </div>
  </div>
);

export default FlagDetail;
