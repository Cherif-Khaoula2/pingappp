import React from 'react';
import { usePage, Link } from '@inertiajs/react';

export default function AdUsersList() {
    const { props } = usePage();
    const users = props.users || [];
    const ouDn = props.ou_dn;
    const error = props.error;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-800">Utilisateurs de l'OU</h1>
                    <Link>
                    /ad/ou-page
                        ← Retour aux OUs
                    </Link>
                </div>

                <div className="mb-4">
                    <p className="text-gray-600">OU sélectionnée :</p>
                    <p className="text-sm font-mono text-gray-700 bg-white p-2 rounded border">{ouDn}</p>
                </div>

                {error ? (
                    <div className="text-red-500 bg-red-100 p-4 rounded shadow">
                        {error}
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-gray-500 bg-white p-4 rounded shadow">
                        Aucun utilisateur trouvé dans cette unité organisationnelle.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {users.map((user) => (
                            <div
                                key={user.SamAccountName}
                                className="bg-white border border-gray-200 rounded-lg p-4 shadow hover:shadow-lg transition duration-300"
                            >
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="bg-blue-100 text-blue-600 rounded-full p-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5.121 17.804A4 4 0 017 16h10a4 4 0 011.879.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">{}</h2>
                                        <p className="text-sm text-gray-500">{user.SamAccountName}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {user.EmailAddress || <span className="italic text-gray-400">Pas d’email</span>}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}