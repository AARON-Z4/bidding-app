import React, { useState } from 'react';

const BidPopup = ({ username, onClose, onSubmit }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }

    // Clear error and submit
    setError('');
    onSubmit(bidAmount);
    setBidAmount('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative diagonal-border backdrop-blur-2xl bg-white/10 text-white w-[90%] max-w-md p-8 rounded-2xl shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-white text-2xl hover:text-red-400 transition-colors"
          aria-label="Close modal"
        >
          <i className="ri-close-line"></i>
        </button>

        {/* Heading */}
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Place Your Bid
        </h2>

        {/* Username Display */}
        <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <p className="text-sm text-white/70">Bidding as:</p>
          <p className="text-lg font-semibold text-[#24CFA6]">@{username}</p>
        </div>

        {/* Bid Form */}
        <form onSubmit={handleSubmit}>
          {/* Bid Amount Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-white/80">
              Bid Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={bidAmount}
              onChange={(e) => {
                setBidAmount(e.target.value);
                setError('');
              }}
              placeholder="Enter your bid amount"
              className="w-full p-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder:text-white/50 focus:outline-none focus:border-[#24CFA6] focus:ring-2 focus:ring-[#24CFA6]/50 transition-all"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Info Message */}
          <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-200">
              <i className="ri-information-line mr-1"></i>
              Your bid must be higher than the current bid
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#24CFA6] hover:bg-[#24cfa7c9] transition-all rounded-full py-3 font-semibold text-white shadow-lg hover:shadow-[#24CFA6]/50"
          >
            Confirm Bid
          </button>
        </form>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          className="w-full mt-3 bg-white/5 hover:bg-white/10 transition-all rounded-full py-3 font-medium text-white/80 border border-white/20"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BidPopup;
