import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/trongc3bachuc/', // Thêm chính xác dòng này
});
