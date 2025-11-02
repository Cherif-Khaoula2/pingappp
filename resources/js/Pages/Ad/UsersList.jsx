import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";
export default function UsersList({ users = [], meta = {}, error }) {
  const [search, setSearch] = useState("");

  const handlePageChange = (newPage) => {
    router.get(
      route("ad.users"),
      { page: newPage, per_page: meta.per_page, search },
      { preserveScroll: true, preserveState: true }
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    router.get(
      route("ad.users"),
      { page: 1, search },
      { preserveScroll: true, preserveState: true }
    );
  };

  const totalPages = Math.ceil((meta.total || 0) / (meta.per_page || 1));

  return (
        <Layout>
    <div className="p-6">
      <Head title="Utilisateurs Active Directory" />
      <h1 className="text-2xl font-semibold mb-4">
        Utilisateurs Active Directory
      </h1>


      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>
      )}

     <table className="w-full border-collapse border border-gray-300">
  <thead className="bg-gray-100">
    <tr>
      <th className="px-4 py-2 border">Nom</th>
      <th className="px-4 py-2 border">Identifiant (SAM)</th>
      <th className="px-4 py-2 border">Email</th>
      <th className="px-4 py-2 border">Dernière connexion</th>
      <th className="px-4 py-2 border">Mot de passe modifié le</th>
      <th className="px-4 py-2 border">Statut</th>
    </tr>
  </thead>
  <tbody>
    {users.length > 0 ? (
      users.map((user, index) => (
        <tr key={index} className="hover:bg-gray-50">
          <td className="px-4 py-2 border">{user.name}</td>
          <td className="px-4 py-2 border">{user.sam}</td>
          <td className="px-4 py-2 border">{user.email}</td>
          <td className="px-4 py-2 border">{user.lastLogon}</td>
          <td className="px-4 py-2 border">{user.passwordLastSet}</td>
          <td className="px-4 py-2 border">
            {user.enabled
              ? <span className="text-green-600 font-semibold">Actif</span>
              : <span className="text-red-600 font-semibold">Désactivé</span>
            }
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="6" className="text-center py-4 text-gray-500">
          Aucun utilisateur trouvé.
        </td>
      </tr>
    )}
  </tbody>
</table>

      {/* Pagination */}
      {meta.total > meta.per_page && (
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={meta.page <= 1}
            onClick={() => handlePageChange(meta.page - 1)}
            className={`px-4 py-2 rounded ${
              meta.page <= 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-800 text-white hover:bg-gray-900"
            }`}
          >
            Précédent
          </button>

          <span className="text-gray-600">
            Page {meta.page} / {totalPages}
          </span>

          <button
            disabled={meta.page >= totalPages}
            onClick={() => handlePageChange(meta.page + 1)}
            className={`px-4 py-2 rounded ${
              meta.page >= totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-800 text-white hover:bg-gray-900"
            }`}
          >
            Suivant
          </button>
        </div>
      )}
    </div>
    </Layout>
  );
}
