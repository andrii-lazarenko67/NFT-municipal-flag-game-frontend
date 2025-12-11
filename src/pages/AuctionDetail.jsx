/**
 * Auction Detail Page - View auction details and place bids
 *
 * ENHANCED FEATURES:
 * - Displays min_price (floor price)
 * - Displays buyout_price with instant buyout button
 * - Bidder category selection for tie-breaking
 * - Shows winner_category for closed auctions
 */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchAuction,
  placeBid,
  buyoutAuction,
  selectCurrentAuction,
  selectAuctionsLoading,
  selectActionLoading,
  clearCurrentAuction,
} from '../store/slices/auctionsSlice';
import { selectAddress, selectIsConnected, connectWallet } from '../store/slices/walletSlice';
import Loading from '../components/Loading';
import config from '../config';
import { useAnimation, usePageLoadAnimation, animationPatterns } from '../hooks/useAnimation';

const AuctionDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const auction = useSelector(selectCurrentAuction);
  const loading = useSelector(selectAuctionsLoading);
  const actionLoading = useSelector(selectActionLoading);
  const address = useSelector(selectAddress);
  const isConnected = useSelector(selectIsConnected);

  // Animation hooks
  const headerRef = usePageLoadAnimation(100);
  const { ref: contentRef } = useAnimation({ threshold: 0.1 });
  const { ref: bidHistoryRef } = useAnimation({ threshold: 0.1 });

  const [bidAmount, setBidAmount] = useState('');
  const [bidderCategory, setBidderCategory] = useState('standard');
  const [bidding, setBidding] = useState(false);
  const [buyingOut, setBuyingOut] = useState(false);

  useEffect(() => {
    dispatch(fetchAuction(id));
    return () => {
      dispatch(clearCurrentAuction());
    };
  }, [dispatch, id]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      alert('Please enter a valid bid amount');
      return;
    }

    // Validate bid amount against min_price
    if (parseFloat(bidAmount) < parseFloat(auction.min_price)) {
      alert(`Bid must be at least ${config.formatPrice(auction.min_price)} POL (minimum price)`);
      return;
    }

    setBidding(true);
    try {
      await dispatch(placeBid({
        auctionId: parseInt(id),
        walletAddress: address,
        amount: parseFloat(bidAmount),
        bidderCategory: bidderCategory,
      })).unwrap();

      alert('Bid placed successfully!');
      setBidAmount('');
    } catch (error) {
      alert(error || 'Failed to place bid');
    } finally {
      setBidding(false);
    }
  };

  const handleBuyout = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!window.confirm(`Are you sure you want to buyout this auction for ${config.formatPrice(auction.buyout_price)} POL?`)) {
      return;
    }

    setBuyingOut(true);
    try {
      await dispatch(buyoutAuction({
        auctionId: parseInt(id),
        walletAddress: address,
      })).unwrap();

      alert('Buyout successful! You now own this flag.');
    } catch (error) {
      alert(error || 'Failed to buyout auction');
    } finally {
      setBuyingOut(false);
    }
  };

  const handleConnect = () => dispatch(connectWallet());

  if (loading && !auction) return <Loading text="Loading auction details..." />;
  if (!auction) {
    return (
      <div className="page-container">
        <div
          data-animate="zoom-in"
          data-duration="fast"
          className="text-center py-16"
        >
          <p className="text-red-400">Auction not found</p>
          <Link to="/auctions" className="text-primary hover:text-primary-light mt-4 inline-block">
            Back to Auctions
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = auction.flag?.image_ipfs_hash
    ? config.getIpfsUrl(auction.flag.image_ipfs_hash)
    : null;

  const timeRemaining = new Date(auction.ends_at) - new Date();
  const isEnded = timeRemaining <= 0 || auction.status !== 'active';
  const isSeller = address?.toLowerCase() === auction.seller?.wallet_address?.toLowerCase();
  const currentHighestBid = auction.current_highest_bid || auction.starting_price;
  const minBidAmount = Math.max(
    parseFloat(auction.min_price),
    parseFloat(currentHighestBid) + 0.001
  );

  const formatTimeRemaining = () => {
    if (isEnded) return 'Ended';
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'premium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'plus':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <nav ref={headerRef} className="breadcrumb mb-6">
        <Link
          to="/auctions"
          data-animate="fade-right"
          data-duration="fast"
          data-delay="0"
        >
          Auctions
        </Link>
        <span data-animate="fade" data-duration="fast" data-delay="1">/</span>
        <span
          data-animate="fade-left"
          data-duration="fast"
          data-delay="2"
          className="text-white"
        >
          Auction #{auction.id}
        </span>
      </nav>

      <div ref={contentRef} className="grid lg:grid-cols-2 gap-8">
        {/* Image Section */}
        <div>
          <div
            data-animate="zoom-in"
            data-duration="slow"
            data-delay="0"
            className="card overflow-hidden relative"
          >
            {/* Buyout Badge */}
            {auction.buyout_price && auction.status === 'active' && (
              <div className="absolute top-2 right-2 z-10">
                <span className="px-3 py-1 text-sm rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">
                  Buyout: {config.formatPrice(auction.buyout_price)} POL
                </span>
              </div>
            )}

            {imageUrl ? (
              <img src={imageUrl} alt="Flag" className="w-full aspect-square object-cover" />
            ) : (
              <div className="w-full aspect-square bg-dark-darker flex items-center justify-center">
                <div className="text-gray-600 text-lg">Flag #{auction.flag_id}</div>
              </div>
            )}
          </div>

          {/* Flag Info */}
          {auction.flag && (
            <div
              data-animate="fade-up"
              data-duration="normal"
              data-delay="2"
              className="mt-4"
            >
              <Link
                to={`/flags/${auction.flag_id}`}
                className="text-primary hover:text-primary-light"
              >
                View Flag Details
              </Link>
              <div className="flex gap-2 mt-2">
                {auction.flag.category && (
                  <span className={`badge badge-${auction.flag.category.toLowerCase()}`}>
                    {auction.flag.category}
                  </span>
                )}
                {auction.flag.location_type && (
                  <span className="badge badge-available">{auction.flag.location_type}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Auction Info Section */}
        <div>
          <h1
            data-animate="fade-down"
            data-duration="normal"
            data-delay="1"
            className="text-3xl font-bold text-white mb-2"
          >
            {auction.flag?.name || `Flag #${auction.flag_id}`}
          </h1>

          {/* Status Badge */}
          <div
            data-animate="fade-up"
            data-duration="normal"
            data-delay="2"
            className="mb-6 flex gap-2"
          >
            <span className={`badge ${isEnded ? 'bg-gray-600' : 'bg-green-600'} text-white`}>
              {auction.status === 'active' ? (isEnded ? 'Time Ended' : 'Active') : auction.status}
            </span>
            {auction.status === 'closed' && auction.winner_category && (
              <span className={`px-2 py-1 text-xs rounded border ${getCategoryBadgeClass(auction.winner_category)}`}>
                Winner: {auction.winner_category.charAt(0).toUpperCase() + auction.winner_category.slice(1)}
              </span>
            )}
          </div>

          {/* Auction Stats */}
          <div
            data-animate="fade-up"
            data-duration="normal"
            data-delay="3"
            className="card p-6 mb-6"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Starting Price:</span>
                <span className="text-white font-semibold">
                  {config.formatPrice(auction.starting_price)} POL
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Minimum Bid:</span>
                <span className="text-gray-300">
                  {config.formatPrice(auction.min_price)} POL
                </span>
              </div>
              {auction.buyout_price && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Buyout Price:</span>
                  <span className="text-yellow-400 font-semibold">
                    {config.formatPrice(auction.buyout_price)} POL
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center border-t border-gray-700 pt-4">
                <span className="text-gray-400">Current Bid:</span>
                <span className="text-primary text-xl font-bold">
                  {config.formatPrice(currentHighestBid)} POL
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Time Remaining:</span>
                <span className={`font-semibold ${isEnded ? 'text-gray-500' : 'text-green-400'}`}>
                  {formatTimeRemaining()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Bids:</span>
                <span className="text-white font-semibold">{auction.bid_count || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Ends At:</span>
                <span className="text-white font-semibold">
                  {new Date(auction.ends_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <div
            data-animate="fade-left"
            data-duration="normal"
            data-delay="4"
            className="card p-6 mb-6"
          >
            <h3 className="text-white font-semibold mb-2">Seller</h3>
            <p className="text-gray-400 font-mono text-sm">
              {config.truncateAddress(auction.seller?.wallet_address, 8)}
            </p>
            {auction.seller?.reputation_score !== undefined && (
              <p className="text-gray-500 text-sm mt-1">
                Reputation: {auction.seller.reputation_score}
              </p>
            )}
          </div>

          {/* Highest Bidder */}
          {auction.highest_bidder && (
            <div
              data-animate="fade-left"
              data-duration="normal"
              data-delay="5"
              className="card p-6 mb-6 bg-primary/10 border-primary/30"
            >
              <h3 className="text-white font-semibold mb-2">Highest Bidder</h3>
              <p className="text-primary font-mono text-sm">
                {config.truncateAddress(auction.highest_bidder.wallet_address, 8)}
              </p>
            </div>
          )}

          {/* Buyout Button */}
          {!isEnded && auction.status === 'active' && auction.buyout_price && !isSeller && (
            <div
              data-animate="bounce-in"
              data-duration="normal"
              data-delay="5"
              className="card p-6 mb-6 bg-yellow-500/10 border-yellow-500/30"
            >
              <h3 className="text-yellow-400 font-semibold mb-2">Instant Buyout</h3>
              <p className="text-gray-400 text-sm mb-4">
                Skip the bidding and purchase this flag instantly for {config.formatPrice(auction.buyout_price)} POL
              </p>
              {!isConnected ? (
                <button onClick={handleConnect} className="btn bg-yellow-500 hover:bg-yellow-600 text-black w-full">
                  Connect Wallet to Buyout
                </button>
              ) : (
                <button
                  onClick={handleBuyout}
                  className="btn bg-yellow-500 hover:bg-yellow-600 text-black w-full"
                  disabled={buyingOut || actionLoading}
                >
                  {buyingOut ? 'Processing Buyout...' : `Buyout for ${config.formatPrice(auction.buyout_price)} POL`}
                </button>
              )}
            </div>
          )}

          {/* Bid Form */}
          {!isEnded && auction.status === 'active' && (
            <div
              data-animate="fade-up"
              data-duration="normal"
              data-delay="6"
              className="card p-6 mb-6"
            >
              <h3 className="text-white font-semibold mb-4">Place a Bid</h3>

              {!isConnected ? (
                <button onClick={handleConnect} className="btn btn-primary w-full">
                  Connect Wallet to Bid
                </button>
              ) : isSeller ? (
                <div className="text-gray-500 text-center py-4">
                  You cannot bid on your own auction
                </div>
              ) : (
                <form onSubmit={handlePlaceBid} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Bid Amount (POL)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min={minBidAmount}
                      required
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Min: ${config.formatPrice(minBidAmount)}`}
                      className="w-full px-4 py-2 bg-dark-darker border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
                    />
                    <p className="text-gray-500 text-sm mt-1">
                      Minimum bid: {config.formatPrice(minBidAmount)} POL
                    </p>
                  </div>

                  {/* Bidder Category Selection */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Your Category (for tie-breaking)
                    </label>
                    <select
                      value={bidderCategory}
                      onChange={(e) => setBidderCategory(e.target.value)}
                      className="w-full px-4 py-2 bg-dark-darker border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
                    >
                      <option value="standard">Standard</option>
                      <option value="plus">Plus</option>
                      <option value="premium">Premium</option>
                    </select>
                    <p className="text-gray-500 text-sm mt-1">
                      Higher category wins in case of tied bids (Premium &gt; Plus &gt; Standard)
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={bidding || actionLoading}
                  >
                    {bidding ? 'Placing Bid...' : 'Place Bid'}
                  </button>
                </form>
              )}
            </div>
          )}

          {isEnded && auction.status === 'active' && (
            <div
              data-animate="fade-up"
              data-duration="normal"
              className="card p-4 bg-yellow-600/10 border-yellow-600/30 text-center mb-6"
            >
              <p className="text-yellow-600">
                This auction has ended and is waiting to be closed
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bid History */}
      {auction.bids && auction.bids.length > 0 && (
        <div ref={bidHistoryRef} className="mt-8">
          <h2
            data-animate="fade-right"
            data-duration="normal"
            data-delay="0"
            className="text-xl font-bold text-white mb-4"
          >
            Bid History ({auction.bids.length})
          </h2>
          <div
            data-animate="fade-up"
            data-duration="normal"
            data-delay="1"
            className="card divide-y divide-gray-800"
          >
            {auction.bids.map((bid, index) => (
              <div
                key={bid.id}
                {...animationPatterns.list(index)}
                className="p-4 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-mono text-sm">
                      {config.truncateAddress(bid.bidder?.wallet_address, 8)}
                    </p>
                    {bid.bidder_category && (
                      <span className={`px-2 py-0.5 text-xs rounded border ${getCategoryBadgeClass(bid.bidder_category)}`}>
                        {bid.bidder_category.charAt(0).toUpperCase() + bid.bidder_category.slice(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">
                    {new Date(bid.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-primary font-semibold">
                    {config.formatPrice(bid.amount)} POL
                  </p>
                  {bid.bidder_id === auction.highest_bidder_id && (
                    <span className="text-xs text-yellow-600">Highest Bid</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionDetail;
