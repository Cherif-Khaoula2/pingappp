import './bootstrap';
import '../css/app.css';
import '../css/layout.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { LayoutProvider } from "@/Layouts/layout/context/layoutcontext.jsx";
import { PrimeReactProvider } from "primereact/api";
import axios from "axios";

// 🔁 Interception globale des erreurs HTTP
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 419) {
            console.warn("Session expirée — rechargement automatique...");
            setTimeout(() => {
                window.location.reload();
            }, 1000); // recharge après 1 seconde
        }
        return Promise.reject(error);
    }
);

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// ✅ Protection silencieuse - pas de console.log
const originalRoute = window.route;
window.route = function(name, params, absolute) {
    try {
        return originalRoute(name, params, absolute);
    } catch (error) {
        // Retourne # silencieusement sans afficher dans la console
        return '#';
    }
};

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(
        `./Pages/${name}.jsx`, 
        import.meta.glob('./Pages/**/*.jsx', { eager: true })
    ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <PrimeReactProvider>
                <LayoutProvider>
                    <App {...props} />
                </LayoutProvider>
            </PrimeReactProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});