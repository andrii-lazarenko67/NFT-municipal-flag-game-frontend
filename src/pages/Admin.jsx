/**
 * Admin Page - Complete CRUD management interface
 *
 * VISUAL ADMIN CRUD INTERFACE:
 * - Tab-based navigation: Stats | Countries | Regions | Municipalities | Flags
 * - Create, Read, Update, Delete operations for all entities
 * - Hierarchical filtering (Country → Region → Municipality → Flag)
 */
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  authenticate,
  logout,
  fetchAdminStats,
  fetchAdminCountries,
  fetchAdminRegions,
  fetchAdminMunicipalities,
  fetchAdminFlags,
  fetchIpfsStatus,
  fetchDemoUser,
  selectAdminAuthenticated,
  selectAdminStats,
  selectAdminCountries,
  selectAdminRegions,
  selectAdminMunicipalities,
  selectAdminFlags,
  selectAdminIpfsStatus,
  selectDemoUser,
  selectNftGenerationResult,
  selectNftGenerating,
  selectStreetViewAvailable,
  selectAdminLoading,
  selectAdminActionLoading,
  selectAdminMessage,
  selectAdminError,
  clearMessage,
} from '../store/slices/adminSlice';
// Admin Tab Components
import {
  StatsTab,
  CountriesTab,
  RegionsTab,
  MunicipalitiesTab,
  FlagsTab,
  GenerateNFTTab,
  DemoUserTab,
  UtilitiesTab,
} from '../components/admin';

const TABS = ['Stats', 'Countries', 'Regions', 'Municipalities', 'Flags', 'Generate NFT', 'Demo User', 'Utilities'];

// Login Screen Component
const AdminLogin = ({ onAuth, loading, error }) => {
  const [adminKey, setAdminKey] = useState('');

  const handleSubmit = () => onAuth(adminKey);

  return (
    <div className="page-container">
      <div className="max-w-md mx-auto py-20">
        <div className="card p-8" data-animate="zoom-in" data-duration="normal">
          <h1 className="text-2xl font-bold text-white mb-2 text-center">
            Admin Panel
          </h1>
          <p className="text-gray-400 text-center mb-6">
            Enter your admin API key to continue
          </p>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Admin API Key"
            className="input mb-4"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Authenticating...' : 'Access Admin'}
          </button>
          {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
};

// Main Admin Dashboard Component
const AdminDashboard = ({
  stats, countries, regions, municipalities, flags, ipfsStatus, demoUser,
  nftGenerationResult, nftGenerating, streetViewAvailable,
  loading, actionLoading, message, error, dispatch, onLogout
}) => {
  const [activeTab, setActiveTab] = useState('Stats');

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title" data-animate="fade-right" data-duration="normal">
          Admin Panel
        </h1>
        <button
          onClick={onLogout}
          className="btn btn-secondary"
          data-animate="fade-left"
          data-duration="fast"
        >
          Logout
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="mb-6 p-4 bg-green-600/20 border border-green-600/50 rounded-[3px] text-green-400">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-600/20 border border-red-600/50 rounded-[3px] text-red-400">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div
        className="flex gap-2 mb-6 overflow-x-auto pb-2"
        data-animate="fade-up"
        data-duration="normal"
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-[3px] font-medium transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'bg-primary text-white'
                : 'bg-dark-lighter text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'Stats' && <StatsTab stats={stats} />}
        {activeTab === 'Countries' && (
          <CountriesTab
            countries={countries}
            dispatch={dispatch}
            actionLoading={actionLoading}
          />
        )}
        {activeTab === 'Regions' && (
          <RegionsTab
            regions={regions}
            countries={countries}
            dispatch={dispatch}
            actionLoading={actionLoading}
          />
        )}
        {activeTab === 'Municipalities' && (
          <MunicipalitiesTab
            municipalities={municipalities}
            regions={regions}
            dispatch={dispatch}
            actionLoading={actionLoading}
          />
        )}
        {activeTab === 'Flags' && (
          <FlagsTab
            flags={flags}
            municipalities={municipalities}
            dispatch={dispatch}
            actionLoading={actionLoading}
          />
        )}
        {activeTab === 'Generate NFT' && (
          <GenerateNFTTab
            municipalities={municipalities}
            dispatch={dispatch}
            nftGenerationResult={nftGenerationResult}
            nftGenerating={nftGenerating}
            streetViewAvailable={streetViewAvailable}
          />
        )}
        {activeTab === 'Demo User' && (
          <DemoUserTab
            demoUser={demoUser}
            dispatch={dispatch}
            loading={loading}
            actionLoading={actionLoading}
          />
        )}
        {activeTab === 'Utilities' && (
          <UtilitiesTab
            ipfsStatus={ipfsStatus}
            dispatch={dispatch}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

// Main Admin Component (Router)
const Admin = () => {
  const dispatch = useDispatch();

  // Redux selectors
  const authenticated = useSelector(selectAdminAuthenticated);
  const stats = useSelector(selectAdminStats);
  const countries = useSelector(selectAdminCountries);
  const regions = useSelector(selectAdminRegions);
  const municipalities = useSelector(selectAdminMunicipalities);
  const flags = useSelector(selectAdminFlags);
  const ipfsStatus = useSelector(selectAdminIpfsStatus);
  const demoUser = useSelector(selectDemoUser);
  const nftGenerationResult = useSelector(selectNftGenerationResult);
  const nftGenerating = useSelector(selectNftGenerating);
  const streetViewAvailable = useSelector(selectStreetViewAvailable);
  const loading = useSelector(selectAdminLoading);
  const actionLoading = useSelector(selectAdminActionLoading);
  const message = useSelector(selectAdminMessage);
  const error = useSelector(selectAdminError);

  // Load data when authenticated
  useEffect(() => {
    if (authenticated) {
      dispatch(fetchAdminStats());
      dispatch(fetchAdminCountries());
      dispatch(fetchAdminRegions());
      dispatch(fetchAdminMunicipalities());
      dispatch(fetchAdminFlags());
      dispatch(fetchIpfsStatus());
      dispatch(fetchDemoUser());
    }
  }, [dispatch, authenticated]);

  // Auto-clear messages
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => dispatch(clearMessage()), 5000);
      return () => clearTimeout(timer);
    }
  }, [dispatch, message, error]);

  const handleAuth = (adminKey) => dispatch(authenticate(adminKey));
  const handleLogout = () => dispatch(logout());

  if (!authenticated) {
    return <AdminLogin onAuth={handleAuth} loading={loading} error={error} />;
  }

  return (
    <AdminDashboard
      stats={stats}
      countries={countries}
      regions={regions}
      municipalities={municipalities}
      flags={flags}
      ipfsStatus={ipfsStatus}
      demoUser={demoUser}
      nftGenerationResult={nftGenerationResult}
      nftGenerating={nftGenerating}
      streetViewAvailable={streetViewAvailable}
      loading={loading}
      actionLoading={actionLoading}
      message={message}
      error={error}
      dispatch={dispatch}
      onLogout={handleLogout}
    />
  );
};

export default Admin;
