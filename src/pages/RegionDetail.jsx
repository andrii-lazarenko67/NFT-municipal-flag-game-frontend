/**
 * Region Detail Page - Show municipalities of a region
 * Refactored to use useNavigate instead of Link
 */
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRegion, selectCurrentRegion, selectCountriesLoading } from '../store/slices/countriesSlice';
import Loading from '../components/Loading';

const RegionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const region = useSelector(selectCurrentRegion);
  const loading = useSelector(selectCountriesLoading);

  useEffect(() => {
    dispatch(fetchRegion(id));
  }, [dispatch, id]);

  if (loading) return <Loading />;
  if (!region) return <ErrorDisplay message="Region not found" />;

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
        <span data-animate="fade" data-duration="fast">/</span>
        <button
          onClick={() => navigate(`/countries/${region.country?.id}`)}
          data-animate="fade-right"
          data-duration="fast"
          className="bg-transparent border-none cursor-pointer text-inherit hover:text-primary"
        >
          {region.country?.name}
        </button>
        <span data-animate="fade" data-duration="fast">/</span>
        <span
          data-animate="fade-left"
          data-duration="fast"
          className="text-white"
        >
          {region.name}
        </span>
      </nav>

      <div className="page-header">
        <h1
          data-animate="fade-down"
          data-duration="normal"
          className="page-title"
        >
          {region.name}
        </h1>
        <p
          data-animate="fade-up"
          data-duration="normal"
          className="page-subtitle"
        >
          Select a municipality to view its flags
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {region.municipalities?.map((muni, index) => (
          <div
            key={muni.id}
            onClick={() => navigate(`/municipalities/${muni.id}`)}
            data-animate={index % 3 === 0 ? "zoom-in" : "fade-up"}
            data-duration="normal"
            className="card card-hover card-animate p-6 cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate(`/municipalities/${muni.id}`)}
          >
            <h2 className="text-white font-semibold text-lg mb-1">{muni.name}</h2>
            <p className="text-gray-500 text-xs mb-2 font-mono">{muni.coordinates}</p>
            <p className="text-gray-400 text-sm">{muni.flag_count} flags</p>
          </div>
        ))}
      </div>

      {(!region.municipalities || region.municipalities.length === 0) && (
        <div
          data-animate="fade-up"
          data-duration="slow"
          className="text-center py-16"
        >
          <p className="text-gray-400">No municipalities available in this region.</p>
        </div>
      )}
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

export default RegionDetail;
