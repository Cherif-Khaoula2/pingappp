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

      {/* Barre de recherche */}
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom..."
          className="border p-2 rounded w-1/3"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Rechercher
        </button>
      </form>

      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>
      )}

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
              <tr key={i} className="border-t hover:bg-gray-50">
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
