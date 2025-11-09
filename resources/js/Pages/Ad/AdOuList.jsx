import React from 'react';
import { usePage, router } from '@inertiajs/react';

export default function AdOuList() {
    const { props } = usePage();
    const ous = props.ous || [];

    const handleClick = (ouDn) => {
        router.get(`/ad/ou-users/${encodeURIComponent(ouDn)}`);
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Organizational Units</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {ous.map((ou) => (
                    <div
                        key={ou.DistinguishedName}
                        className="bg-white border border-gray-200 rounded-lg shadow-md p-5 hover:shadow-lg transition duration-300 cursor-pointer"
                        onClick={() => handleClick(ou.DistinguishedName)}
                    >
                        <h2 className="text-lg font-semibold text-blue-700">{ou.Name}</h2>
                        <p className="text-sm text-gray-500 mt-1">{ou.DistinguishedName}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
