/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          nav: "#E7E7E7",
          main: "#35622F",
          hover: "#3C522B",
        },
        secondary: {
          DEFAULT: "#4A8B95", // ปุ่มรอง
          main: "#5BA3AD"
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        inria: ["var(--font-inria-serif)", "serif"],
      },
    },
    plugins: [],
  },
};
