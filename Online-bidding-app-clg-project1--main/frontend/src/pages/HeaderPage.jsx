import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const HeaderPage = () => {
  const navigate = useNavigate();
  const btnRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;

    btnRef.current.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    btnRef.current.style.transform = `rotateX(0deg) rotateY(0deg)`;
  };

  return (
    <div className="flex items-center justify-center h-screen px-4 text-center">
      <div className="max-w-3xl">
      
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Your <span className="text-[#24CFA6]">Vibe </span>, Your <span className="text-[#24CFA6]">Bid</span>, Your <span className="text-[#24CFA6]">Victory</span>.
        </h1>

        
        <p className="text-white/60 text-sm md:text-lg mb-6">
          Join <span className="text-[#24CFA6] font-semibold">VibeBid</span> — the next-gen platform where style meets strategy.
          Bid smart, win big, and vibe with exclusive auctions in real-time.
        </p>

        
        <ul className="mt-6 space-y-2 text-white/80 text-left mx-auto max-w-md">
          <li><i className="ri-check-line text-[#24CFA6] mr-2"></i> Live Auctions with Real-Time Bidding</li>
          <li><i className="ri-check-line text-[#24CFA6] mr-2"></i> Curated Collections & Rare Finds</li>
          <li><i className="ri-check-line text-[#24CFA6] mr-2"></i> Transparent, Secure Transactions</li>
        </ul>

        {/* CTA Buttons */}
        <div className="mt-8 flex justify-center gap-4 items-center">

          
          <button
            className="relative overflow-hidden group px-6 py-3 rounded-full text-white font-semibold 
                       backdrop-blur-md bg-white/10 border border-white/20 
                       hover:bg-white/20 hover:backdrop-blur-xl transition-all duration-300 ease-in-out">
            <span className="relative z-10">Get Started</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                             translate-x-[-100%] group-hover:translate-x-[100%] 
                             transition-transform duration-700 ease-in-out pointer-events-none blur-sm" />
          </button>

          
          <button
            ref={btnRef}
            onClick={() => navigate('/auctions')}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative overflow-hidden group px-6 py-3 rounded-full text-white font-semibold 
                       backdrop-blur-md bg-[#24CFA6]/10 border border-[#24CFA6]/30 "  

          >
            <span className="relative z-10">Explore Auctions</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                             translate-x-[-100%] group-hover:translate-x-[100%] 
                             transition-transform duration-700 ease-in-out pointer-events-none blur-sm" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderPage;
