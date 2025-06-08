const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  mode: "jit",
  // Adjusted purge to content for Tailwind CSS v3+ style, though 'jit' implies older setup.
  // For maximum compatibility, ensuring src/**/*.{js,ts,jsx,tsx} is key.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...fontFamily.sans],
      },
      borderRadius: {
        DEFAULT: "8px",
        secondary: "4px",
        container: "12px",
        lg: "0.5rem", // common alias for 8px
        xl: "0.75rem", // common alias for 12px
      },
      boxShadow: {
        DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)", // Tailwind's default shadow-md
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", // Tailwind's default shadow-md
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)", // Tailwind's default shadow-lg
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", // Tailwind's default shadow-xl
      },
      colors: {
        'human-blue': '#6D7AFF', // Custom name for the primary blue
        primary: { // Keeping primary as an alias for human-blue for potential existing usage
          DEFAULT: "#6D7AFF",
          hover: "#594FF5", // A slightly darker hover for human-blue
        },
        secondary: {
          DEFAULT: "#6B7280", // gray-500
          hover: "#4B5563",   // gray-600
        },
        accent: { // This was #8B5CF6 (violet-500), keeping it for now
          DEFAULT: "#8B5CF6",
          hover: "#7C3AED",   // violet-600
        },
        emerald: { // Add emerald palette
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
      },
      spacing: {
        "form-field": "16px",
        section: "32px",
      },
    },
  },
  variants: { // Note: `variants` is for Tailwind v2. For v3, these are typically enabled by default or configured differently.
    extend: {
      boxShadow: ["hover", "active"],
    },
  },
  plugins: [], // Added empty plugins array as it's common practice
};
