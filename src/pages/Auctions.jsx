/**
 * Auctions Page - Active auctions list
 *
 * ENHANCED FEATURES:
 * - Displays min_price (floor price)
 * - Displays buyout_price (instant purchase option)
 * - Shows category badge for bidders
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchAuctions,
  selectAuctions,
  selectAuctionsLoading,
} from '../store/slices/auctionsSlice';
import Loading from '../components/Loading';
import config from '../config';
import { useAnimation, usePageLoadAnimation, animationPatterns } from '../hooks/useAnimation';

const Auctions = () => {
  const dispatch = useDispatch();
  const auctions = useSelector(selectAuctions);
  const loading = useSelector(selectAuctionsLoading);
  const [showAll, setShowAll] = useState(false);

  // Animation hooks
  const headerRef = usePageLoadAnimation(100);
  const { ref: gridRef } = useAnimation({ threshold: 0.1 });

  useEffect(() => {
    dispatch(fetchAuctions(!showAll));
  }, [dispatch, showAll]);

  const formatTimeRemaining = (endsAt) => {
    const now = new Date();
    const end = new Date(endsAt);
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
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

  if (loading && auctions.length === 0) return <Loading />;

  return (
    <div className="page-container">
      <div ref={headerRef} className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1
              data-animate="fade-down"
              data-duration="normal"
              data-delay="0"
              className="page-title"
            >
              Auctions
            </h1>
            <p
              data-animate="fade-up"
              data-duration="normal"
              data-delay="1"
              className="page-subtitle"
            >
              Bid on flags from other collectors
            </p>
          </div>
          <div
            data-animate="fade-left"
            data-duration="normal"
            data-delay="2"
            className="flex items-center gap-4"
          >
            <label className="flex items-center gap-2 text-gray-400">
              <input
                type="checkbox"
                checked={showAll}
                onChange={(e) => setShowAll(e.target.checked)}
                className="rounded bg-dark-lighter border-gray-600"
              />
              Show closed auctions
            </label>
          </div>
        </div>
      </div>

      {auctions.length > 0 ? (
        <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction, index) => (
            <Link
              to={`/auctions/${auction.id}`}
              key={auction.id}
              {...animationPatterns.cards(index)}
              className="card card-hover card-animate overflow-hidden relative"
            >
              {/* Status Badge */}
              <div className="absolute top-2 right-2 z-10">
                {auction.status === 'active' ? (
                  <span className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-400 border border-green-500/50">
                    Active
                  </span>
                ) : auction.status === 'closed' ? (
                  <span className="px-2 py-1 text-xs rounded bg-gray-500/20 text-gray-400 border border-gray-500/50">
                    Closed
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-400 border border-red-500/50">
                    Cancelled
                  </span>
                )}
              </div>

              {/* Buyout Badge */}
              {auction.buyout_price && auction.status === 'active' && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="px-2 py-1 text-xs rounded bg-primary/20 text-primary border border-primary/50">
                    Buyout Available
                  </span>
                </div>
              )}

              <div className="aspect-video bg-dark-darker flex items-center justify-center">
                {auction.flag?.image_ipfs_hash ? (
                  <img
                    src={config.getIpfsUrl(auction.flag.image_ipfs_hash)}
                    alt="Flag"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-600 text-lg">Flag #{auction.flag_id}</div>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-white font-semibold mb-2">
                  {auction.flag?.location_type || `Flag #${auction.flag_id}`}
                </h3>

                {/* Current Bid */}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-sm">Current Bid:</span>
                  <span className="text-primary font-semibold">
                    {config.formatPrice(auction.current_highest_bid || auction.starting_price)} MATIC
                  </span>
                </div>

                {/* Min Price */}
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="text-gray-500">Min Bid:</span>
                  <span className="text-gray-400">
                    {config.formatPrice(auction.min_price)} MATIC
                  </span>
                </div>

                {/* Buyout Price */}
                {auction.buyout_price && (
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="text-gray-500">Buyout:</span>
                    <span className="text-yellow-400 font-semibold">
                      {config.formatPrice(auction.buyout_price)} MATIC
                    </span>
                  </div>
                )}

                {/* Winner Category (for closed auctions) */}
                {auction.status === 'closed' && auction.winner_category && (
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="text-gray-500">Winner:</span>
                    <span className={`px-2 py-0.5 text-xs rounded border ${getCategoryBadgeClass(auction.winner_category)}`}>
                      {auction.winner_category.charAt(0).toUpperCase() + auction.winner_category.slice(1)}
                    </span>
                  </div>
                )}

                {/* Footer */}
                <div className="flex justify-between items-center text-sm text-gray-500 mt-3 pt-3 border-t border-gray-700">
                  <span>{auction.bid_count} bids</span>
                  <span className={auction.status === 'active' ? 'text-green-400' : ''}>
                    {auction.status === 'active'
                      ? formatTimeRemaining(auction.ends_at)
                      : new Date(auction.ends_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div
          data-animate="zoom-in"
          data-duration="slow"
          className="text-center py-20"
        >
          <div className="card max-w-md mx-auto p-8">
            <h3 className="text-xl text-white mb-2">No Auctions Found</h3>
            <p className="text-gray-400">
              {showAll
                ? 'There are no auctions in the system yet.'
                : 'There are no active auctions at the moment. Check back later!'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auctions;
