import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms"
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{.js,ts,svelte}"],
  theme: {
    extend: {},
  },
  plugins: [forms],
} as Config;
