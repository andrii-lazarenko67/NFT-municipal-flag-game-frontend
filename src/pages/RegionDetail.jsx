/**
 * Region Detail Page - Show municipalities of a region
 */
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRegion, selectCurrentRegion, selectCountriesLoading } from '../store/slices/countriesSlice';
import Loading from '../components/Loading';
import { useAnimation, usePageLoadAnimation } from '../hooks/useAnimation';

const RegionDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const region = useSelector(selectCurrentRegion);
  const loading = useSelector(selectCountriesLoading);

  // Animation hooks
  const headerRef = usePageLoadAnimation(100);
  const { ref: gridRef } = useAnimation({ threshold: 0.1 });

  useEffect(() => {
    dispatch(fetchRegion(id));
  }, [dispatch, id]);

  if (loading) return <Loading />;
  if (!region) return <ErrorDisplay message="Region not found" />;

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
        <Link
          to={`/countries/${region.country?.id}`}
          data-animate="fade-right"
          data-duration="fast"
          data-delay="1"
        >
          {region.country?.name}
        </Link>
        <span data-animate="fade" data-duration="fast" data-delay="2">/</span>
        <span
          data-animate="fade-left"
          data-duration="fast"
          data-delay="3"
          className="text-white"
        >
          {region.name}
        </span>
      </nav>

      <div className="page-header">
        <h1
          data-animate="fade-down"
          data-duration="normal"
          data-delay="1"
          className="page-title"
        >
          {region.name}
        </h1>
        <p
          data-animate="fade-up"
          data-duration="normal"
          data-delay="2"
          className="page-subtitle"
        >
          Select a municipality to view its flags
        </p>
      </div>

      <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {region.municipalities?.map((muni, index) => (
          <Link
            to={`/municipalities/${muni.id}`}
            key={muni.id}
            data-animate={index % 3 === 0 ? "zoom-in" : "fade-up"}
            data-duration="normal"
            data-delay={String(index % 8)}
            className="card card-hover card-animate p-6"
          >
            <h2 className="text-white font-semibold text-lg mb-1">{muni.name}</h2>
            <p className="text-gray-500 text-xs mb-2 font-mono">{muni.coordinates}</p>
            <p className="text-gray-400 text-sm">{muni.flag_count} flags</p>
          </Link>
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
