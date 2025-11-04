import React, { useContext, useMemo } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import { Link } from "@inertiajs/react";
import { usePage } from '@inertiajs/react';
const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);

   const { props } = usePage();
    const permissions = props.permissions || [];

    const hasPermission = (perm) => permissions.includes(perm)

    const model = useMemo(() => {
    const safeRoute = (name, params = {}) => {
        try {
            return route(name, params);
        } catch (error) {
            console.warn(`Route "${name}" ignorée:`, error.message);
            return '#';
        }
    };

    return [
        {
            label: 'Dashboard',
            icon: 'pi pi-fw pi-home',
            to: safeRoute('dashboard'),
            items: [
                {label: 'Dashboard',
            icon: 'pi pi-fw pi-home',
            to: safeRoute('dashboard'), }].filter(Boolean),
        },
        {
            label: 'Administration',
            icon: 'pi pi-fw pi-cog',
            items: [
                permissions.includes('getalluser') && {
                    label: 'Gestion des utilisateurs',
                    icon: 'pi pi-fw pi-users',
                    to: safeRoute('users'),
                },

                permissions.includes('getallrole') && {
                    label: 'Gestion des rôles',
                   icon: 'pi pi-fw pi-shield',
                    to: safeRoute('roles.index'),
                },
                 permissions.includes('getallhidden') && {
                    label: 'Masquer utilisateur',
                    icon: 'pi pi-fw pi-eye-slash', 
                    to: safeRoute('hidden.list'),
                },
                permissions.includes('getlog') && {
                    label: 'LOG',
                    icon: 'pi pi-fw pi-file',
                    to: safeRoute('ad.logs.index'),
                }
            ].filter(Boolean), // très important pour enlever les "false"
        },
        {
            label: 'Gestion des utilisateurs',
            icon: 'pi pi-fw pi-user-edit',
            items: [
                permissions.includes('addaduser') && {
                    label: 'Ajouter utilisateur',
                     icon: 'pi pi-fw pi-user-plus',
                    to: safeRoute('ad.add-user'),
                },
                permissions.includes('blockaduser') && {
                    label: 'Bloquer/Debloquer utilisateur',
                   icon: 'pi pi-ban',
                    to: safeRoute('ad.users.manage-lock'),
                },
                permissions.includes('resetpswaduser') && {
                    label: 'Réinitialiser Mdp utilisateur ',
                      icon: 'pi pi-fw pi-key',
                    to: safeRoute('ad.users.manage-password'),
                },
                 permissions.includes('getadpc') && {
                    label: 'Mdp Admin Local ',
                      icon: 'pi pi-unlock',
                    to: safeRoute('computers.find'),
                },
             
             
            ].filter(Boolean),
        },
        {
            label: 'Gestion des ordinateurs',
            icon: 'pi pi-fw pi-user-edit',
            items: [
                
                
                permissions.includes('getadpc') && {
                    label: 'Voir liste des ordinateurs',
                      icon: 'pi pi-fw pi-desktop',
                    to: safeRoute('ad.computers.laps'),
                },
             
            ].filter(Boolean),
        },
    ];
}, [permissions]); // <- ici ! on ajoute permissions comme dépendance


    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => (
                    !item?.separator ? (
                        <AppMenuitem item={item} root={true} index={i} key={item.label} />
                    ) : (
                        <li className="menu-separator" key={`sep-${i}`}></li>
                    )
                ))}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
