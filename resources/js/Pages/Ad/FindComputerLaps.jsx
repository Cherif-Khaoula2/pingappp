import React, { useState, useRef } from "react";
import axios from "axios";
import Layout from "@/Layouts/layout/layout.jsx";
import {Head} from '@inertiajs/react';
export default function FindComputerLaps() {
  const [computer, setComputer] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleSearch = async () => {
    const sam = computer.trim();
    if (!sam) {
      setError("Veuillez saisir un nom d'ordinateur.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/ad/computers/get-laps-password", { sam });
      if (res.data?.success) {
        const pwd = typeof res.data.laps_password === "string"
          ? res.data.laps_password
          : JSON.stringify(res.data.laps_password);

        setRows(prev => [{ sam, laps_password: pwd }, ...prev.filter(r => r.sam !== sam)]);
        setComputer("");
        inputRef.current?.focus();
      } else {
        setError(res.data?.message || "Aucun mot de passe LAPS trouvé.");
      }
    } catch (e) {
      setError("Erreur serveur lors de la récupération du LAPS.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <Layout>
        <Head title="Mdp Admin Local" />
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          🔍 Recherche Ordinateur (AD) — LAPS
        </h2>

        <div className="flex gap-4 mb-4">
          <input
            ref={inputRef}
            type="text"
            value={computer}
            onChange={e => setComputer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nom d'ordinateur ou SamAccountName..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className={`px-5 py-3 rounded-lg font-medium text-white transition ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Recherche..." : "Rechercher"}
          </button>
        </div>

        {error && (
          <div className="text-red-600 mb-4 text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-700 uppercase text-sm tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Ordinateur</th>
                <th className="px-6 py-3 text-left">Mot de passe LAPS</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                    Aucune donnée — saisissez un ordinateur et cliquez sur « Rechercher »
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 font-medium text-gray-800">{r.sam}</td>
                    <td className="px-6 py-4 font-mono text-gray-900">{r.laps_password}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}