/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // 앱 전역 글자 크기 +2px (text-xs, text-sm 등)
      fontSize: {
        xs: ['14px', { lineHeight: '18px' }],
        sm: ['16px', { lineHeight: '22px' }],
        base: ['18px', { lineHeight: '26px' }],
        lg: ['20px', { lineHeight: '28px' }],
        xl: ['22px', { lineHeight: '30px' }],
        '2xl': ['26px', { lineHeight: '34px' }],
        '3xl': ['32px', { lineHeight: '38px' }],
      },
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
