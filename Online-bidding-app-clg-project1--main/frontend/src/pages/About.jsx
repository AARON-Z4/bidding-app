import React from 'react';
import { assets } from '../assets/assets';


const About = () => {
    return (
        <div className="min-h-screen  flex items-center justify-center px-4">
            <div className="relative diagonal-border bg-gray-400/20 backdrop-blur-xl rounded-2xl shadow-lg p-8 md:p-12 max-w-3xl text-center text-white">
                <h1 className="text-3xl md:text-4xl font-bold text-teal-400 mb-4">About VibeBid</h1>
                <p className="text-base md:text-lg mb-4">
                    Welcome to <span className="font-semibold text-white">VibeBid</span> – your go-to destination for thrilling real-time auctions.
                    Our platform empowers buyers and sellers to connect seamlessly in a vibrant, live bidding environment.
                </p>
                <p className="text-base md:text-lg mb-4">
                    Built with cutting-edge technology and a passion for innovation, VibeBid is designed to make your auction
                    experience secure, exciting, and transparent.
                </p>
                <p className="text-base md:text-lg mb-4">
                    Whether you're here to discover rare collectibles or list your own items for auction, VibeBid ensures a
                    smooth and dynamic experience every time.
                </p>

                <div className="mt-4 flex justify-center gap-2 grayscale opacity-50">
                    <img src={assets.partnerLogo1} className="h-8" />
                    <img src={assets.partnerLogo2} className="h-8" />
                    <img src={assets.partnerLogo3} className="h-8" />
                    <img src={assets.partnerLogo4} className="h-8" />
                </div>

                <p className="text-teal-400 text-lg font-semibold italic mt-6">Vibe the Bid. Win the Deal.</p>
            </div>
        </div>
    );
};

export default About;
