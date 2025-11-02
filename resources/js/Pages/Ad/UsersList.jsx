import React from "react";
import { usePage } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";
export default function UsersList() {
  const { users, meta, error } = usePage().props;

  // Fonction utilitaire pour formater la date AD
  const formatAdDate = (value) => {
    if (!value) return "—";

    // Format AD typique : /Date(1758790730256)/
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

    // Si déjà une date formatée (au cas où)
    if (!isNaN(Date.parse(value))) {
      return new Date(value).toLocaleString("fr-FR");
    }

    return value;
  };
const handleSearch = (e) => {
    e.preventDefault();
    router.get("/ad/users", { search });
  };
  return (
        <Layout>
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Utilisateurs Active Directory</h1>
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
        <>
          <span className="text-green-600 font-semibold">✔️</span>
          <button
            className="ml-2 text-red-600 underline"
            onClick={() => toggleUser(user.sam, 'block')}
          >
            Bloquer
          </button>
        </>
      ) : (
        <>
          <span className="text-red-600 font-semibold">❌</span>
          <button
            className="ml-2 text-green-600 underline"
            onClick={() => toggleUser(user.sam, 'unblock')}
          >
            Débloquer
          </button>
        </>
      )}
    </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-4 py-2 border text-center" colSpan="6">
                Aucun utilisateur trouvé.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination simple */}
      <div className="flex justify-between mt-4">
        <p>
          Page {meta?.page} / {Math.ceil(meta?.total / meta?.per_page || 1)}
        </p>
        <div className="flex gap-2">
          <a
            href={`?page=${meta.page - 1}`}
            className={`px-3 py-1 border rounded ${
              meta.page <= 1 ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            ⬅️ Précédent
          </a>
          <a
            href={`?page=${meta.page + 1}`}
            className={`px-3 py-1 border rounded ${
              meta.page * meta.per_page >= meta.total
                ? "opacity-50 pointer-events-none"
                : ""
            }`}
          >
            Suivant ➡️
          </a>
        </div>
      </div>
    </div>
    </Layout>
  );
}
