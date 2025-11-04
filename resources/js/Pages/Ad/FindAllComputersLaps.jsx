import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import Layout from "@/Layouts/layout/layout.jsx";

export default function FindAllComputersLaps() {
  const [computers, setComputers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchComputers();
  }, []);

  const fetchComputers = async (filter = "") => {
    setError("");
    setLoading(true);
    setProgress(0);

    // Simulation barre de progression
    const interval = setInterval(() => {
      setProgress((old) => Math.min(old + Math.random() * 20, 90));
    }, 300);

    try {
      const response = await axios.get("/ad/computers/laps/all", {
        params: { search: filter },
      });
      clearInterval(interval);
      setProgress(100);
      if (response.data.success) {
        setComputers(response.data.computers);
      } else {
        setError(response.data.message || "Erreur inconnue");
      }
    } catch (err) {
      clearInterval(interval);
      setProgress(100);
      setError(err.response?.data?.message || err.message);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300); // Laisser la barre finir doucement
    }
  };

  const handleSearch = () => fetchComputers(search);
  const handleClearSearch = () => {
    setSearch("");
    fetchComputers();
  };

  const statusBodyTemplate = (rowData) => (
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
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            className="p-inputtext"
            placeholder="Rechercher par nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="p-button" onClick={handleSearch}>
            Rechercher
          </button>
          {search && (
            <button className="p-button p-button-outlined" onClick={handleClearSearch}>
              Effacer
            </button>
          )}
        </div>

        {/* Barre de progression en haut */}
        {loading && (
          <div className="relative w-full h-1 mb-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {/* Erreur */}
        {error && <div className="text-red-600 font-bold mb-4">{error}</div>}

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
              <p className="text-600">
                {search ? "Essayez de modifier votre recherche" : "Aucun ordinateur disponible"}
              </p>
            </div>
          }
        >
          <Column field="name" header="Nom de l'ordinateur" sortable />
          <Column header="Statut" body={statusBodyTemplate} sortable />
          <Column field="laps_password" header="Mot de passe LAPS" body={lapsPasswordTemplate} />
        </DataTable>
      </Card>
    </Layout>
  );
}
