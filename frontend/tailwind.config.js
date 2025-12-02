/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue,svelte}",
    "./src/components/**/*.{js,ts,jsx,tsx,vue,svelte}",
    "./src/pages/**/*.{js,ts,jsx,tsx,vue,svelte}",
  ],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1rem",
        lg: "2rem",
        xl: "4rem",
        "2xl": "6rem",
      },
    },
    extend: {
      colors: {
        accentblue: "#4DB3FF",
        accentpink: "#FF74C8",
        primary: {
          50: "#eef6ff",
          100: "#dbeefe",
          200: "#b7ddfd",
          300: "#93ccfb",
          400: "#5fa8f8",
          DEFAULT: "#2b88f5",
          600: "#236fcb",
          700: "#1b4f87",
          800: "#14324f",
          900: "#0d1a2a",
        },
        accent: {
          DEFAULT: "#FF7AB6",
        },
      },
      fontFamily: {
        header: ["FOT-Yuruka Std"],
        yuruka: ['"FOT-Yuruka Std"', '"Varela Round"', "sans-serif"],
        body: ["Varela Round", "sans-serif"],
      },
      spacing: {
        128: "32rem",
        144: "36rem",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
};
