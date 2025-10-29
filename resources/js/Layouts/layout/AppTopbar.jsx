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
            {/* Logo / App Name */}
            <div className="topbar-logo">
                <span className="logo-symbol">T</span>
                <span className="logo-text">osys</span>
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

            {/* Profile / Logout */}
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
                <Link href={route('profile.edit')} className="p-link layout-topbar-button">
                    <i className="pi pi-user"></i>
                    <span>Profil</span>
                </Link>
                <Link href={route('logout')} method="post" as="button" className="p-link layout-topbar-button">
                    <i className="pi pi-lock"></i>
                    <span>Déconnexion</span>
                </Link>
            </div>

            {/* Inline style for simplicity */}
            <style jsx>{`
                .topbar-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-family: 'Poppins', 'Inter', sans-serif;
                    font-weight: 700;
                    color: #0f172a;
                    user-select: none;
                }

                .logo-symbol {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: linear-gradient(135deg, #155eccff, #6366f1);
                    color: white;
                    font-size: 1.3rem;
                    font-weight: 800;
                    box-shadow: 0 2px 6px rgba(99, 102, 241, 0.2);
                }

                .logo-text {
                    font-size: 1.3rem;
                    letter-spacing: -0.02em;
                    background: linear-gradient(90deg, #0e4fa5ff, #6366f1);
                    -webkit-background-clip: text;
                    color: transparent;
                }

                @media (max-width: 768px) {
                    .logo-text {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';
export default AppTopbar;
