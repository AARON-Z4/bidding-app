import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { formatCurrency, formatTimeRemaining, getErrorMessage } from '../utils/helpers';

const AuctionsPage = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
  });

  useEffect(() => {
    fetchAuctions();
  }, [filters]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsAPI.getAll({
        search: filters.search || undefined,
        category: filters.category || undefined,
        limit: 50
      });
      setAuctions(response.data);
    } catch (err) {
      console.error('Error fetching auctions:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  if (loading) {
    return (
      <div className="auctions-bg-flip min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#24CFA6]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auctions-bg-flip min-h-screen flex items-center justify-center px-4">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 max-w-md">
          <h3 className="text-red-500 font-bold text-xl mb-2">Error Loading Auctions</h3>
          <p className="text-white/80">{error}</p>
          <button
            onClick={fetchAuctions}
            className="mt-4 bg-[#24CFA6] text-white px-6 py-2 rounded-lg hover:bg-[#24cfa7c9] transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auctions-bg-flip px-4 py-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-8 relative z-10 text-white">Live Auctions</h2>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search auctions..."
              value={filters.search}
              onChange={handleSearch}
              className="w-full px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:border-[#24CFA6]"
            />
            <i className="ri-search-line absolute right-6 top-1/2 transform -translate-y-1/2 text-white/50 text-xl"></i>
          </div>
        </div>

        {auctions.length === 0 ? (
          <div className="text-center py-20">
            <i className="ri-auction-line text-white/30 text-6xl mb-4"></i>
            <p className="text-white/70 text-xl">No active auctions found</p>
            <p className="text-white/50 mt-2">Check back later for new listings!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
            {auctions.map((item) => (
              <div
                key={item.id}
                className="bg-white/5 backdrop-blur-lg diagonal-border rounded-2xl overflow-hidden shadow-xl transition-transform hover:scale-105 cursor-pointer"
                onClick={() => navigate(`/auction/${item.id}`)}
              >
                <div className="relative">
                  <img
                    src={item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={item.title}
                    className="h-48 object-cover w-full"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                  {item.category && (
                    <span className="absolute top-2 right-2 bg-[#24CFA6]/80 text-white text-xs px-3 py-1 rounded-full">
                      {item.category}
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-white truncate">{item.title}</h3>
                  <p className="text-white/80 mb-4 line-clamp-2 text-sm">{item.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/60 text-sm">Current Bid:</span>
                      <span className="text-[#24CFA6] font-bold">{formatCurrency(item.current_bid)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60 text-sm">Ends in:</span>
                      <span className="text-white font-medium text-sm">{formatTimeRemaining(item.end_time)}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/auction/${item.id}`);
                    }}
                    className="w-full px-4 py-2 bg-[#24CFA6]/20 text-white border border-[#24CFA6]/50 rounded-full hover:bg-[#24CFA6]/30 transition-all"
                  >
                    Place Bid
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionsPage;
