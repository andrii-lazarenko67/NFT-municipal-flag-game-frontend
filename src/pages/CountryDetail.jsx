/**
 * Country Detail Page - Show regions of a country
 */
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCountry, selectCurrentCountry, selectCountriesLoading } from '../store/slices/countriesSlice';
import Loading from '../components/Loading';
import { useAnimation, usePageLoadAnimation } from '../hooks/useAnimation';

const CountryDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const country = useSelector(selectCurrentCountry);
  const loading = useSelector(selectCountriesLoading);

  // Animation hooks
  const headerRef = usePageLoadAnimation(100);
  const { ref: gridRef } = useAnimation({ threshold: 0.1 });

  useEffect(() => {
    dispatch(fetchCountry(id));
  }, [dispatch, id]);

  if (loading) return <Loading />;
  if (!country) return <ErrorDisplay message="Country not found" />;

  return (
    <div className="page-container">
      <nav ref={headerRef} className="breadcrumb">
        <Link
          to="/countries"
          data-animate="fade-right"
          data-duration="fast"
          data-delay="0"
        >
          Countries
        </Link>
        <span data-animate="fade" data-duration="fast" data-delay="1">/</span>
        <span
          data-animate="fade-left"
          data-duration="fast"
          data-delay="2"
          className="text-white"
        >
          {country.name}
        </span>
      </nav>

      <div className="page-header">
        <h1
          data-animate="fade-down"
          data-duration="normal"
          data-delay="1"
          className="page-title"
        >
          {country.name}
        </h1>
        <p
          data-animate="fade-up"
          data-duration="normal"
          data-delay="2"
          className="page-subtitle"
        >
          Select a region to explore municipalities
        </p>
      </div>

      <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {country.regions?.map((region, index) => (
          <Link
            to={`/regions/${region.id}`}
            key={region.id}
            data-animate="fade-up"
            data-duration="normal"
            data-delay={String(index % 8)}
            className="card card-hover card-animate p-6"
          >
            <h2 className="text-white font-semibold text-lg mb-2">{region.name}</h2>
            <p className="text-gray-400 text-sm">{region.municipality_count} municipalities</p>
          </Link>
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
