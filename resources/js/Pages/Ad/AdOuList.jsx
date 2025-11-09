import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

export default function AdOuList() {
    const { props } = usePage();
    const ous = props.ous || [];
    const [selectedOU, setSelectedOU] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchUsers = async (ouDn) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/ad/users-by-ou', { ou_dn: ouDn });
            setUsers(response.data.data || []);
            setSelectedOU(ouDn);
        } catch (err) {
            setError('Erreur lors de la récupération des utilisateurs.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Organizational Units</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ous.map((ou) => (
                    <div
                        key={ou.DistinguishedName}
                        className="border p-4 rounded shadow hover:bg-gray-100 cursor-pointer"
                        onClick={() => fetchUsers(ou.DistinguishedName)}
                    >
                        <h2 className="font-semibold">{ou.Name}</h2>
                        <p className="text-sm text-gray-600">{ou.DistinguishedName}</p>
                    </div>
                ))}
            </div>

            {selectedOU && (
                <div className="mt-6">
                    <h2 className="text-xl font-bold mb-2">Utilisateurs dans {selectedOU}</h2>
                    {loading ? (
                        <p>Chargement...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : (
                        <ul className="list-disc pl-5">
                            {users.map((user) => (
                                <li key={user.SamAccountName}>
                                    {user.Name} ({user.EmailAddress || 'Pas d’email'})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
