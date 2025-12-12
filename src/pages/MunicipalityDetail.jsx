/**
 * Municipality Detail Page - Show flags of a municipality
 * Refactored to use useNavigate instead of Link
 *
 * MATCHING GAME FEATURE:
 * - Flags are displayed as mystery cards until user shows interest
 * - User must click a card and "Show Interest" to reveal the flag
 * - After revealing, user can claim the first NFT for free
 */
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMunicipality, selectCurrentMunicipality, selectCountriesLoading } from '../store/slices/countriesSlice';
import { selectIsConnected } from '../store/slices/walletSlice';
import FlagCard from '../components/FlagCard';
import Loading from '../components/Loading';

const MunicipalityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const municipality = useSelector(selectCurrentMunicipality);
  const loading = useSelector(selectCountriesLoading);
  const isConnected = useSelector(selectIsConnected);

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

      {/* MATCHING GAME: Instructions for new users */}
      {!isConnected && municipality.flags?.length > 0 && (
        <div
          data-animate="fade-up"
          data-duration="normal"
          className="card p-6 mb-8 bg-gradient-to-r from-primary/10 to-blue-600/10 border border-primary/20"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Discover Mystery Flags</h3>
              <p className="text-gray-400 text-sm mb-3">
                Each flag is hidden until you show interest. Connect your wallet and click on a mystery card to reveal its contents and claim your first NFT for free!
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">1</span>
                  <span>Connect Wallet</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">2</span>
                  <span>Show Interest</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">3</span>
                  <span>Claim Free NFT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid-cards">
        {municipality.flags?.map((flag) => (
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
