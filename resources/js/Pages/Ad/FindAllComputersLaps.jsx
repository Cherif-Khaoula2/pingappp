import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ProgressBar } from "primereact/progressbar";
import { Message } from "primereact/message";
import Layout from "@/Layouts/layout/layout.jsx";

export default function FindAllComputersLaps() {
  const [computers, setComputers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const eventSourceRef = useRef(null);

  useEffect(() => {
    fetchComputersStream();
    
    return () => {
      // Cleanup: fermer la connexion SSE si le composant est démonté
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const fetchComputersStream = () => {
    setLoading(true);
    setLoadingProgress(0);
    setError("");
    setComputers([]);
    setTotalCount(0);

    // Fermer la connexion précédente si elle existe
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Créer une nouvelle connexion Server-Sent Events
    const eventSource = new EventSource("/ad/computers/laps/stream");
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'total':
            setTotalCount(data.count);
            break;

          case 'computer':
            setComputers(prev => [...prev, data.data]);
            // Mettre à jour la progression
            setLoadingProgress(prev => {
              const newProgress = totalCount > 0 
                ? Math.round(((computers.length + 1) / totalCount) * 100)
                : prev + 1;
              return Math.min(newProgress, 100);
            });
            break;

          case 'done':
            setLoading(false);
            setLoadingProgress(100);
            setTimeout(() => setLoadingProgress(0), 500);
            eventSource.close();
            break;

          case 'error':
            setError(data.message || "Erreur inconnue");
            setLoading(false);
            setLoadingProgress(0);
            eventSource.close();
            break;
        }
      } catch (err) {
        console.error("Erreur de parsing SSE:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("Erreur SSE:", err);
      setError("Erreur de connexion au serveur");
      setLoading(false);
      setLoadingProgress(0);
      eventSource.close();
    };
  };

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

  const tableHeader = (
    <div className="flex flex-column md:flex-row justify-content-between align-items-center gap-3">
      <div>
        <h2 className="text-900 text-2xl font-bold m-0 mb-1">
          <i className="pi pi-shield text-primary mr-2"></i>
          Ordinateurs LAPS
        </h2>
        <p className="text-600 text-sm m-0">
          {loading 
            ? `Chargement... ${computers.length}${totalCount > 0 ? `/${totalCount}` : ''} ordinateur(s)`
            : `${computers.length} ordinateur(s) disponible(s)`
          }
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
            disabled={loading}
          />
        </span>
        <Button
          icon="pi pi-refresh"
          className="p-button-outlined"
          onClick={fetchComputersStream}
          tooltip="Actualiser"
          tooltipOptions={{ position: "bottom" }}
          disabled={loading}
        />
      </div>
    </div>
  );

  return (
    <Layout>
      {/* Barre de progression fine en haut */}
      {loadingProgress > 0 && (
        <div className="top-progress-bar">
          <ProgressBar 
            value={loadingProgress} 
            showValue={false}
            style={{ height: '4px', borderRadius: 0 }}
            className="progress-bar-custom"
          />
          <div className="progress-text">
            <i className="pi pi-spin pi-spinner mr-2"></i>
            Chargement en temps réel... {computers.length}{totalCount > 0 ? `/${totalCount}` : ''} ({loadingProgress}%)
          </div>
        </div>
      )}

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

        {/* Tableau des données - Les PC apparaissent en temps réel */}
        <Card className="data-card">
          <DataTable
            value={computers}
            paginator={!loading}
            rows={15}
            rowsPerPageOptions={[10, 15, 25, 50]}
            responsiveLayout="scroll"
            stripedRows
            header={tableHeader}
            globalFilter={globalFilter}
            emptyMessage={
              <div className="empty-state">
                <div className="empty-icon">
                  {loading ? (
                    <i className="pi pi-spin pi-spinner text-primary"></i>
                  ) : (
                    <i className="pi pi-inbox"></i>
                  )}
                </div>
                <h3 className="empty-title">
                  {loading ? "Connexion au serveur..." : "Aucun ordinateur trouvé"}
                </h3>
                <p className="empty-description">
                  {loading 
                    ? "Les ordinateurs apparaîtront en temps réel..."
                    : "Aucun ordinateur avec LAPS n'est disponible"
                  }
                </p>
              </div>
            }
            className="modern-datatable"
          >
            <Column 
              field="name" 
              header="Nom de l'ordinateur" 
              body={nameBodyTemplate}
              sortable={!loading}
              style={{ minWidth: '250px' }}
            />
            <Column 
              header="Statut" 
              body={statusBodyTemplate} 
              sortable={!loading}
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
        </Card>
      </div>

      <style jsx>{`
        .top-progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .progress-text {
          padding: 0.75rem 1.5rem;
          font-size: 0.875rem;
          color: #4f46e5;
          font-weight: 600;
          display: flex;
          align-items: center;
          background: #f8f9fa;
          border-top: 1px solid #e5e7eb;
        }

        :global(.progress-bar-custom .p-progressbar-value) {
          background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%);
          background-size: 200% 100%;
          animation: gradient-shift 2s ease infinite;
        }

        @keyframes gradient-shift {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 0%; }
          100% { background-position: 0% 0%; }
        }

        .page-container {
          padding: 1.5rem;
          background: #f8f9fa;
          min-height: 100vh;
        }

        .data-card {
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-icon {
          font-size: 4rem;
          color: #d1d5db;
          margin-bottom: 1.5rem;
        }

        .empty-icon .pi-spinner {
          font-size: 4rem;
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
        }

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
          animation: fadeInRow 0.4s ease-out;
        }

        :global(.modern-datatable .p-datatable-tbody > tr:hover) {
          background-color: #f9fafb;
        }

        :global(.modern-datatable .p-datatable-tbody > tr > td) {
          padding: 1rem;
          border: none;
          border-bottom: 1px solid #f3f4f6;
        }

        @keyframes fadeInRow {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        :global(.modern-datatable .p-datatable-tbody > tr:last-child) {
          background: linear-gradient(90deg, rgba(79, 70, 229, 0.05) 0%, transparent 100%);
          animation: fadeInRow 0.4s ease-out, highlight 1s ease-out;
        }

        @keyframes highlight {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 1rem;
          }

          .progress-text {
            padding: 0.5rem 1rem;
            font-size: 0.75rem;
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