import React, { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";
export default function UsersList() {
  const { users, meta, error, filters } = usePage().props;
  const [search, setSearch] = useState(filters?.search || "");

  const formatAdDate = (value) => {
    if (!value) return "—";
    const match = /\/Date\((\d+)\)\//.exec(value);
    if (match) {
      const date = new Date(parseInt(match[1], 10));
      return date.toLocaleString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return value;
  };

  // 🔍 Fonction de recherche
  const handleSearch = (e) => {
    e.preventDefault();
    router.get("/ad/users", { search });
  };

  return (
        <Layout>
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Utilisateurs Active Directory</h1>

      {/* Champ de recherche */}
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un utilisateur..."
          className="border px-3 py-2 rounded w-1/3"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Rechercher
        </button>
      </form>

      {error && <p className="text-red-600">{error}</p>}

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border">Nom</th>
            <th className="px-4 py-2 border">Identifiant (SAM)</th>
            <th className="px-4 py-2 border">Email</th>
            <th className="px-4 py-2 border">Dernière connexion</th>
            <th className="px-4 py-2 border">Mot de passe modifié le</th>
            <th className="px-4 py-2 border">Activé</th>
          </tr>
        </thead>
        <tbody>
          {users?.length ? (
            users.map((user, i) => (
              <tr key={i} className="text-center">
                <td className="px-4 py-2 border">{user.name}</td>
                <td className="px-4 py-2 border">{user.sam}</td>
                <td className="px-4 py-2 border">{user.email}</td>
                <td className="px-4 py-2 border">{formatAdDate(user.lastLogon)}</td>
                <td className="px-4 py-2 border">{formatAdDate(user.passwordLastSet)}</td>
                <td className="px-4 py-2 border">
                  {user.enabled ? (
                    <span className="text-green-600 font-semibold">✔️</span>
                  ) : (
                    <span className="text-red-600 font-semibold">❌</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-4">
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
