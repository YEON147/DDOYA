/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // 앱 전역 폰트 스케일 통일
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['13px', { lineHeight: '18px' }],
        base: ['14px', { lineHeight: '20px' }],
        md: ['15px', { lineHeight: '21px' }],
        lg: ['16px', { lineHeight: '22px' }],
        xl: ['18px', { lineHeight: '24px' }],
        '2xl': ['20px', { lineHeight: '26px' }],
        '3xl': ['24px', { lineHeight: '30px' }],
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
