/* eslint-disable @next/next/no-img-element */
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef } from 'react';
import { LayoutContext } from './context/layoutcontext';
import { Link } from '@inertiajs/react';

const AppTopbar = forwardRef((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    return (
        <div className="layout-topbar">
                <div className="topbar-logo-split">
                    <span className="logo-part-blue">To</span>
                    <span className="logo-part-red">sys</span>
                </div>
            {/* Menu button */}
            <button
                ref={menubuttonRef}
                type="button"
                className="p-link layout-menu-button layout-topbar-button"
                onClick={onMenuToggle}
            >
                <i className="pi pi-bars" />
            </button>

            <button
                ref={topbarmenubuttonRef}
                type="button"
                className="p-link layout-topbar-menu-button layout-topbar-button"
                onClick={showProfileSidebar}
            >
                <i className="pi pi-user" />
            </button>

            <div
                ref={topbarmenuRef}
                className={classNames('layout-topbar-menu', {
                    'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible
                })}
            >
                <Link href={route('logout')} method="delete" as="button" className="p-link layout-topbar-button">
                    <i className="pi pi-lock"></i>
                    <span>Déconnexion</span>
                </Link>
            </div>
            <style jsx>{`
                /* Container principal du topbar */
                :global(.layout-topbar) {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.75rem 1.5rem;
                    gap: 1rem;
                    position: relative;
                }

                /* Logo centré */
                :global(.layout-topbar-logo) {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    text-decoration: none;
                    z-index: 1;
                    transition: transform 0.2s ease;
                }

                :global(.layout-topbar-logo:hover) {
                    transform: translate(-50%, -50%) scale(1.05);
                }

                /* Actions à droite */
                :global(.layout-topbar-actions) {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-left: auto;
                }

                /* Style du logo */
                .topbar-logo-split {
                    display: inline-flex;
                    align-items: center;
                    font-family: 'Poppins', 'Inter', sans-serif;
                    font-weight: 900;
                    font-size: 1.75rem;
                    letter-spacing: -0.04em;
                    user-select: none;
                    position: relative;
                    white-space: nowrap;
                }

                .logo-part-blue {
                    color: #1e3a8a;
                    background: linear-gradient(135deg, #1e3a8a, #2563eb);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    position: relative;
                    padding-right: 2px;
                }

                .logo-part-blue::after {
                    content: '';
                    position: absolute;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 2px;
                    height: 70%;
                    background: #ff7215ff;
                }

                .logo-part-red {
                    color: #ef4444;
                    background: linear-gradient(135deg, #f59352ff, #dc2626);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    padding-left: 2px;
                }

                /* Animations hover */
                .topbar-logo-split:hover .logo-part-blue {
                    animation: slideLeft 0.3s ease;
                }

                .topbar-logo-split:hover .logo-part-red {
                    animation: slideRight 0.3s ease;
                }

                @keyframes slideLeft {
                    50% { transform: translateX(-3px); }
                }

                @keyframes slideRight {
                    50% { transform: translateX(3px); }
                }

                /* Responsive - Tablette */
                @media (max-width: 991px) {
                    .topbar-logo-split {
                        font-size: 1.5rem;
                    }

                    :global(.layout-topbar) {
                        padding: 0.75rem 1rem;
                    }
                }

                /* Responsive - Mobile */
                @media (max-width: 768px) {
                    .topbar-logo-split {
                        font-size: 1.35rem;
                    }

                    :global(.layout-topbar) {
                        padding: 0.75rem 0.75rem;
                    }
                }

                /* Très petit écran */
                @media (max-width: 480px) {
                    /* Logo plus petit sur très petit écran */
                    .topbar-logo-split {
                        font-size: 1.25rem;
                    }

                    /* Ajuster les boutons */
                    :global(.layout-topbar-button) {
                        padding: 0.5rem !important;
                    }

                    :global(.layout-topbar-button i) {
                        font-size: 1rem !important;
                    }
                }

                /* Style pour le bouton de déconnexion */
                :global(.layout-topbar-button) {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.625rem 1rem;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                    text-decoration: none;
                    color: var(--text-color);
                    background: transparent;
                    border: none;
                    cursor: pointer;
                }

                :global(.layout-topbar-button:hover) {
                    background: var(--surface-hover);
                    color: var(--primary-color);
                }

                :global(.layout-topbar-button i) {
                    font-size: 1.125rem;
                }

                /* Menu mobile */
                @media (max-width: 991px) {
                    :global(.layout-topbar-menu) {
                        position: absolute;
                        top: 100%;
                        right: 0;
                        background: var(--surface-overlay);
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        padding: 0.5rem;
                        margin-top: 0.5rem;
                        opacity: 0;
                        visibility: hidden;
                        transform: translateY(-10px);
                        transition: all 0.2s ease;
                    }

                    :global(.layout-topbar-menu-mobile-active) {
                        opacity: 1;
                        visibility: visible;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';
export default AppTopbar;