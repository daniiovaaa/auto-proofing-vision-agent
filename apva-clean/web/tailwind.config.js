/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Warm, confident brand palette inspired by Sticker Mule's bold identity.
        ink: "#1a1a1a",
        cloud: "#fafaf8",
        mule: {
          50: "#fff4ed",
          100: "#ffe6d5",
          400: "#ff7a45",
          500: "#f15a29", // primary brand orange
          600: "#d4470f",
        },
        leaf: "#1f9d55", // pass / ready
        amber: "#e8a317", // warning
        clay: "#d64545", // critical
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        chunky: "1.25rem",
      },
      boxShadow: {
        sticker: "0 10px 30px -12px rgba(26,26,26,0.18)",
        lift: "0 18px 40px -16px rgba(241,90,41,0.35)",
      },
      keyframes: {
        "scan-sweep": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(200%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "scan-sweep": "scan-sweep 1.6s ease-in-out infinite",
        "fade-up": "fade-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
