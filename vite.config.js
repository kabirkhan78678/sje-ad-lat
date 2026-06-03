import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    base: '/admin',
    plugins: [react()], 
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    react: ['react', 'react-dom', 'react-router-dom'],
                    forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
                    charts: ['recharts'],
                    vendor: ['axios', 'clsx', 'lucide-react', 'tailwind-merge'],
                },
            },
        },
    },
    resolve: {
        alias: {
            '@': new URL('./src', import.meta.url).pathname,
        },
    },
    server: {
        port: 5173,
    },
});
