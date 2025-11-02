import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import { Link } from "@inertiajs/react";

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);

    const model = [
        {
            label: 'Home',
            items: [
                { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: route('dashboard') },
                { label: 'Ping', icon: 'pi pi-fw pi-wifi', to: '/ping' },
                { label: 'Employees', icon: 'pi pi-fw pi-user', to: '/employees' },
                { label: 'IPCONFIG', icon: 'pi pi-fw pi-user', to: '/ad/ipconfig' },
                { label: 'ADUSER', icon: 'pi pi-fw pi-user', to: '/ad/users' },

                
            ]
        },
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;