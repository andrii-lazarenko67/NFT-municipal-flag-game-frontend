/**
 * UtilitiesTab - Admin interface for utility operations
 */
import { seedDemoData, syncIpfsFromPinata, fetchIpfsStatus } from '../../store/slices/adminSlice';
import { usePageLoadAnimation } from '../../hooks/useAnimation';

const UtilitiesTab = ({ ipfsStatus, dispatch, loading }) => {
  const pageRef = usePageLoadAnimation(50);
  const handleSeedDemo = () => {
    if (window.confirm('This will seed demo data. Are you sure?')) {
      dispatch(seedDemoData());
    }
  };

  const handleSyncIpfs = () => {
    dispatch(syncIpfsFromPinata()).then(() => {
      dispatch(fetchIpfsStatus());
    });
  };

  return (
    <div ref={pageRef} className="space-y-8">
      {/* Demo Data */}
      <div className="card p-6" data-animate="fade-up" data-duration="normal">
        <h3 className="text-xl font-bold text-white mb-4">Seed Demo Data</h3>
        <p className="text-gray-400 mb-4">
          Seed the database with demo countries, regions, municipalities, and flags for testing.
        </p>
        <button onClick={handleSeedDemo} disabled={loading} className="btn btn-primary">
          {loading ? 'Seeding...' : 'Seed Demo Data'}
        </button>
      </div>

      {/* IPFS Sync */}
      <div className="card p-6" data-animate="fade-up" data-duration="normal" data-delay="1">
        <h3 className="text-xl font-bold text-white mb-4">IPFS Image Sync</h3>
        <p className="text-gray-400 mb-4">
          Sync flag images from Pinata IPFS. This updates the database with the latest image hashes.
        </p>
        {ipfsStatus && <IpfsStatusGrid status={ipfsStatus} />}
        <button onClick={handleSyncIpfs} disabled={loading} className="btn btn-secondary">
          {loading ? 'Syncing...' : 'Sync Images from Pinata'}
        </button>
      </div>
    </div>
  );
};

const IpfsStatusGrid = ({ status }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4" data-animate="zoom-in" data-duration="fast" data-delay="2">
    <div className="bg-dark-darker p-3 rounded text-center">
      <span className="text-primary font-bold block text-xl">{status.total_flags}</span>
      <span className="text-gray-500 text-sm">Total Flags</span>
    </div>
    <div className="bg-dark-darker p-3 rounded text-center">
      <span className="text-green-400 font-bold block text-xl">{status.flags_with_image_hash}</span>
      <span className="text-gray-500 text-sm">With Images</span>
    </div>
    <div className="bg-dark-darker p-3 rounded text-center">
      <span className="text-blue-400 font-bold block text-xl">{status.flags_with_metadata_hash}</span>
      <span className="text-gray-500 text-sm">With Metadata</span>
    </div>
    <div className="bg-dark-darker p-3 rounded text-center">
      <span className="text-yellow-400 font-bold block text-xl">{status.flags_pending_upload}</span>
      <span className="text-gray-500 text-sm">Pending</span>
    </div>
  </div>
);

export default UtilitiesTab;
