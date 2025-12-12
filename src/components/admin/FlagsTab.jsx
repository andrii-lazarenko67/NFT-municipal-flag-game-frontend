/**
 * FlagsTab - Admin CRUD interface for flags
 */
import { useState } from 'react';
import { createFlag, updateFlag } from '../../store/slices/adminSlice';
import { usePageLoadAnimation } from '../../hooks/useAnimation';
import AdminTable from './AdminTable';

const FlagsTab = ({ flags, municipalities, dispatch, actionLoading }) => {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterMunicipalityId, setFilterMunicipalityId] = useState('');
  const [formData, setFormData] = useState({
    name: '', municipality_id: '', location_type: '', category: 'standard', nfts_required: '1', price: '0.01',
  });
  const pageRef = usePageLoadAnimation(50);

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

  const columns = [
    { key: 'id', label: 'ID', className: 'text-gray-300' },
    { key: 'name', label: 'Name', className: 'text-white text-sm' },
    {
      key: 'municipality_id',
      label: 'Municipality',
      className: 'text-gray-400',
      render: (item) => getMunicipalityName(item.municipality_id),
    },
    { key: 'location_type', label: 'Type', className: 'text-gray-400' },
    {
      key: 'category',
      label: 'Category',
      render: (item) => (
        <span className={`px-2 py-1 rounded text-xs ${getCategoryBadge(item.category)}`}>
          {item.category}
        </span>
      ),
    },
    { key: 'nfts_required', label: 'NFTs', className: 'text-gray-400' },
    {
      key: 'price',
      label: 'Price',
      className: 'text-primary',
      render: (item) => `${item.price} POL`,
    },
    {
      key: 'is_pair_complete',
      label: 'Status',
      render: (item) => (
        <span className={`badge ${item.is_pair_complete ? 'badge-claimed' : 'badge-available'}`}>
          {item.is_pair_complete ? 'Complete' : 'Available'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item) => (
        <button onClick={() => handleEdit(item)} className="text-blue-400 hover:text-blue-300">
          Edit
        </button>
      ),
    },
  ];

  return (
    <div ref={pageRef}>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4" data-animate="fade-right" data-duration="fast">
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
        <div className="card p-6 mb-6" data-animate="fade-down" data-duration="fast" data-delay="1">
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

      <AdminTable columns={columns} data={filteredFlags} emptyMessage="No flags found." />
    </div>
  );
};

export default FlagsTab;
