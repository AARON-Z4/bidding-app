import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import bg from '../assets/bg.svg';
import BidPopup from '../components/BidPopup';


const dummyAuctionData = {
  id: 1,
  title: 'Limited Edition Headphones',
  description: 'Crystal-clear sound with futuristic design. Auction ends soon!',
  image: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d',
  currentBid: 120,
  bids: [
    { username: "techGuru", amount: 120 },
    { username: "soundKing", amount: 110 },
    { username: "audiophile123", amount: 100 },
    { username: "sahilchavan", amount: 90 },
  ]
};

export default function AuctionDetail() {
  const { id } = useParams();
  const [bids, setBids] = useState(dummyAuctionData.bids);
  const [showPopup, setShowPopup] = useState(false);

  const sortedBids = [...bids].sort((a, b) => b.amount - a.amount);
  const currentUsername = 'sahilchavan'; // simulate logged-in user

  const handlePlaceBid = (amount) => {
    const newBid = { username: currentUsername, amount: parseFloat(amount) };
    setBids(prev => [...prev, newBid]);
    setShowPopup(false);
  };

  return (
    <div
      className="min-h-screen w-full p-6 md:p-10 pt-24 flex justify-center items-start text-white"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-3xl w-full bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-8 mt-10 relative">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <img
            src={dummyAuctionData.image}
            alt={dummyAuctionData.title}
            className="w-full md:w-1/3 rounded-2xl object-cover shadow-md"
          />
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold">{dummyAuctionData.title}</h1>
            <p className="text-white/70">{dummyAuctionData.description}</p>
            <p className="text-green-400 font-semibold text-lg">
              Current Bid: ₹{Math.max(...bids.map(b => b.amount))}
            </p>
            <button
              onClick={() => setShowPopup(true)}
              className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/50 px-5 py-2 rounded-full hover:bg-emerald-400/30 transition-all font-medium"
            >
              Place a New Bid
            </button>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 border-b border-white/10 pb-2">Live Bidding</h2>
          <ul className="space-y-3 max-h-64 overflow-y-auto pr-1 scrollbar-hide">
            {sortedBids.map((bid, index) => (
              <li
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded p-3 flex justify-between items-center"
              >
                <span className="flex items-center gap-2">
                  <span className="font-medium">@{bid.username}</span>
                  {index < 3 && (
                    <span className="text-xs bg-red-500/80 text-white px-2 py-0.5 rounded-full">
                      #{index + 1}
                    </span>
                  )}
                </span>
                <span className="text-emerald-300">₹{bid.amount}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bid Popup */}
        {showPopup && (
          <BidPopup
            username={currentUsername}
            onClose={() => setShowPopup(false)}
            onSubmit={handlePlaceBid}
          />
        )}
      </div>
    </div>
  );
}
