/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
		colors: {
        'salmon-primary': '#FA8072', // A nice shade of salmon
        'bluegray-dark': '#4A5568',  // Darker blue-gray for text/backgrounds
        'bluegray-light': '#E2E8F0', // Lighter blue-gray for accents/backgrounds
        'bluegray-medium': '#a1adbd',// Medium blue-gray
        'dark-background': '#2D3748', // Even darker for contrast
      },
	},
  },
  plugins: [],
}

