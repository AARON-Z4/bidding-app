// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      animation: {
        liquid: "liquidMove 8s ease-in-out infinite",
      },
      keyframes: {
        liquidMove: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "25%": { transform: "translate(20px, -30px) scale(1.2)" },
          "50%": { transform: "translate(-25px, 15px) scale(0.9)" },
          "75%": { transform: "translate(15px, 25px) scale(1.1)" },
        },
      },
    },
  },
  plugins: [],
};
