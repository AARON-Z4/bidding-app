import React from 'react'
import Tilt from 'react-parallax-tilt'
import { CheckCircle2 } from 'lucide-react'

const features = [
  {
    title: 'No Hidden Fees',
    desc: 'Transparent pricing — what you see is what you pay.',
  },
  {
    title: 'Real-time Bidding',
    desc: 'Bids update instantly without refresh for a live experience.',
  },
  {
    title: 'Smart Notifications',
    desc: 'Get alerts for bids, wins, and outbids in real-time.',
  },
  {
    title: 'Verified Listings',
    desc: 'Every listing is verified for authenticity and quality.',
  },
  {
    title: 'Secure Payments',
    desc: 'All transactions are encrypted and protected end-to-end.',
  },
  {
    title: 'Live Auctions',
    desc: 'Watch auctions unfold in real-time with zero delay.',
  },
  {
    title: 'Responsive Design',
    desc: 'Optimized for all devices — mobile, tablet, and desktop.',
  },
  {
    title: '24/7 Support',
    desc: 'We’re always here to help you, anytime, anywhere.',
  },
]

const Features = () => {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-24 min-h-screen" id="features">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold tracking-tight text-white">
        Platform <span className='text-[#24CFA6]' >Features</span> 
        </h2>
        <p className="text-gray-300 mt-3 max-w-2xl mx-auto">
          Why users love VibeBid — built for transparency, speed, and trust.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {features.map((item, index) => (
          <Tilt
            glareEnable={true}
            glareMaxOpacity={0.15}
            glareColor=""
            glarePosition="all"
            tiltMaxAngleX={8}
            tiltMaxAngleY={8}
            className="rounded-2xl"
            key={index}
          >
            <div className="rounded-2xl p-6 diagonal-border  backdrop-blur-md shadow-md transition-transform duration-300 hover:scale-[1.03]">
              <div className="flex items-center mb-3 text-[#24CFA6]">
                <CheckCircle2 className="w-6 h-6 mr-2" />
                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              </div>
              <p className="text-gray-300">{item.desc}</p>
            </div>
          </Tilt>
        ))}
      </div>
    </section>
  )
}

export default Features
