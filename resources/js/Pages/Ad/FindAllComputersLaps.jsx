import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Skeleton } from "primereact/skeleton";
import { Message } from "primereact/message";
import { Tooltip } from "primereact/tooltip";
import Layout from "@/Layouts/layout/layout.jsx";

export default function FindAllComputersLaps() {
  const [computers, setComputers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    fetchComputers();
  }, []);

  const fetchComputers = async (filter = "") => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("/ad/computers/laps/all", {
        params: { search: filter }
      });
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

  const handleSearch = () => {
    fetchComputers(search);
  };

  const handleClearSearch = () => {
    setSearch("");
    setGlobalFilter("");
    fetchComputers();
  };

  // Templates pour les colonnes
  const statusBodyTemplate = (rowData) => (
    <Tag
      value={rowData.enabled ? "Actif" : "Inactif"}
      severity={rowData.enabled ? "success" : "danger"}
      icon={rowData.enabled ? "pi pi-check-circle" : "pi pi-times-circle"}
      className="font-semibold"
    />
  );

  const nameBodyTemplate = (rowData) => (
    <div className="flex align-items-center gap-2">
      <i className="pi pi-desktop text-primary text-xl"></i>
      <span className="font-semibold text-900">{rowData.name}</span>
    </div>
  );

  const lapsPasswordTemplate = (rowData) => {
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      if (rowData.laps_password) {
        navigator.clipboard.writeText(rowData.laps_password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };

    if (!rowData.laps_password) {
      return <span className="text-500 italic">Non disponible</span>;
    }

    return (
      <div className="flex align-items-center gap-2">
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 border-round">
          {showPassword ? rowData.laps_password : "••••••••••••"}
        </span>
        <Button
          icon={showPassword ? "pi pi-eye-slash" : "pi pi-eye"}
          className="p-button-text p-button-sm"
          onClick={() => setShowPassword(!showPassword)}
          tooltip={showPassword ? "Masquer" : "Afficher"}
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon={copied ? "pi pi-check" : "pi pi-copy"}
          className="p-button-text p-button-sm"
          onClick={handleCopy}
          tooltip={copied ? "Copié!" : "Copier"}
          tooltipOptions={{ position: "top" }}
          severity={copied ? "success" : "secondary"}
        />
      </div>
    );
  };

  // Skeleton pour le chargement
  const renderSkeletonTable = () => (
    <div className="flex flex-column gap-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-3 p-3 border-round bg-gray-50">
          <Skeleton width="30%" height="2rem" />
          <Skeleton width="20%" height="2rem" />
          <Skeleton width="50%" height="2rem" />
        </div>
      ))}
    </div>
  );

  // En-tête du tableau
  const tableHeader = (
    <div className="flex flex-column md:flex-row justify-content-between align-items-center gap-3">
      <div>
        <h2 className="text-900 text-2xl font-bold m-0 mb-1">
          <i className="pi pi-shield text-primary mr-2"></i>
          Ordinateurs LAPS
        </h2>
        <p className="text-600 text-sm m-0">
          Gestion des mots de passe administrateur local
        </p>
      </div>
      <div className="flex gap-2">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Filtrer les résultats..."
            className="w-full md:w-20rem"
          />
        </span>
        <Button
          icon="pi pi-refresh"
          className="p-button-outlined"
          onClick={() => fetchComputers(search)}
          tooltip="Actualiser"
          tooltipOptions={{ position: "bottom" }}
        />
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="page-container">
       

    

        {/* Message d'erreur */}
        {error && (
          <Message 
            severity="error" 
            text={error} 
            className="w-full mb-3"
            icon="pi pi-exclamation-triangle"
          />
        )}

        {/* Tableau des données */}
        <Card className="data-card">
          {loading ? (
            renderSkeletonTable()
          ) : (
            <DataTable
              value={computers}
              paginator
              rows={15}
              rowsPerPageOptions={[10, 15, 25, 50]}
              responsiveLayout="scroll"
              stripedRows
              header={tableHeader}
              globalFilter={globalFilter}
              emptyMessage={
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="pi pi-inbox"></i>
                  </div>
                  <h3 className="empty-title">Aucun ordinateur trouvé</h3>
                  <p className="empty-description">
                    {search 
                      ? "Essayez de modifier votre recherche ou effacez les filtres" 
                      : "Aucun ordinateur avec LAPS n'est disponible pour le moment"}
                  </p>
                  {search && (
                    <Button
                      label="Effacer la recherche"
                      icon="pi pi-times"
                      className="p-button-outlined mt-3"
                      onClick={handleClearSearch}
                    />
                  )}
                </div>
              }
              className="modern-datatable"
            >
              <Column 
                field="name" 
                header="Nom de l'ordinateur" 
                body={nameBodyTemplate}
                sortable 
                style={{ minWidth: '250px' }}
              />
              <Column 
                header="Statut" 
                body={statusBodyTemplate} 
                sortable 
                style={{ minWidth: '120px' }}
                align="center"
              />
              <Column 
                field="laps_password" 
                header="Mot de passe LAPS" 
                body={lapsPasswordTemplate}
                style={{ minWidth: '350px' }}
              />
            </DataTable>
          )}
        </Card>

      </div>

      <style jsx>{`
        .page-container {
          padding: 1.5rem;
          background: linear-gradient(135deg, #f5f7fa 0%, #ffffffff 100%);
          min-height: 100vh;
        }

        /* Barre supérieure */
        .top-bar {
          margin-bottom: 1.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
        }

        .stat-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.5rem;
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .stat-info {
          flex: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0 0 0.25rem 0;
          font-weight: 500;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        /* Carte de recherche */
        .search-card {
          margin-bottom: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .search-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .search-input-group {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .search-input {
          padding: 0.75rem 1rem 0.75rem 2.5rem !important;
          font-size: 1rem !important;
          border-radius: 8px !important;
        }

        .search-button {
          padding: 0.75rem 1.5rem;
          font-weight: 600;
        }

        .search-info {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          color: #1e40af;
          font-size: 0.875rem;
        }

        /* Carte de données */
        .data-card {
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          margin-bottom: 1.5rem;
        }

        /* État vide */
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-icon {
          font-size: 4rem;
          color: #d1d5db;
          margin-bottom: 1.5rem;
        }

        .empty-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
        }

        .empty-description {
          font-size: 1rem;
          color: #6b7280;
          margin: 0;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }

        /* Barre inférieure */
        .bottom-bar {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          padding: 1rem 1.5rem;
        }

        .bottom-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .info-item i {
          font-size: 1.25rem;
        }

        .info-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        /* DataTable personnalisé */
        :global(.modern-datatable .p-datatable-header) {
          background: transparent;
          border: none;
          padding: 1.5rem;
        }

        :global(.modern-datatable .p-datatable-thead > tr > th) {
          background: #f9fafb;
          color: #374151;
          font-weight: 600;
          border: none;
          padding: 1rem;
        }

        :global(.modern-datatable .p-datatable-tbody > tr) {
          transition: background-color 0.2s;
        }

        :global(.modern-datatable .p-datatable-tbody > tr:hover) {
          background-color: #f9fafb;
        }

        :global(.modern-datatable .p-datatable-tbody > tr > td) {
          padding: 1rem;
          border: none;
          border-bottom: 1px solid #f3f4f6;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .page-container {
            padding: 1rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .search-input-group {
            flex-direction: column;
          }

          .search-input-group > * {
            width: 100%;
          }

          .bottom-info {
            flex-direction: column;
            align-items: flex-start;
          }

          .stat-value {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 640px) {
          .stat-icon {
            width: 50px;
            height: 50px;
            font-size: 1.25rem;
          }

          .empty-icon {
            font-size: 3rem;
          }

          .empty-title {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </Layout>
  );
}