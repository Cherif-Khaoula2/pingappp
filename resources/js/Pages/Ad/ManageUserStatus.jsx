import React, { useState } from "react";
import { router } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";

export default function ManageUserStatus() {
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) {
      alert("Veuillez saisir un SAMAccountName.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/ad/users/find", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute("content"),
        },
        body: JSON.stringify({ search }),
      });

      const data = await response.json();

      if (data.success && data.users) {
        setUser(data.users);
      } else {
        alert("Utilisateur introuvable.");
        setUser(null);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche :", error);
      alert("Erreur lors de la recherche de l'utilisateur.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (sam) => {
    const confirmMsg = user.Enabled
      ? "Voulez-vous vraiment bloquer cet utilisateur ?"
      : "Voulez-vous vraiment débloquer cet utilisateur ?";

    if (!confirm(confirmMsg)) return;

    try {
      const response = await fetch("/ad/users/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute("content"),
        },
        body: JSON.stringify({ sam }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        // ✅ Met à jour l’état sans relancer la recherche
        setUser((prev) => ({
          ...prev,
          Enabled: !prev.Enabled,
        }));
      } else {
        alert("Erreur : " + data.message);
      }
    } catch (error) {
      console.error("Erreur lors du changement d'état :", error);
      alert("Erreur de communication avec le serveur.");
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Gestion du statut des utilisateurs Active Directory
        </h2>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Entrez le SAMAccountName..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border rounded-lg px-4 py-2 focus:ring focus:ring-blue-300"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            {loading ? "Recherche..." : "Rechercher"}
          </button>
        </div>

        {user && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Résultat :
            </h3>
            <table className="w-full text-left border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Nom</th>
                  <th className="px-4 py-2 border">SAMAccountName</th>
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border">Statut</th>
                  <th className="px-4 py-2 border text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border">{user.Name}</td>
                  <td className="px-4 py-2 border">{user.SamAccountName}</td>
                  <td className="px-4 py-2 border">{user.EmailAddress}</td>
                  <td className="px-4 py-2 border text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-white ${
                        user.Enabled ? "bg-green-600" : "bg-red-600"
                      }`}
                    >
                      {user.Enabled ? "Actif" : "Bloqué"}
                    </span>
                  </td>
                  <td className="px-4 py-2 border text-center">
                    <button
                      onClick={() => handleToggle(user.SamAccountName)}
                      className={`px-4 py-1 rounded-lg text-white ${
                        user.Enabled
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {user.Enabled ? "Bloquer" : "Débloquer"}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
