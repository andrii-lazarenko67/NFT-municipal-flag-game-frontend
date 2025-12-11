/**
 * Rankings Page - Leaderboards
 */
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchAllRankings,
  selectUserRankings,
  selectCollectorRankings,
  selectFlagRankings,
  selectRankingsLoading,
} from '../store/slices/rankingsSlice';
import Loading from '../components/Loading';
import config from '../config';
import { useAnimation, usePageLoadAnimation, animationPatterns } from '../hooks/useAnimation';

const Rankings = () => {
  const dispatch = useDispatch();
  const [tab, setTab] = useState('users');
  const userRankings = useSelector(selectUserRankings);
  const collectorRankings = useSelector(selectCollectorRankings);
  const flagRankings = useSelector(selectFlagRankings);
  const loading = useSelector(selectRankingsLoading);

  // Animation hooks
  const headerRef = usePageLoadAnimation(100);
  const { ref: listRef, reset: resetAnimations } = useAnimation({ threshold: 0.1 });

  useEffect(() => {
    dispatch(fetchAllRankings(10));
  }, [dispatch]);

  // Reset animations when tab changes
  useEffect(() => {
    resetAnimations();
  }, [tab, resetAnimations]);

  if (loading && userRankings.length === 0) return <Loading />;

  const getCurrentRankings = () => {
    switch (tab) {
      case 'users':
        return userRankings;
      case 'collectors':
        return collectorRankings;
      case 'flags':
        return flagRankings;
      default:
        return [];
    }
  };

  const renderRankingItem = (item, index) => {
    if (tab === 'flags') {
      return (
        <div
          key={item.rank}
          {...animationPatterns.list(index)}
          className="flex items-center gap-4 p-4 border-b border-gray-800 last:border-b-0"
        >
          <span className="text-2xl font-bold text-primary w-10">#{item.rank}</span>
          <div className="flex-1">
            <span className="text-white">{item.flag.location_type}</span>
            <span className="text-gray-500 text-sm ml-2">{item.flag.name.substring(0, 20)}...</span>
          </div>
          <span className="text-gray-400">{item.interest_count} interests</span>
        </div>
      );
    }

    return (
      <div
        key={item.rank}
        {...animationPatterns.list(index)}
        className="flex items-center gap-4 p-4 border-b border-gray-800 last:border-b-0"
      >
        <span className="text-2xl font-bold text-primary w-10">#{item.rank}</span>
        <span className="flex-1 text-white font-mono">
          {config.truncateAddress(item.user.wallet_address, 6)}
        </span>
        <span className="text-gray-400">
          {item.score} {tab === 'users' ? 'pts' : 'flags'}
        </span>
      </div>
    );
  };

  const rankings = getCurrentRankings();

  return (
    <div className="page-container">
      <div ref={headerRef} className="page-header">
        <h1
          data-animate="fade-down"
          data-duration="normal"
          data-delay="0"
          className="page-title"
        >
          Rankings
        </h1>
        <p
          data-animate="fade-up"
          data-duration="normal"
          data-delay="1"
          className="page-subtitle"
        >
          Top collectors and most popular flags
        </p>
      </div>

      {/* Tabs */}
      <div
        data-animate="fade-up"
        data-duration="normal"
        data-delay="2"
        className="flex gap-2 mb-8 border-b border-gray-800 pb-4"
      >
        <TabButton active={tab === 'users'} onClick={() => setTab('users')} delay="0">
          By Reputation
        </TabButton>
        <TabButton active={tab === 'collectors'} onClick={() => setTab('collectors')} delay="1">
          By Collection
        </TabButton>
        <TabButton active={tab === 'flags'} onClick={() => setTab('flags')} delay="2">
          Popular Flags
        </TabButton>
      </div>

      {/* Rankings List */}
      <div ref={listRef}>
        <div
          data-animate="fade-up"
          data-duration="normal"
          data-delay="0"
          className="card"
        >
          {rankings.length > 0 ? (
            rankings.map((item, index) => renderRankingItem(item, index))
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, children, delay = "0" }) => (
  <button
    onClick={onClick}
    data-animate="fade-up"
    data-duration="fast"
    data-delay={delay}
    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
      active
        ? 'bg-primary text-white'
        : 'text-gray-400 hover:text-white hover:bg-gray-800'
    }`}
  >
    {children}
  </button>
);

export default Rankings;
