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

  const handleSearch = (e) => {
    e.preventDefault();
    router.get("/ad/users", { search });
  };

  const handleToggleClick = (sam, action) => {
    setConfirmPopup({ visible: true, sam, action });
  };

  const confirmToggle = async () => {
    try {
      await router.post("/ad/users/toggle", {
        sam: confirmPopup.sam,
        action: confirmPopup.action,
      });
      router.get("/ad/users", { search });
    } catch (err) {
      alert("Erreur lors du changement de statut");
    } finally {
      setConfirmPopup({ visible: false, sam: null, action: null });
    }
  };

  const UserRow = ({ user }) => (
    <tr className="text-left hover:bg-gray-50 transition">
      <td className="px-4 py-3 border">{user.name}</td>
      <td className="px-4 py-3 border">{user.sam}</td>
      <td className="px-4 py-3 border">{user.email}</td>
      <td className="px-4 py-3 border">{formatAdDate(user.lastLogon)}</td>
      <td className="px-4 py-3 border">{formatAdDate(user.passwordLastSet)}</td>
      <td className="px-4 py-3 border">
        {user.enabled ? (
          <>
            <span className="text-green-600 font-semibold">✔️</span>
            <button
              className="ml-2 text-red-600 underline hover:text-red-800"
              onClick={() => handleToggleClick(user.sam, "block")}
            >
              Bloquer
            </button>
          </>
        ) : (
          <>
            <span className="text-red-600 font-semibold">❌</span>
            <button
              className="ml-2 text-green-600 underline hover:text-green-800"
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
        <h1 className="text-2xl font-bold mb-6 text-blue-700">Utilisateurs Active Directory</h1>

        {/* Barre de recherche */}
        <form onSubmit={handleSearch} className="mb-6 flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Rechercher un utilisateur..."
            className="border border-gray-300 shadow-sm px-4 py-2 rounded-lg w-full sm:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg transition duration-200"
          >
            Rechercher
          </button>
        </form>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
            <thead className="bg-blue-100 text-blue-800">
              <tr>
                <th className="px-4 py-3 text-left">Nom</th>
                <th className="px-4 py-3 text-left">Identifiant (SAM)</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Dernière connexion</th>
                <th className="px-4 py-3 text-left">Mot de passe modifié le</th>
                <th className="px-4 py-3 text-left">Activé</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users?.length ? (
                users.map((user, i) => <UserRow key={i} user={user} />)
              ) : (
                <tr>
                  <td className="px-4 py-3 text-center" colSpan="6">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <p className="text-sm text-gray-600">
            Page <span className="font-semibold">{meta?.page}</span> /{" "}
            <span className="font-semibold">{Math.ceil(meta?.total / meta?.per_page || 1)}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => router.get(`/ad/users?page=${meta.page - 1}`)}
              disabled={meta.page <= 1}
              className={`px-4 py-2 rounded-lg border ${
                meta.page <= 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-white hover:bg-gray-100 text-blue-600"
              }`}
            >
              ⬅️ Précédent
            </button>
            <button
              onClick={() => router.get(`/ad/users?page=${meta.page + 1}`)}
              disabled={meta.page * meta.per_page >= meta.total}
              className={`px-4 py-2 rounded-lg border ${
                meta.page * meta.per_page >= meta.total
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-white hover:bg-gray-100 text-blue-600"
              }`}
            >
              Suivant ➡️
            </button>
          </div>
        </div>
      </div>

      {/* Popup de confirmation */}
      {confirmPopup.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white p-6 rounded-lg shadow-xl w-80 text-center animate-fade-in">
            <p className="mb-4">
              Voulez-vous vraiment{" "}
              <span className="font-semibold">
                {confirmPopup.action === "block" ? "bloquer" : "débloquer"}
              </span>{" "}
              cet utilisateur ?
            </p>
            <div className="flex justify-around">
              <button
                onClick={confirmToggle}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Oui
              </button>
              <button
                onClick={() => setConfirmPopup({ visible: false, sam: null, action: null })}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
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