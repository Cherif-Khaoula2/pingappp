import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressSpinner } from "primereact/progressspinner";

export default function FindAllComputersLaps() {
  const [computers, setComputers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchComputers();
  }, []);

  const fetchComputers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/ad/computers/laps/all"); // route API à créer
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

  const statusBodyTemplate = (rowData) => (
    <span
      className={rowData.enabled ? "text-green-600 font-bold" : "text-red-600 font-bold"}
    >
      {rowData.enabled ? "Enabled" : "Disabled"}
    </span>
  );

  return (
    <Card title="Liste des ordinateurs avec LAPS">
      {loading ? (
        <div className="flex justify-center">
          <ProgressSpinner />
        </div>
      ) : error ? (
        <div className="text-red-600 font-bold">{error}</div>
      ) : (
        <DataTable value={computers} paginator rows={20} responsiveLayout="scroll">
          <Column field="name" header="Nom de l'ordinateur" sortable />
          <Column header="Statut" body={statusBodyTemplate} sortable />
          <Column field="laps_password" header="Mot de passe LAPS" />
        </DataTable>
      )}
    </Card>
  );
}
