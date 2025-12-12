/**
 * Country Detail Page - Show regions of a country
 * Refactored to use useNavigate instead of Link
 */
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCountry, selectCurrentCountry, selectCountriesLoading } from '../store/slices/countriesSlice';
import Loading from '../components/Loading';

const CountryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const country = useSelector(selectCurrentCountry);
  const loading = useSelector(selectCountriesLoading);

  useEffect(() => {
    dispatch(fetchCountry(id));
  }, [dispatch, id]);

  if (loading) return <Loading />;
  if (!country) return <ErrorDisplay message="Country not found" />;

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
        <span
          data-animate="fade-left"
          data-duration="fast"
          className="text-white"
        >
          {country.name}
        </span>
      </nav>

      <div className="page-header">
        <h1
          data-animate="fade-down"
          data-duration="normal"
          className="page-title"
        >
          {country.name}
        </h1>
        <p
          data-animate="fade-up"
          data-duration="normal"
          className="page-subtitle"
        >
          Select a region to explore municipalities
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {country.regions?.map((region, index) => (
          <div
            key={region.id}
            onClick={() => navigate(`/regions/${region.id}`)}
            data-animate="fade-up"
            data-duration="normal"
            className="card card-hover card-animate p-6 cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate(`/regions/${region.id}`)}
          >
            <h2 className="text-white font-semibold text-lg mb-2">{region.name}</h2>
            <p className="text-gray-400 text-sm">{region.municipality_count} municipalities</p>
          </div>
        ))}
      </div>

      {(!country.regions || country.regions.length === 0) && (
        <div
          data-animate="fade-up"
          data-duration="slow"
          className="text-center py-16"
        >
          <p className="text-gray-400">No regions available in this country.</p>
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

export default CountryDetail;
