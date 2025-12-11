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
  createCountry,
  updateCountry,
  deleteCountry,
  toggleCountryVisibility,
  createRegion,
  updateRegion,
  deleteRegion,
  toggleRegionVisibility,
  createMunicipality,
  updateMunicipality,
  deleteMunicipality,
  toggleMunicipalityVisibility,
  createFlag,
  updateFlag,
  seedDemoData,
  syncIpfsFromPinata,
  fetchIpfsStatus,
  createDemoUser,
  fetchDemoUser,
  seedDemoUserOwnership,
  deleteDemoUser,
  createNFTFromCoordinates,
  checkStreetView,
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
import { useNavigate } from 'react-router-dom';
import config from '../config';
import { usePageLoadAnimation, useAnimation } from '../hooks/useAnimation';

const TABS = ['Stats', 'Countries', 'Regions', 'Municipalities', 'Flags', 'Generate NFT', 'Demo User', 'Utilities'];

const Admin = () => {
  const dispatch = useDispatch();
  const [adminKey, setAdminKey] = useState('');
  const [activeTab, setActiveTab] = useState('Stats');

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

  const handleAuth = () => dispatch(authenticate(adminKey));
  const handleLogout = () => dispatch(logout());

  // Animation hooks
  const headerRef = usePageLoadAnimation(100);
  const { ref: contentRef } = useAnimation({ threshold: 0.1 });

  // ==========================================================================
  // AUTHENTICATION SCREEN
  // ==========================================================================
  if (!authenticated) {
    return (
      <div className="page-container">
        <div className="max-w-md mx-auto py-20">
          <div
            className="card p-8"
            data-animate="zoom-in"
            data-duration="normal"
            data-delay="0"
          >
            <h1
              className="text-2xl font-bold text-white mb-2 text-center"
              data-animate="fade-down"
              data-duration="fast"
              data-delay="1"
            >
              Admin Panel
            </h1>
            <p
              className="text-gray-400 text-center mb-6"
              data-animate="fade-up"
              data-duration="fast"
              data-delay="2"
            >
              Enter your admin API key to continue
            </p>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Admin API Key"
              className="input mb-4"
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              data-animate="fade-up"
              data-duration="fast"
              data-delay="3"
            />
            <button
              onClick={handleAuth}
              disabled={loading}
              className="btn btn-primary w-full"
              data-animate="fade-up"
              data-duration="fast"
              data-delay="4"
            >
              {loading ? 'Authenticating...' : 'Access Admin'}
            </button>
            {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // MAIN ADMIN INTERFACE
  // ==========================================================================
  return (
    <div className="page-container">
      {/* Header */}
      <div ref={headerRef} className="flex justify-between items-center mb-6">
        <h1
          className="page-title"
          data-animate="fade-right"
          data-duration="normal"
          data-delay="0"
        >
          Admin Panel
        </h1>
        <button
          onClick={handleLogout}
          className="btn btn-secondary"
          data-animate="fade-left"
          data-duration="fast"
          data-delay="1"
        >
          Logout
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div
          className="mb-6 p-4 bg-green-600/20 border border-green-600/50 rounded-lg text-green-400"
          data-animate="fade-down"
          data-duration="fast"
        >
          {message}
        </div>
      )}
      {error && (
        <div
          className="mb-6 p-4 bg-red-600/20 border border-red-600/50 rounded-lg text-red-400"
          data-animate="fade-down"
          data-duration="fast"
        >
          {error}
        </div>
      )}

      {/* Tabs */}
      <div
        className="flex gap-2 mb-6 overflow-x-auto pb-2"
        data-animate="fade-up"
        data-duration="normal"
        data-delay="2"
      >
        {TABS.map((tab, index) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            data-animate="fade-up"
            data-duration="fast"
            data-delay={String(index % 8)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
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
      <div ref={contentRef}>
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

// =============================================================================
// STATS TAB
// =============================================================================
const StatsTab = ({ stats }) => {
  if (!stats) return <div className="text-gray-500">Loading statistics...</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatCard label="Countries" value={stats.total_countries} />
      <StatCard label="Regions" value={stats.total_regions} />
      <StatCard label="Municipalities" value={stats.total_municipalities} />
      <StatCard label="Flags" value={stats.total_flags} />
      <StatCard label="Users" value={stats.total_users} />
      <StatCard label="Interests" value={stats.total_interests} />
      <StatCard label="Ownerships" value={stats.total_ownerships} />
      <StatCard label="Auctions" value={stats.total_auctions} />
      <StatCard label="Active Auctions" value={stats.active_auctions} />
      <StatCard label="Completed Pairs" value={stats.completed_pairs} />
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="card p-4 text-center">
    <span className="text-2xl font-bold text-primary block">{value}</span>
    <span className="text-gray-400 text-sm">{label}</span>
  </div>
);

// =============================================================================
// COUNTRIES TAB
// =============================================================================
const CountriesTab = ({ countries, dispatch, actionLoading }) => {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', is_visible: true });

  const resetForm = () => {
    setFormData({ name: '', code: '', is_visible: true });
    setEditItem(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editItem) {
      await dispatch(updateCountry({ countryId: editItem.id, countryData: formData }));
    } else {
      await dispatch(createCountry(formData));
    }
    resetForm();
  };

  const handleEdit = (country) => {
    setFormData({ name: country.name, code: country.code, is_visible: country.is_visible });
    setEditItem(country);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this country? This will also delete all regions, municipalities, and flags.')) {
      dispatch(deleteCountry(id));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Countries ({countries.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? 'Cancel' : 'Add Country'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <h3 className="text-white font-semibold mb-4">{editItem ? 'Edit Country' : 'Add New Country'}</h3>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Country Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
            />
            <input
              type="text"
              placeholder="Code (e.g., ESP)"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="input"
              maxLength={3}
              required
            />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-gray-400">
                <input
                  type="checkbox"
                  checked={formData.is_visible}
                  onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                />
                Visible
              </label>
              <button type="submit" disabled={actionLoading} className="btn btn-primary">
                {actionLoading ? 'Saving...' : editItem ? 'Update' : 'Create'}
              </button>
              {editItem && (
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-darker">
            <tr>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">ID</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Name</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Code</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Regions</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Visible</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {countries.map((country) => (
              <tr key={country.id} className="hover:bg-gray-800/50">
                <td className="px-4 py-3 text-gray-300">{country.id}</td>
                <td className="px-4 py-3 text-white">{country.name}</td>
                <td className="px-4 py-3 text-gray-400">{country.code}</td>
                <td className="px-4 py-3 text-gray-400">{country.region_count || 0}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${country.is_visible ? 'badge-available' : 'bg-gray-600'}`}>
                    {country.is_visible ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(country)} className="text-blue-400 hover:text-blue-300">
                      Edit
                    </button>
                    <button
                      onClick={() => dispatch(toggleCountryVisibility({ countryId: country.id, isVisible: country.is_visible }))}
                      className={country.is_visible ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'}
                    >
                      {country.is_visible ? 'Hide' : 'Show'}
                    </button>
                    <button onClick={() => handleDelete(country.id)} className="text-red-400 hover:text-red-300">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {countries.length === 0 && (
          <div className="p-8 text-center text-gray-500">No countries found.</div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// REGIONS TAB
// =============================================================================
const RegionsTab = ({ regions, countries, dispatch, actionLoading }) => {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterCountryId, setFilterCountryId] = useState('');
  const [formData, setFormData] = useState({ name: '', country_id: '', is_visible: true });

  const filteredRegions = filterCountryId
    ? regions.filter((r) => r.country_id === parseInt(filterCountryId))
    : regions;

  const resetForm = () => {
    setFormData({ name: '', country_id: '', is_visible: true });
    setEditItem(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...formData, country_id: parseInt(formData.country_id) };
    if (editItem) {
      await dispatch(updateRegion({ regionId: editItem.id, regionData: data }));
    } else {
      await dispatch(createRegion(data));
    }
    resetForm();
  };

  const handleEdit = (region) => {
    setFormData({ name: region.name, country_id: region.country_id.toString(), is_visible: region.is_visible });
    setEditItem(region);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this region and all its municipalities/flags?')) {
      dispatch(deleteRegion(id));
    }
  };

  const getCountryName = (countryId) => countries.find((c) => c.id === countryId)?.name || 'Unknown';

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h2 className="text-xl font-bold text-white">Regions ({filteredRegions.length})</h2>
        <div className="flex gap-4">
          <select
            value={filterCountryId}
            onChange={(e) => setFilterCountryId(e.target.value)}
            className="input"
          >
            <option value="">All Countries</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? 'Cancel' : 'Add Region'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card p-6 mb-6">
          <h3 className="text-white font-semibold mb-4">{editItem ? 'Edit Region' : 'Add New Region'}</h3>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Region Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
            />
            <select
              value={formData.country_id}
              onChange={(e) => setFormData({ ...formData, country_id: e.target.value })}
              className="input"
              required
            >
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-gray-400">
              <input
                type="checkbox"
                checked={formData.is_visible}
                onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
              />
              Visible
            </label>
            <div className="flex gap-2">
              <button type="submit" disabled={actionLoading} className="btn btn-primary">
                {actionLoading ? 'Saving...' : editItem ? 'Update' : 'Create'}
              </button>
              {editItem && <button type="button" onClick={resetForm} className="btn btn-secondary">Cancel</button>}
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-darker">
            <tr>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">ID</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Name</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Country</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Municipalities</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Visible</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredRegions.map((region) => (
              <tr key={region.id} className="hover:bg-gray-800/50">
                <td className="px-4 py-3 text-gray-300">{region.id}</td>
                <td className="px-4 py-3 text-white">{region.name}</td>
                <td className="px-4 py-3 text-gray-400">{getCountryName(region.country_id)}</td>
                <td className="px-4 py-3 text-gray-400">{region.municipality_count || 0}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${region.is_visible ? 'badge-available' : 'bg-gray-600'}`}>
                    {region.is_visible ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(region)} className="text-blue-400 hover:text-blue-300">Edit</button>
                    <button
                      onClick={() => dispatch(toggleRegionVisibility({ regionId: region.id, isVisible: region.is_visible }))}
                      className={region.is_visible ? 'text-yellow-400' : 'text-green-400'}
                    >
                      {region.is_visible ? 'Hide' : 'Show'}
                    </button>
                    <button onClick={() => handleDelete(region.id)} className="text-red-400 hover:text-red-300">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRegions.length === 0 && (
          <div className="p-8 text-center text-gray-500">No regions found.</div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// MUNICIPALITIES TAB
// =============================================================================
const MunicipalitiesTab = ({ municipalities, regions, dispatch, actionLoading }) => {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterRegionId, setFilterRegionId] = useState('');
  const [formData, setFormData] = useState({ name: '', region_id: '', latitude: '', longitude: '', is_visible: true });

  const filteredMunicipalities = filterRegionId
    ? municipalities.filter((m) => m.region_id === parseInt(filterRegionId))
    : municipalities;

  const resetForm = () => {
    setFormData({ name: '', region_id: '', latitude: '', longitude: '', is_visible: true });
    setEditItem(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      region_id: parseInt(formData.region_id),
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
    };
    if (editItem) {
      await dispatch(updateMunicipality({ municipalityId: editItem.id, municipalityData: data }));
    } else {
      await dispatch(createMunicipality(data));
    }
    resetForm();
  };

  const handleEdit = (municipality) => {
    setFormData({
      name: municipality.name,
      region_id: municipality.region_id.toString(),
      latitude: municipality.latitude.toString(),
      longitude: municipality.longitude.toString(),
      is_visible: municipality.is_visible,
    });
    setEditItem(municipality);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this municipality and all its flags?')) {
      dispatch(deleteMunicipality(id));
    }
  };

  const getRegionName = (regionId) => regions.find((r) => r.id === regionId)?.name || 'Unknown';

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h2 className="text-xl font-bold text-white">Municipalities ({filteredMunicipalities.length})</h2>
        <div className="flex gap-4">
          <select value={filterRegionId} onChange={(e) => setFilterRegionId(e.target.value)} className="input">
            <option value="">All Regions</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? 'Cancel' : 'Add Municipality'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card p-6 mb-6">
          <h3 className="text-white font-semibold mb-4">{editItem ? 'Edit Municipality' : 'Add New Municipality'}</h3>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            <input
              type="text"
              placeholder="Municipality Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
            />
            <select
              value={formData.region_id}
              onChange={(e) => setFormData({ ...formData, region_id: e.target.value })}
              className="input"
              required
            >
              <option value="">Select Region</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              className="input"
              required
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              className="input"
              required
            />
            <label className="flex items-center gap-2 text-gray-400">
              <input
                type="checkbox"
                checked={formData.is_visible}
                onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
              />
              Visible
            </label>
            <div className="flex gap-2">
              <button type="submit" disabled={actionLoading} className="btn btn-primary">
                {actionLoading ? 'Saving...' : editItem ? 'Update' : 'Create'}
              </button>
              {editItem && <button type="button" onClick={resetForm} className="btn btn-secondary">Cancel</button>}
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-darker">
            <tr>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">ID</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Name</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Region</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Coordinates</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Flags</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Visible</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredMunicipalities.map((m) => (
              <tr key={m.id} className="hover:bg-gray-800/50">
                <td className="px-4 py-3 text-gray-300">{m.id}</td>
                <td className="px-4 py-3 text-white">{m.name}</td>
                <td className="px-4 py-3 text-gray-400">{getRegionName(m.region_id)}</td>
                <td className="px-4 py-3 text-gray-400 text-sm">{m.coordinates}</td>
                <td className="px-4 py-3 text-gray-400">{m.flag_count || 0}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${m.is_visible ? 'badge-available' : 'bg-gray-600'}`}>
                    {m.is_visible ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(m)} className="text-blue-400 hover:text-blue-300">Edit</button>
                    <button
                      onClick={() => dispatch(toggleMunicipalityVisibility({ municipalityId: m.id, isVisible: m.is_visible }))}
                      className={m.is_visible ? 'text-yellow-400' : 'text-green-400'}
                    >
                      {m.is_visible ? 'Hide' : 'Show'}
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="text-red-400 hover:text-red-300">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredMunicipalities.length === 0 && (
          <div className="p-8 text-center text-gray-500">No municipalities found.</div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// FLAGS TAB
// =============================================================================
const FlagsTab = ({ flags, municipalities, dispatch, actionLoading }) => {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterMunicipalityId, setFilterMunicipalityId] = useState('');
  const [formData, setFormData] = useState({
    name: '', municipality_id: '', location_type: '', category: 'standard', nfts_required: '1', price: '0.01',
  });

  const filteredFlags = filterMunicipalityId
    ? flags.filter((f) => f.municipality_id === parseInt(filterMunicipalityId))
    : flags;

  const resetForm = () => {
    setFormData({ name: '', municipality_id: '', location_type: '', category: 'standard', nfts_required: '1', price: '0.01' });
    setEditItem(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      municipality_id: parseInt(formData.municipality_id),
      nfts_required: parseInt(formData.nfts_required),
      price: formData.price,
    };
    if (editItem) {
      await dispatch(updateFlag({ flagId: editItem.id, flagData: data }));
    } else {
      await dispatch(createFlag(data));
    }
    resetForm();
  };

  const handleEdit = (flag) => {
    setFormData({
      name: flag.name,
      municipality_id: flag.municipality_id.toString(),
      location_type: flag.location_type,
      category: flag.category,
      nfts_required: flag.nfts_required.toString(),
      price: flag.price.toString(),
    });
    setEditItem(flag);
    setShowForm(true);
  };

  const getMunicipalityName = (id) => municipalities.find((m) => m.id === id)?.name || 'Unknown';

  const getCategoryBadge = (category) => {
    const classes = {
      standard: 'bg-gray-500/20 text-gray-400',
      plus: 'bg-blue-500/20 text-blue-400',
      premium: 'bg-yellow-500/20 text-yellow-400',
    };
    return classes[category] || classes.standard;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h2 className="text-xl font-bold text-white">Flags ({filteredFlags.length})</h2>
        <div className="flex gap-4">
          <select value={filterMunicipalityId} onChange={(e) => setFilterMunicipalityId(e.target.value)} className="input">
            <option value="">All Municipalities</option>
            {municipalities.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? 'Cancel' : 'Add Flag'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card p-6 mb-6">
          <h3 className="text-white font-semibold mb-4">{editItem ? 'Edit Flag' : 'Add New Flag'}</h3>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Flag Name (Coordinates)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
            />
            <select
              value={formData.municipality_id}
              onChange={(e) => setFormData({ ...formData, municipality_id: e.target.value })}
              className="input"
              required
            >
              <option value="">Select Municipality</option>
              {municipalities.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Location Type (e.g., fire station)"
              value={formData.location_type}
              onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
              className="input"
              required
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
            >
              <option value="standard">Standard</option>
              <option value="plus">Plus</option>
              <option value="premium">Premium</option>
            </select>
            <input
              type="number"
              min="1"
              max="10"
              placeholder="NFTs Required"
              value={formData.nfts_required}
              onChange={(e) => setFormData({ ...formData, nfts_required: e.target.value })}
              className="input"
              required
            />
            <input
              type="number"
              step="0.001"
              min="0"
              placeholder="Price (MATIC)"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="input"
              required
            />
            <div className="flex gap-2 md:col-span-2">
              <button type="submit" disabled={actionLoading} className="btn btn-primary">
                {actionLoading ? 'Saving...' : editItem ? 'Update' : 'Create'}
              </button>
              {editItem && <button type="button" onClick={resetForm} className="btn btn-secondary">Cancel</button>}
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-darker">
            <tr>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">ID</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Name</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Municipality</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Type</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Category</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">NFTs</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Price</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Status</th>
              <th className="px-4 py-3 text-left text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredFlags.map((flag) => (
              <tr key={flag.id} className="hover:bg-gray-800/50">
                <td className="px-4 py-3 text-gray-300">{flag.id}</td>
                <td className="px-4 py-3 text-white text-sm">{flag.name}</td>
                <td className="px-4 py-3 text-gray-400">{getMunicipalityName(flag.municipality_id)}</td>
                <td className="px-4 py-3 text-gray-400">{flag.location_type}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${getCategoryBadge(flag.category)}`}>
                    {flag.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">{flag.nfts_required}</td>
                <td className="px-4 py-3 text-primary">{flag.price} POL</td>
                <td className="px-4 py-3">
                  <span className={`badge ${flag.is_pair_complete ? 'badge-claimed' : 'badge-available'}`}>
                    {flag.is_pair_complete ? 'Complete' : 'Available'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleEdit(flag)} className="text-blue-400 hover:text-blue-300">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredFlags.length === 0 && (
          <div className="p-8 text-center text-gray-500">No flags found.</div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// GENERATE NFT TAB
// =============================================================================
const GenerateNFTTab = ({ municipalities, dispatch, nftGenerationResult, nftGenerating, streetViewAvailable }) => {
  const [formData, setFormData] = useState({
    latitude: '',
    longitude: '',
    municipality_id: '',
    location_type: '',
    category: 'standard',
    nfts_required: '1',
    custom_name: '',
    custom_prompt: '',
    heading: '',
  });

  const handleCheckStreetView = () => {
    if (!formData.latitude || !formData.longitude) {
      alert('Please enter latitude and longitude');
      return;
    }
    dispatch(checkStreetView({
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
    }));
  };

  const handleGenerateNFT = () => {
    if (!formData.latitude || !formData.longitude || !formData.municipality_id || !formData.location_type) {
      alert('Please fill in all required fields (latitude, longitude, municipality, location type)');
      return;
    }

    const payload = {
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      municipality_id: parseInt(formData.municipality_id),
      location_type: formData.location_type,
      category: formData.category,
      nfts_required: parseInt(formData.nfts_required),
    };

    if (formData.custom_name?.trim()) {
      payload.custom_name = formData.custom_name.trim();
    }
    if (formData.custom_prompt?.trim()) {
      payload.custom_prompt = formData.custom_prompt.trim();
    }
    if (formData.heading) {
      payload.heading = parseInt(formData.heading);
    }

    dispatch(createNFTFromCoordinates(payload));
  };

  const resetForm = () => {
    setFormData({
      latitude: '',
      longitude: '',
      municipality_id: '',
      location_type: '',
      category: 'standard',
      nfts_required: '1',
      custom_name: '',
      custom_prompt: '',
      heading: '',
    });
  };

  return (
    <div className="space-y-8">
      {/* NFT Generation Form */}
      <div className="card p-6">
        <h3 className="text-xl font-bold text-white mb-4">Generate NFT from Coordinates</h3>
        <p className="text-gray-400 mb-6">
          Enter coordinates to fetch a Google Street View image, transform it with AI into a flag-style design,
          upload to IPFS, and create a new flag NFT in the database.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Coordinates */}
          <div>
            <label className="text-gray-400 text-sm block mb-1">Latitude *</label>
            <input
              type="number"
              step="any"
              placeholder="e.g., 40.4168"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Longitude *</label>
            <input
              type="number"
              step="any"
              placeholder="e.g., -3.7038"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Camera Heading (0-360)</label>
            <input
              type="number"
              min="0"
              max="360"
              placeholder="Optional, e.g., 90"
              value={formData.heading}
              onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
              className="input w-full"
            />
          </div>

          {/* Municipality & Location */}
          <div>
            <label className="text-gray-400 text-sm block mb-1">Municipality *</label>
            <select
              value={formData.municipality_id}
              onChange={(e) => setFormData({ ...formData, municipality_id: e.target.value })}
              className="input w-full"
              required
            >
              <option value="">Select Municipality</option>
              {municipalities.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Location Type *</label>
            <input
              type="text"
              placeholder="e.g., Town Hall, Fire Station"
              value={formData.location_type}
              onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input w-full"
            >
              <option value="standard">Standard</option>
              <option value="plus">Plus</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          {/* NFTs & Custom Options */}
          <div>
            <label className="text-gray-400 text-sm block mb-1">NFTs Required</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.nfts_required}
              onChange={(e) => setFormData({ ...formData, nfts_required: e.target.value })}
              className="input w-full"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Custom Name (optional)</label>
            <input
              type="text"
              placeholder="Auto-generated if empty"
              value={formData.custom_name}
              onChange={(e) => setFormData({ ...formData, custom_name: e.target.value })}
              className="input w-full"
            />
          </div>
          <div className="lg:col-span-1">
            <label className="text-gray-400 text-sm block mb-1">Custom AI Prompt (optional)</label>
            <input
              type="text"
              placeholder="Custom style transformation"
              value={formData.custom_prompt}
              onChange={(e) => setFormData({ ...formData, custom_prompt: e.target.value })}
              className="input w-full"
            />
          </div>
        </div>

        {/* Street View Check Status */}
        {streetViewAvailable !== null && (
          <div className={`mb-4 p-3 rounded-lg ${streetViewAvailable ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
            {streetViewAvailable
              ? 'Street View imagery is available at these coordinates.'
              : 'No Street View imagery available. Try different coordinates.'}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleCheckStreetView}
            disabled={nftGenerating || !formData.latitude || !formData.longitude}
            className="btn btn-secondary"
          >
            Check Street View
          </button>
          <button
            onClick={handleGenerateNFT}
            disabled={nftGenerating}
            className="btn btn-primary"
          >
            {nftGenerating ? 'Generating NFT...' : 'Generate NFT'}
          </button>
          <button onClick={resetForm} className="btn bg-gray-700 text-white hover:bg-gray-600">
            Reset Form
          </button>
        </div>

        {/* Loading Indicator */}
        {nftGenerating && (
          <div className="mt-6 p-4 bg-blue-600/20 border border-blue-600/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary" />
              <div>
                <p className="text-blue-400 font-medium">Generating NFT...</p>
                <p className="text-gray-400 text-sm">
                  This may take 1-3 minutes. Fetching Street View, transforming with AI, uploading to IPFS...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generation Result */}
      {nftGenerationResult && (
        <div className="card p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            {nftGenerationResult.success ? 'NFT Generated Successfully!' : 'Generation Failed'}
          </h3>

          {nftGenerationResult.success ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-dark-darker rounded-lg p-4">
                  <span className="text-gray-500 text-sm block">Flag ID</span>
                  <span className="text-white font-medium">{nftGenerationResult.flag_id}</span>
                </div>
                <div className="bg-dark-darker rounded-lg p-4">
                  <span className="text-gray-500 text-sm block">Flag Name</span>
                  <span className="text-white font-medium">{nftGenerationResult.flag_name}</span>
                </div>
                <div className="bg-dark-darker rounded-lg p-4">
                  <span className="text-gray-500 text-sm block">Coordinates</span>
                  <span className="text-white font-medium">{nftGenerationResult.coordinates}</span>
                </div>
                <div className="bg-dark-darker rounded-lg p-4">
                  <span className="text-gray-500 text-sm block">Metadata Hash (SHA-256)</span>
                  <span className="text-primary font-mono text-xs break-all">{nftGenerationResult.metadata_hash}</span>
                </div>
              </div>

              <div className="bg-dark-darker rounded-lg p-4">
                <span className="text-gray-500 text-sm block mb-2">Image IPFS Hash</span>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-mono text-sm break-all">{nftGenerationResult.image_ipfs_hash}</span>
                  <a
                    href={`${config.ipfsGateway}/${nftGenerationResult.image_ipfs_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary text-xs py-1 px-2"
                  >
                    View Image
                  </a>
                </div>
              </div>

              <div className="bg-dark-darker rounded-lg p-4">
                <span className="text-gray-500 text-sm block mb-2">Metadata IPFS Hash</span>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-mono text-sm break-all">{nftGenerationResult.metadata_ipfs_hash}</span>
                  <a
                    href={`${config.ipfsGateway}/${nftGenerationResult.metadata_ipfs_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary text-xs py-1 px-2"
                  >
                    View Metadata
                  </a>
                </div>
              </div>

              <p className="text-green-400 text-sm">{nftGenerationResult.message}</p>

              <button
                onClick={() => window.location.href = `/flags/${nftGenerationResult.flag_id}`}
                className="btn btn-primary"
              >
                View Flag Page
              </button>
            </div>
          ) : (
            <div className="text-red-400">
              <p>{nftGenerationResult.message || 'An error occurred during NFT generation.'}</p>
            </div>
          )}
        </div>
      )}

      {/* Pipeline Info */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-white mb-4">NFT Generation Pipeline</h3>
        <div className="grid md:grid-cols-5 gap-4 text-center">
          <div className="bg-dark-darker p-4 rounded-lg">
            <div className="text-2xl mb-2">1</div>
            <span className="text-gray-400 text-sm">Fetch Street View Image</span>
          </div>
          <div className="bg-dark-darker p-4 rounded-lg">
            <div className="text-2xl mb-2">2</div>
            <span className="text-gray-400 text-sm">AI Transformation (Replicate)</span>
          </div>
          <div className="bg-dark-darker p-4 rounded-lg">
            <div className="text-2xl mb-2">3</div>
            <span className="text-gray-400 text-sm">Upload Image to IPFS</span>
          </div>
          <div className="bg-dark-darker p-4 rounded-lg">
            <div className="text-2xl mb-2">4</div>
            <span className="text-gray-400 text-sm">Create & Upload Metadata</span>
          </div>
          <div className="bg-dark-darker p-4 rounded-lg">
            <div className="text-2xl mb-2">5</div>
            <span className="text-gray-400 text-sm">Save Flag to Database</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// DEMO USER TAB
// =============================================================================
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
      <div className="card p-6">
        <h3 className="text-xl font-bold text-white mb-4">Demo User Management</h3>
        <p className="text-gray-400 mb-6">
          Create a demo user for testing and presentation purposes. The demo user can own flags,
          participate in auctions, and demonstrate all platform features.
        </p>

        {demoUser?.user ? (
          <div className="space-y-6">
            {/* User Details */}
            <div className="bg-dark-darker rounded-lg p-4">
              <h4 className="text-white font-semibold mb-4">Demo User Details</h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <span className="text-gray-500 text-sm block">User ID</span>
                  <span className="text-white font-medium">{demoUser.user.id}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-sm block">Username</span>
                  <span className="text-white font-medium">{demoUser.user.username || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-sm block">Wallet Address</span>
                  <span className="text-primary font-mono text-sm break-all">{demoUser.user.wallet_address}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-sm block">Reputation Score</span>
                  <span className="text-white font-medium">{demoUser.user.reputation_score}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-sm block">Flags Owned</span>
                  <span className="text-green-400 font-medium">{demoUser.user.flags_owned}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-sm block">Followers</span>
                  <span className="text-white font-medium">{demoUser.user.followers_count}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-sm block">Following</span>
                  <span className="text-white font-medium">{demoUser.user.following_count}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-sm block">Created At</span>
                  <span className="text-white text-sm">{new Date(demoUser.user.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => window.location.href = `/profile/${demoUser.user.wallet_address}`}
                  className="btn btn-secondary"
                >
                  View Profile Page
                </button>
                <button
                  onClick={handleDeleteDemoUser}
                  disabled={actionLoading}
                  className="btn bg-red-600 hover:bg-red-700 text-white"
                >
                  {actionLoading ? 'Deleting...' : 'Delete Demo User'}
                </button>
              </div>
            </div>

            {/* Seed Ownership */}
            <div className="bg-dark-darker rounded-lg p-4">
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
                onClick={handleSeedOwnership}
                disabled={actionLoading || categories.length === 0}
                className="btn btn-primary"
              >
                {actionLoading ? 'Seeding...' : `Seed ${flagCount} Flag Ownerships`}
              </button>
            </div>
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

      {/* Demo User Info */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-white mb-4">Demo User Credentials</h3>
        <p className="text-gray-400 mb-4">
          Use these credentials to test the platform as the demo user:
        </p>
        <div className="bg-dark-darker rounded-lg p-4 space-y-2">
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
    </div>
  );
};

// =============================================================================
// UTILITIES TAB
// =============================================================================
const UtilitiesTab = ({ ipfsStatus, dispatch, loading }) => {
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
    <div className="space-y-8">
      {/* Demo Data */}
      <div className="card p-6">
        <h3 className="text-xl font-bold text-white mb-4">Seed Demo Data</h3>
        <p className="text-gray-400 mb-4">
          Seed the database with demo countries, regions, municipalities, and flags for testing.
        </p>
        <button onClick={handleSeedDemo} disabled={loading} className="btn btn-primary">
          {loading ? 'Seeding...' : 'Seed Demo Data'}
        </button>
      </div>

      {/* IPFS Sync */}
      <div className="card p-6">
        <h3 className="text-xl font-bold text-white mb-4">IPFS Image Sync</h3>
        <p className="text-gray-400 mb-4">
          Sync flag images from Pinata IPFS. This updates the database with the latest image hashes.
        </p>
        {ipfsStatus && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-dark-darker p-3 rounded text-center">
              <span className="text-primary font-bold block text-xl">{ipfsStatus.total_flags}</span>
              <span className="text-gray-500 text-sm">Total Flags</span>
            </div>
            <div className="bg-dark-darker p-3 rounded text-center">
              <span className="text-green-400 font-bold block text-xl">{ipfsStatus.flags_with_image_hash}</span>
              <span className="text-gray-500 text-sm">With Images</span>
            </div>
            <div className="bg-dark-darker p-3 rounded text-center">
              <span className="text-blue-400 font-bold block text-xl">{ipfsStatus.flags_with_metadata_hash}</span>
              <span className="text-gray-500 text-sm">With Metadata</span>
            </div>
            <div className="bg-dark-darker p-3 rounded text-center">
              <span className="text-yellow-400 font-bold block text-xl">{ipfsStatus.flags_pending_upload}</span>
              <span className="text-gray-500 text-sm">Pending</span>
            </div>
          </div>
        )}
        <button onClick={handleSyncIpfs} disabled={loading} className="btn btn-secondary">
          {loading ? 'Syncing...' : 'Sync Images from Pinata'}
        </button>
      </div>
    </div>
  );
};

export default Admin;
