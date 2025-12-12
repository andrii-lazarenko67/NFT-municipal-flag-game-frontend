/**
 * Municipality Detail Page - Show flags of a municipality
 * Refactored to use useNavigate instead of Link
 */
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMunicipality, selectCurrentMunicipality, selectCountriesLoading } from '../store/slices/countriesSlice';
import FlagCard from '../components/FlagCard';
import Loading from '../components/Loading';

const MunicipalityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const municipality = useSelector(selectCurrentMunicipality);
  const loading = useSelector(selectCountriesLoading);

  useEffect(() => {
    dispatch(fetchMunicipality(id));
  }, [dispatch, id]);

  if (loading) return <Loading />;
  if (!municipality) return <ErrorDisplay message="Municipality not found" />;

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
          onClick={() => navigate(`/regions/${municipality.region?.id}`)}
          data-animate="fade-right"
          data-duration="fast"
          className="bg-transparent border-none cursor-pointer text-inherit hover:text-primary"
        >
          {municipality.region?.name}
        </button>
        <span data-animate="fade" data-duration="fast">/</span>
        <span
          data-animate="fade-left"
          data-duration="fast"
          className="text-white"
        >
          {municipality.name}
        </span>
      </nav>

      <div className="page-header">
        <h1
          data-animate="fade-down"
          data-duration="normal"
          className="page-title"
        >
          {municipality.name}
        </h1>
        <p
          data-animate="fade-up"
          data-duration="normal"
          className="page-subtitle font-mono"
        >
          {municipality.coordinates}
        </p>
      </div>

      <div className="grid-cards">
        {municipality.flags?.map((flag, index) => (
          <div
            key={flag.id}
            data-animate="fade-up"
            data-duration="normal"
          >
            <FlagCard flag={flag} />
          </div>
        ))}
      </div>

      {(!municipality.flags || municipality.flags.length === 0) && (
        <div
          data-animate="fade-up"
          data-duration="slow"
          className="text-center py-16"
        >
          <p className="text-gray-400">No flags available in this municipality.</p>
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

export default MunicipalityDetail;
