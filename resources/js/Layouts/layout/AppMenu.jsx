import React, { useContext, useMemo } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import { usePage } from '@inertiajs/react';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const { props } = usePage();
    const permissions = props.userspermissions || props.permissions || [];


    const hasPermission = (perm) => permissions.includes(perm);

    const model = useMemo(() => {
        const safeRoute = (name, params = {}) => {
            try {
                return route(name, params);
            } catch (error) {
                console.warn(`Route "${name}" ignorée:`, error.message);
                return '#';
            }
        };

        // --- DASHBOARD toujours visible ---
        const dashboard = {
            label: 'Dashboard',
            icon: 'pi pi-fw pi-home',
            to: safeRoute('dashboard'),
            items: [
                {
                    label: 'Dashboard',
                    icon: 'pi pi-fw pi-home',
                    to: safeRoute('dashboard'),
                },
            ],
        };

        // --- ADMINISTRATION ---
        const adminItems = [
            hasPermission('getalluser') && {
                label: 'Gestion des utilisateurs',
                icon: 'pi pi-fw pi-users',
                to: safeRoute('users'),
            },
            hasPermission('getallrole') && {
                label: 'Gestion des rôles',
                icon: 'pi pi-fw pi-shield',
                to: safeRoute('roles.index'),
            },
            hasPermission('getallhidden') && {
                label: 'Masquer utilisateur',
                icon: 'pi pi-fw pi-eye-slash',
                to: safeRoute('hidden.list'),
            },
            hasPermission('getlog') && {
                label: 'LOG',
                icon: 'pi pi-fw pi-file',
                to: safeRoute('ad.logs.index'),
            },
            hasPermission('managedn') && {
                label: 'Périmètre Administrateur',
                icon: 'pi pi-link',
                to: safeRoute('dns.index'),
            },
             hasPermission('manageuserou') && {
                label: 'Unités Organisationnelles',
                icon: 'pi pi-sitemap',
                to: safeRoute('ad.ou'),
            },
        ].filter(Boolean);

        const administration =
            adminItems.length > 0
                ? {
                      label: 'Administration',
                      icon: 'pi pi-fw pi-cog',
                      items: adminItems,
                  }
                : null;

        // --- GESTION UTILISATEURS ---
        const userItems = [
            hasPermission('addaduser') && {
                label: 'Ajouter utilisateur',
                icon: 'pi pi-fw pi-user-plus',
                to: safeRoute('ad.add-user'),
            },
            hasPermission('blockaduser') && {
                label: 'Bloquer/Débloquer utilisateur',
                icon: 'pi pi-ban',
                to: safeRoute('ad.users.manage-lock'),
            },
            hasPermission('resetpswaduser') && {
                label: 'Réinitialiser Mdp utilisateur',
                icon: 'pi pi-fw pi-key',
                to: safeRoute('ad.users.manage-password'),
            },
            hasPermission('getadpc') && {
                label: 'Mdp Admin Local',
                icon: 'pi pi-unlock',
                to: safeRoute('computers.find'),
            },
        ].filter(Boolean);

        const gestionUtilisateurs =
            userItems.length > 0
                ? {
                      label: 'Gestion des utilisateurs',
                      icon: 'pi pi-fw pi-user-edit',
                      items: userItems,
                  }
                : null;

        // --- GESTION ORDINATEURS ---
        const computerItems = [
            hasPermission('getadpc') && {
                label: 'Voir liste des ordinateurs',
                icon: 'pi pi-fw pi-desktop',
                to: safeRoute('ad.computers.laps'),
            },
        ].filter(Boolean);

        const gestionOrdinateurs =
            computerItems.length > 0
                ? {
                      label: 'Gestion des ordinateurs',
                      icon: 'pi pi-fw pi-desktop',
                      items: computerItems,
                  }
                : null;

        // --- Filtrage global ---
        return [dashboard, administration, gestionUtilisateurs, gestionOrdinateurs].filter(Boolean);
    }, [permissions]);

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) =>
                    !item?.separator ? (
                        <AppMenuitem item={item} root={true} index={i} key={item.label} />
                    ) : (
                        <li className="menu-separator" key={`sep-${i}`}></li>
                    )
                )}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;