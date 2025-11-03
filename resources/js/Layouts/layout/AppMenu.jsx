import React, { useContext, useMemo } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import { Link } from "@inertiajs/react";

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);

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
                label: 'Administration',
                icon: 'pi pi-fw pi-cog',
                items: [
                    {
                        label: 'Gestion des utilisateurs',
                        icon: 'pi pi-fw pi-user',
                        to: safeRoute('users'),
                    },
                    {
                        label: 'Gestion des rôles',
                        icon: 'pi pi-fw pi-shield',
                        to: ('roles'),
                    },
                     {
                        label: 'Dashboard',
                        icon: 'pi pi-fw pi-home',
                        to:('roles'),
                    },
                     {
                        label: 'LOG',
                        icon: 'pi pi-fw pi-shield',
                        to:('roles'),
                    }
                ]
            },
            {
                label: 'Gestion des utilisateurs',
                icon: 'pi pi-fw pi-cog',
                items: [
                    {
                        label: 'Ajouter un utilisateur',
                        icon: 'pi pi-fw pi-user',
                        to: ('/users'),
                    },
                    {
                        label: 'Bloquer/Debloquer un utilisateur',
                        icon: 'pi pi-fw pi-shield',
                        to:('/ad/users/manage-lock'),
                    },
                     {
                        label: 'Réinitialiser Mot pour un utilisateur',
                        icon: 'pi pi-fw pi-shield',
                        to:('/ad/users/manage-password'),
                    },
                    {
                        label: 'Voir la liste des utilisateurs ',
                        icon: 'pi pi-fw pi-shield',
                        to:('/ad/users'),
                    }
                ]
            },
           
           
        ];
    }, []);

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
