import React from "react";
import { Head } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";
export default function UsersList({ users = [], meta = {}, error }) {
  return (
        <Layout>
    <div className="p-6">
      <Head title="Utilisateurs Active Directory" />
      <h1 className="text-2xl font-semibold mb-4">Utilisateurs Active Directory</h1>

      {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}

      <table className="min-w-full bg-white border rounded-lg shadow-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Nom</th>
            <th className="p-2 text-left">Identifiant (SAM)</th>
            <th className="p-2 text-left">Email</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((u, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.sam}</td>
                <td className="p-2">{u.email}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="p-3 text-center text-gray-500">
                Aucun utilisateur trouvé.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </Layout>
  );
}
