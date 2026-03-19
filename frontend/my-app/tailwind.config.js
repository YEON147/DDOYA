/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        scdream: ['SCoreDreamRegular'],
        'scdream-thin': ['SCoreDreamThin'],
        'scdream-extralight': ['SCoreDreamExtraLight'],
        'scdream-light': ['SCoreDreamLight'],
        'scdream-regular': ['SCoreDreamRegular'],
        'scdream-medium': ['SCoreDreamMedium'],
        'scdream-bold': ['SCoreDreamBold'],
        'scdream-extrabold': ['SCoreDreamExtraBold'],
        'scdream-heavy': ['SCoreDreamHeavy'],
        'scdream-black': ['SCoreDreamBlack'],
      },
    },
  },
  plugins: [],
}
