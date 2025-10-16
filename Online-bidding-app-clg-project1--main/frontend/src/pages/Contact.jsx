import React from 'react'

const Contact = () => {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-24 min-h-screen" id="contact">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white">📞 Contact Us</h2>
        <p className="text-gray-300 mt-2">We’re here to help! Reach out anytime.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Contact Info */}
        <div className="bg-white/5 backdrop-blur-md diagonal-border border-white/10 rounded-2xl p-6 shadow-md">
          <h3 className="text-xl text-white font-semibold mb-4">Support Details</h3>
          <ul className="text-gray-300 space-y-2">
            <li><strong>Email:</strong> support@vibebid.com</li>
            <li><strong>Location:</strong> Mumbai, India</li>
            <li><strong>Support Hours:</strong> Mon - Sat, 9am - 6pm IST</li>
          </ul>
        </div>

        {/* Contact Form */}
        <form
          className="bg-white/5 backdrop-blur-md diagonal-border border-white/10 rounded-2xl p-6 shadow-md space-y-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <h3 className="text-xl text-white font-semibold mb-2">Send a Message</h3>
          <input
            type="text"
            placeholder="Your Name"
            className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 border border-white/10"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 border border-white/10"
          />
          <textarea
            rows="4"
            placeholder="Your Message"
            className="w-full p-3 rounded-md bg-white/10 text-white placeholder-gray-400 border border-white/10"
          />
          <button
            className="relative overflow-hidden group px-6 py-3 rounded-full text-white font-semibold 
                       backdrop-blur-md bg-[#24CFA6]/10 border border-[#24CFA6]/30 "  

          >
            <span className="relative z-10">Submit</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                             translate-x-[-100%] group-hover:translate-x-[100%] 
                             transition-transform duration-700 ease-in-out pointer-events-none blur-sm" />
          </button>
        </form>
      </div>
    </section>
  )
}

export default Contact
