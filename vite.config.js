import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react({
            // 🚫 Désactive le bouton violet (React Inspector)
            babel: {
                plugins: [],
            },
            fastRefresh: true,
            jsxImportSource: 'react',
            include: '**/*.{jsx,tsx}',
            exclude: [],
            devTools: false, // 👈 ligne clé : désactive le bouton
        }),
    ],
});
