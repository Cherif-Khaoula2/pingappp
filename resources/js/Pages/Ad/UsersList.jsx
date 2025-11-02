import React from 'react';
import { Head } from '@inertiajs/react';

export default function UsersList({ users }) {
  return (
    <div className="p-6">
      <Head title="Utilisateurs Active Directory" />

      <h1 className="text-2xl font-bold mb-4">Utilisateurs Active Directory</h1>

      <table className="min-w-full border border-gray-300 rounded-lg shadow-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Nom</th>
            <th className="p-2 text-left">Identifiant (SAM)</th>
            <th className="p-2 text-left">Email</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="3" className="p-4 text-center text-gray-500">
                Aucun utilisateur trouvé.
              </td>
            </tr>
          ) : (
            users.map((user, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="p-2">{user.name}</td>
                <td className="p-2">{user.sam}</td>
                <td className="p-2">{user.email || '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
