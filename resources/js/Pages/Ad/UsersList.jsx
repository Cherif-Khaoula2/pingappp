import React, { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";

export default function UsersList() {
  const { users, meta, error } = usePage().props;
  const [search, setSearch] = useState("");
  const [confirmPopup, setConfirmPopup] = useState({
    visible: false,
    sam: null,
    action: null,
  });

  // Fonction pour formater les dates AD
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

    if (!isNaN(Date.parse(value))) {
      return new Date(value).toLocaleString("fr-FR");
    }

    return value;
  };

  // Recherche
  const handleSearch = (e) => {
    e.preventDefault();
    router.get("/ad/users", { search });
  };

  // Préparer le popup de confirmation
  const handleToggleClick = (sam, action) => {
    setConfirmPopup({ visible: true, sam, action });
  };

  // Confirmer le blocage/déblocage
  const confirmToggle = async () => {
    try {
      await router.post("/ad/users/toggle", {
        sam: confirmPopup.sam,
        action: confirmPopup.action,
      });
      router.get("/ad/users", { search }); // rafraîchir
    } catch (err) {
      alert("Erreur lors du changement de statut");
    } finally {
      setConfirmPopup({ visible: false, sam: null, action: null });
    }
  };

  // Ligne utilisateur
  const UserRow = ({ user }) => (
    <tr className="text-center">
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
              onClick={() => handleToggleClick(user.sam, "block")}
            >
              Bloquer
            </button>
          </>
        ) : (
          <>
            <span className="text-red-600 font-semibold">❌</span>
            <button
              className="ml-2 text-green-600 underline"
              onClick={() => handleToggleClick(user.sam, "unblock")}
            >
              Débloquer
            </button>
          </>
        )}
      </td>
    </tr>
  );

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Utilisateurs Active Directory</h1>

        {/* Formulaire de recherche */}
        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un utilisateur..."
            className="border px-3 py-2 rounded w-1/3"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Rechercher
          </button>
        </form>

        {error && <p className="text-red-600">{error}</p>}

        {/* Tableau utilisateurs */}
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
              users.map((user, i) => <UserRow key={i} user={user} />)
            ) : (
              <tr>
                <td className="px-4 py-2 border text-center" colSpan="6">
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between mt-4">
          <p>
            Page {meta?.page} / {Math.ceil(meta?.total / meta?.per_page || 1)}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => router.get(`/ad/users?page=${meta.page - 1}`)}
              disabled={meta.page <= 1}
              className={`px-3 py-1 border rounded ${
                meta.page <= 1 ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              ⬅️ Précédent
            </button>
            <button
              onClick={() => router.get(`/ad/users?page=${meta.page + 1}`)}
              disabled={meta.page * meta.per_page >= meta.total}
              className={`px-3 py-1 border rounded ${
                meta.page * meta.per_page >= meta.total ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              Suivant ➡️
            </button>
          </div>
        </div>
      </div>

      {/* Popup de confirmation */}
      {confirmPopup.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80 text-center">
            <p className="mb-4">
              Voulez-vous vraiment {confirmPopup.action === "block" ? "bloquer" : "débloquer"} cet utilisateur ?
            </p>
            <div className="flex justify-around">
              <button
                onClick={confirmToggle}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Oui
              </button>
              <button
                onClick={() => setConfirmPopup({ visible: false, sam: null, action: null })}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Non
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
