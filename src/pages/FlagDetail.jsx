/**
 * Flag Detail Page - Full flag information with actions
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
import { useEffect } from 'react';
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
import { selectAddress, selectIsConnected } from '../store/slices/walletSlice';
import { claimFirstNFT as web3ClaimFirst, purchaseSecondNFT as web3PurchaseSecond } from '../services/web3';
import config from '../config';
import Loading from '../components/Loading';
import { useAnimation, usePageLoadAnimation } from '../hooks/useAnimation';

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

  // Animation hooks
  const headerRef = usePageLoadAnimation(100);
  const { ref: contentRef } = useAnimation({ threshold: 0.1 });

  // MULTI-NFT: Get number of NFTs required (default to 1 for backward compatibility)
  const nftsRequired = flag?.nfts_required || 1;

  useEffect(() => {
    dispatch(fetchFlag(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (flag && address && config.contractAddress) {
      dispatch(fetchDiscountedPrice({ flagId: flag.id, address }));
    }
  }, [dispatch, flag, address]);

  const handleShowInterest = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    dispatch(registerInterest({ flagId: flag.id, address }));
  };

  const handleClaimFirst = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    try {
      const result = await web3ClaimFirst(flag.id);
      dispatch(claimFirstNFT({ flagId: flag.id, address, transactionHash: result.transactionHash }));
      // MULTI-NFT: Update success message based on NFTs required
      if (nftsRequired > 1) {
        alert(`Successfully claimed ${nftsRequired} first NFTs!`);
      } else {
        alert('First NFT claimed successfully!');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePurchaseSecond = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    try {
      // MULTI-NFT: Calculate total price for all required NFTs
      const pricePerNft = discountedPrice || flag.price;
      const totalPrice = parseFloat(pricePerNft) * nftsRequired;
      const result = await web3PurchaseSecond(flag.id, totalPrice.toString());
      dispatch(purchaseSecondNFT({ flagId: flag.id, address, transactionHash: result.transactionHash }));
      // MULTI-NFT: Update success message based on NFTs required
      if (nftsRequired > 1) {
        alert(`Successfully purchased ${nftsRequired} second NFTs! Pair complete!`);
      } else {
        alert('Second NFT purchased! Pair complete!');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <Loading text="Loading flag details..." />;
  if (!flag) return <ErrorDisplay message="Flag not found" />;

  const imageUrl = flag.image_ipfs_hash
    ? config.getIpfsUrl(flag.image_ipfs_hash)
    : `https://placehold.co/500x500/1a1a2e/e94560?text=${encodeURIComponent(flag.location_type)}`;

  const hasUserInterest = flag.interests?.some(i => i.user?.wallet_address === address?.toLowerCase());

  // MULTI-NFT: Calculate total prices
  const basePricePerNft = parseFloat(flag.price);
  const totalBasePrice = basePricePerNft * nftsRequired;
  const discountedPricePerNft = discountedPrice ? parseFloat(discountedPrice) : basePricePerNft;
  const totalDiscountedPrice = discountedPricePerNft * nftsRequired;

  return (
    <div className="page-container">
      <nav ref={headerRef} className="breadcrumb">
        <button
          onClick={() => navigate('/countries')}
          data-animate="fade-right"
          data-duration="fast"
          data-delay="0"
          className="bg-transparent border-none cursor-pointer text-inherit hover:text-primary"
        >
          Countries
        </button>
        {flag.municipality && (
          <>
            <span data-animate="fade" data-duration="fast" data-delay="1">/</span>
            <button
              onClick={() => navigate(`/municipalities/${flag.municipality.id}`)}
              data-animate="fade-right"
              data-duration="fast"
              data-delay="1"
              className="bg-transparent border-none cursor-pointer text-inherit hover:text-primary"
            >
              {flag.municipality.name}
            </button>
          </>
        )}
        <span data-animate="fade" data-duration="fast" data-delay="2">/</span>
        <span
          data-animate="fade-left"
          data-duration="fast"
          data-delay="3"
          className="text-white"
        >
          {flag.location_type}
        </span>
      </nav>

      <div ref={contentRef} className="grid lg:grid-cols-2 gap-8">
        {/* Image Section */}
        <div>
          <div
            data-animate="zoom-in"
            data-duration="slow"
            data-delay="0"
            className="card overflow-hidden"
          >
            <img src={imageUrl} alt={flag.name} className="w-full aspect-square object-cover" />
          </div>
          <div
            data-animate="fade-up"
            data-duration="normal"
            data-delay="2"
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
            data-delay="1"
            className="text-3xl font-bold text-white mb-2"
          >
            {flag.location_type} Flag
          </h1>
          <p
            data-animate="fade-up"
            data-duration="normal"
            data-delay="2"
            className="text-gray-400 font-mono mb-6"
          >
            {flag.name}
          </p>

          {/* MULTI-NFT: NFT Requirements Info Box */}
          {nftsRequired > 1 && (
            <div
              data-animate="fade-right"
              data-duration="normal"
              data-delay="3"
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
            data-delay="3"
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
            data-delay="4"
            className="space-y-3 mb-8"
          >
            {!flag.is_pair_complete && (
              <>
                {flag.first_nft_status === 'available' && (
                  <>
                    {!hasUserInterest && (
                      <button
                        onClick={handleShowInterest}
                        disabled={actionLoading}
                        className="btn btn-secondary w-full"
                      >
                        {actionLoading ? 'Processing...' : 'Show Interest'}
                      </button>
                    )}
                    <button
                      onClick={handleClaimFirst}
                      disabled={actionLoading}
                      className="btn btn-primary w-full"
                    >
                      {actionLoading ? 'Processing...' : (
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
                    disabled={actionLoading}
                    className="btn btn-primary w-full"
                  >
                    {actionLoading ? 'Processing...' : (
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
            data-delay="5"
            className="card p-6 mb-4"
          >
            <h3 className="text-white font-semibold mb-4">Interested Users ({flag.interests?.length || 0})</h3>
            {flag.interests?.length > 0 ? (
              <ul className="space-y-2">
                {flag.interests.map((interest, index) => (
                  <li
                    key={interest.id}
                    data-animate="fade-right"
                    data-duration="fast"
                    data-delay={String(index % 6)}
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
            data-delay="6"
            className="card p-6"
          >
            <h3 className="text-white font-semibold mb-4">Owners</h3>
            {flag.ownerships?.length > 0 ? (
              <ul className="space-y-2">
                {flag.ownerships.map((ownership, index) => (
                  <li
                    key={ownership.id}
                    data-animate="fade-right"
                    data-duration="fast"
                    data-delay={String(index % 6)}
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
