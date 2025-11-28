/**
 * Flag Card Component - Displays a flag with its details
 *
 * MULTI-NFT FEATURE:
 * Displays the number of NFTs required to obtain a flag.
 * - nfts_required=1: Shows standard price
 * - nfts_required=3: Shows "3x NFTs" badge and total price (price * 3)
 */
import { Link } from 'react-router-dom';
import config from '../config';

const FlagCard = ({ flag, showMunicipality = false }) => {
  // MULTI-NFT: Calculate total price based on NFTs required
  const nftsRequired = flag.nfts_required || 1;
  const totalPrice = parseFloat(flag.price) * nftsRequired;

  const getStatusBadge = () => {
    if (flag.is_pair_complete) {
      return <span className="badge badge-complete">Complete</span>;
    }
    if (flag.first_nft_status === 'claimed') {
      return <span className="badge badge-claimed">First Claimed</span>;
    }
    return <span className="badge badge-available">Available</span>;
  };

  const getCategoryBadge = () => {
    const categoryClass = flag.category.toLowerCase();
    return <span className={`badge badge-${categoryClass}`}>{flag.category}</span>;
  };

  /**
   * MULTI-NFT: Badge showing how many NFTs are required
   * Only displayed when nfts_required > 1 (grouped NFT flags)
   */
  const getNftRequirementBadge = () => {
    if (nftsRequired <= 1) return null;
    return (
      <span className="badge bg-purple-600/80 text-purple-100">
        {nftsRequired}x NFTs
      </span>
    );
  };

  const getImageUrl = () => {
    if (flag.image_ipfs_hash) {
      return config.getIpfsUrl(flag.image_ipfs_hash);
    }
    // Use placehold.co as fallback (more reliable than via.placeholder.com)
    return `https://placehold.co/300x300/1a1a2e/e94560?text=${encodeURIComponent(flag.location_type)}`;
  };

  return (
    <Link to={`/flags/${flag.id}`} className="card card-hover group block">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={getImageUrl()}
          alt={flag.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src = `https://placehold.co/300x300/1a1a2e/e94560?text=${encodeURIComponent(flag.location_type)}`;
          }}
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {getCategoryBadge()}
          {getNftRequirementBadge()}
          {getStatusBadge()}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white mb-1 truncate">{flag.location_type}</h3>
        <p className="text-gray-400 text-sm mb-2 truncate">{flag.name}</p>
        {showMunicipality && flag.municipality && (
          <p className="text-gray-500 text-xs mb-2">{flag.municipality.name}</p>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
          {/* MULTI-NFT: Show total price and per-NFT breakdown if grouped */}
          <div className="flex flex-col">
            <span className="text-primary font-medium">
              {config.formatPrice(totalPrice)} MATIC
            </span>
            {nftsRequired > 1 && (
              <span className="text-gray-500 text-xs">
                ({config.formatPrice(flag.price)} x {nftsRequired})
              </span>
            )}
          </div>
          <span className="text-gray-500 text-sm">{flag.interest_count || 0} interested</span>
        </div>
      </div>
    </Link>
  );
};

export default FlagCard;
