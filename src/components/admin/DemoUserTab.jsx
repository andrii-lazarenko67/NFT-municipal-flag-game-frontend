/**
 * DemoUserTab - Admin interface for demo user management
 */
import { useState } from 'react';
import {
  createDemoUser,
  seedDemoUserOwnership,
  deleteDemoUser,
} from '../../store/slices/adminSlice';

const DemoUserTab = ({ demoUser, dispatch, loading, actionLoading }) => {
  const [flagCount, setFlagCount] = useState(5);
  const [categories, setCategories] = useState(['standard', 'plus', 'premium']);

  const handleCreateDemoUser = () => {
    dispatch(createDemoUser());
  };

  const handleSeedOwnership = () => {
    if (!demoUser?.user?.id) {
      alert('Please create a demo user first');
      return;
    }
    dispatch(seedDemoUserOwnership({
      user_id: demoUser.user.id,
      flag_count: flagCount,
      include_categories: categories,
    }));
  };

  const handleDeleteDemoUser = () => {
    if (window.confirm('Are you sure you want to delete the demo user and all their data?')) {
      dispatch(deleteDemoUser());
    }
  };

  const toggleCategory = (cat) => {
    if (categories.includes(cat)) {
      setCategories(categories.filter(c => c !== cat));
    } else {
      setCategories([...categories, cat]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Demo User Info */}
      <div className="card p-6" data-animate="fade-up" data-duration="normal">
        <h3 className="text-xl font-bold text-white mb-4">Demo User Management</h3>
        <p className="text-gray-400 mb-6">
          Create a demo user for testing and presentation purposes. The demo user can own flags,
          participate in auctions, and demonstrate all platform features.
        </p>

        {demoUser?.user ? (
          <div className="space-y-6">
            {/* User Details */}
            <UserDetails user={demoUser.user} onDelete={handleDeleteDemoUser} actionLoading={actionLoading} />

            {/* Seed Ownership */}
            <SeedOwnershipForm
              flagCount={flagCount}
              setFlagCount={setFlagCount}
              categories={categories}
              toggleCategory={toggleCategory}
              onSeed={handleSeedOwnership}
              actionLoading={actionLoading}
            />
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No demo user exists yet.</p>
            <button
              onClick={handleCreateDemoUser}
              disabled={loading || actionLoading}
              className="btn btn-primary"
            >
              {loading || actionLoading ? 'Creating...' : 'Create Demo User'}
            </button>
          </div>
        )}
      </div>

      {/* Demo User Credentials Info */}
      <DemoCredentials />
    </div>
  );
};

const UserDetails = ({ user, onDelete, actionLoading }) => (
  <div className="bg-dark-darker rounded-[3px] p-4" data-animate="fade-right" data-duration="fast">
    <h4 className="text-white font-semibold mb-4">Demo User Details</h4>
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <span className="text-gray-500 text-sm block">User ID</span>
        <span className="text-white font-medium">{user.id}</span>
      </div>
      <div>
        <span className="text-gray-500 text-sm block">Username</span>
        <span className="text-white font-medium">{user.username || 'Not set'}</span>
      </div>
      <div>
        <span className="text-gray-500 text-sm block">Wallet Address</span>
        <span className="text-primary font-mono text-sm break-all">{user.wallet_address}</span>
      </div>
      <div>
        <span className="text-gray-500 text-sm block">Reputation Score</span>
        <span className="text-white font-medium">{user.reputation_score}</span>
      </div>
      <div>
        <span className="text-gray-500 text-sm block">Flags Owned</span>
        <span className="text-green-400 font-medium">{user.flags_owned}</span>
      </div>
      <div>
        <span className="text-gray-500 text-sm block">Followers</span>
        <span className="text-white font-medium">{user.followers_count}</span>
      </div>
      <div>
        <span className="text-gray-500 text-sm block">Following</span>
        <span className="text-white font-medium">{user.following_count}</span>
      </div>
      <div>
        <span className="text-gray-500 text-sm block">Created At</span>
        <span className="text-white text-sm">{new Date(user.created_at).toLocaleDateString()}</span>
      </div>
    </div>

    <div className="mt-4 flex gap-4">
      <button
        onClick={() => window.location.href = `/profile/${user.wallet_address}`}
        className="btn btn-secondary"
      >
        View Profile Page
      </button>
      <button
        onClick={onDelete}
        disabled={actionLoading}
        className="btn bg-red-600 hover:bg-red-700 text-white"
      >
        {actionLoading ? 'Deleting...' : 'Delete Demo User'}
      </button>
    </div>
  </div>
);

const SeedOwnershipForm = ({ flagCount, setFlagCount, categories, toggleCategory, onSeed, actionLoading }) => (
  <div className="bg-dark-darker rounded-[3px] p-4" data-animate="fade-right" data-duration="fast">
    <h4 className="text-white font-semibold mb-4">Seed Flag Ownerships</h4>
    <p className="text-gray-400 text-sm mb-4">
      Assign flag ownerships to the demo user to demonstrate the profile and collection features.
    </p>

    <div className="flex flex-wrap gap-4 mb-4">
      <div>
        <label className="text-gray-400 text-sm block mb-1">Number of Flags</label>
        <input
          type="number"
          min="1"
          max="50"
          value={flagCount}
          onChange={(e) => setFlagCount(parseInt(e.target.value) || 5)}
          className="input w-32"
        />
      </div>
      <div>
        <label className="text-gray-400 text-sm block mb-1">Categories</label>
        <div className="flex gap-2">
          {['standard', 'plus', 'premium'].map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-1 rounded text-sm capitalize ${
                categories.includes(cat)
                  ? cat === 'premium' ? 'bg-yellow-500/30 text-yellow-400 border border-yellow-500/50'
                  : cat === 'plus' ? 'bg-blue-500/30 text-blue-400 border border-blue-500/50'
                  : 'bg-gray-500/30 text-gray-400 border border-gray-500/50'
                  : 'bg-dark text-gray-600 border border-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>

    <button
      onClick={onSeed}
      disabled={actionLoading || categories.length === 0}
      className="btn btn-primary"
    >
      {actionLoading ? 'Seeding...' : `Seed ${flagCount} Flag Ownerships`}
    </button>
  </div>
);

const DemoCredentials = () => (
  <div className="card p-6" data-animate="fade-up" data-duration="normal">
    <h3 className="text-lg font-bold text-white mb-4">Demo User Credentials</h3>
    <p className="text-gray-400 mb-4">
      Use these credentials to test the platform as the demo user:
    </p>
    <div className="bg-dark-darker rounded-[3px] p-4 space-y-2">
      <div>
        <span className="text-gray-500 text-sm">Default Wallet Address:</span>
        <code className="block text-primary font-mono text-sm mt-1">
          0xdemo000000000000000000000000000000000001
        </code>
      </div>
      <p className="text-gray-500 text-sm mt-4">
        Note: To connect as the demo user, you would need to import this address into MetaMask
        (requires corresponding private key). For presentation, you can view the profile page directly.
      </p>
    </div>
  </div>
);

export default DemoUserTab;
