import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Change REPO_NAME to your GitHub repo name when deploying to GitHub Pages
// e.g. if hosted at https://user.github.io/python-trainer/ set base: '/python-trainer/'
const REPO_NAME = 'code-trainer';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: `/${REPO_NAME}/`,
});
