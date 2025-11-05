import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import Layout from "@/Layouts/layout/layout.jsx";

export default function FindAllComputersLaps() {
  const [computers, setComputers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchComputers();
  }, []);

  const fetchComputers = async (filter = "") => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("/ad/computers/laps/all", { params: { search: filter } });
      if (response.data.success) {
        setComputers(response.data.computers);
      } else {
        setError(response.data.message || "Erreur inconnue");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchComputers(search);
  const handleClearSearch = () => {
    setSearch("");
    fetchComputers();
  };

  const statusTemplate = (rowData) => (
    <Tag
      value={rowData.enabled ? "Enabled" : "Disabled"}
      severity={rowData.enabled ? "success" : "danger"}
      rounded
    />
  );

  const lapsPasswordTemplate = (rowData) => (
    <span className="font-mono">{rowData.laps_password || "—"}</span>
  );

  return (
    <Layout>
      <Card className="shadow-2 p-4">
        {/* Barre de recherche */}
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            className="p-inputtext"
            placeholder="Rechercher par nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="p-button" onClick={handleSearch}>Rechercher</button>
          {search && (
            <button className="p-button p-button-outlined" onClick={handleClearSearch}>
              Effacer
            </button>
          )}
        </div>

        {/* Barre de chargement linéaire */}
        {loading && (
          <div className="w-full h-1 bg-gray-200 overflow-hidden mb-2 relative">
            <div className="h-1 bg-blue-500 absolute left-0 top-0 animate-slide"></div>
          </div>
        )}

        {error && <div className="text-red-600 font-bold py-2">{error}</div>}

        {/* DataTable */}
        <DataTable
          value={computers}
          paginator
          rows={20}
          responsiveLayout="scroll"
          stripedRows
          emptyMessage={
            <div className="text-center py-6">
              <i className="pi pi-desktop text-400 mb-3" style={{ fontSize: "3rem" }}></i>
              <h3 className="text-900 text-xl font-medium mb-2">Aucun ordinateur trouvé</h3>
              <p className="text-600">{search ? "Essayez de modifier votre recherche" : "Aucun ordinateur disponible"}</p>
            </div>
          }
        >
          <Column field="name" header="Nom de l'ordinateur" sortable />
          <Column header="Statut" body={statusTemplate} sortable />
          <Column field="laps_password" header="Mot de passe LAPS" body={lapsPasswordTemplate} />
        </DataTable>
      </Card>

      <style>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        .animate-slide {
          animation: slide 2s linear infinite;
        }
      `}</style>
    </Layout>
  );
}
