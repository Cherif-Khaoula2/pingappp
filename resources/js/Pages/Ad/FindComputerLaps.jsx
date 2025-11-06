import React, { useState, useRef } from "react";
import axios from "axios";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Message } from "primereact/message";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import Layout from "@/Layouts/layout/layout.jsx";
import { Head } from '@inertiajs/react';
import 'primereact/resources/themes/lara-light-indigo/theme.css';  // Thème
import 'primereact/resources/primereact.min.css';                   // Core CSS
import 'primeicons/primeicons.css';                                 // Icônes
import 'primeflex/primeflex.css';  
export default function FindComputerLaps() {
  const [computer, setComputer] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPassword, setSelectedPassword] = useState(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
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

        setRows(prev => [
          { sam, laps_password: pwd, timestamp: new Date().toLocaleString('fr-FR') }, 
          ...prev.filter(r => r.sam !== sam)
        ]);
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

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const viewPassword = (rowData) => {
    setSelectedPassword(rowData);
    setShowPasswordDialog(true);
  };

  // Templates pour la table
  const computerTemplate = (rowData) => {
    return (
      <div className="flex align-items-center gap-3">
        <div
          className="inline-flex align-items-center justify-content-center border-circle"
          style={{
            width: "45px",
            height: "45px",
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
          }}
        >
          <i className="pi pi-desktop text-white" style={{ fontSize: "1.3rem" }}></i>
        </div>
        <div>
          <div className="font-semibold text-900 text-lg">{rowData.sam}</div>
          <div className="text-sm text-600 flex align-items-center gap-1">
            <i className="pi pi-clock" style={{ fontSize: "0.75rem" }}></i>
            {rowData.timestamp}
          </div>
        </div>
      </div>
    );
  };

  const passwordTemplate = (rowData, options) => {
    const isCopied = copiedIndex === options.rowIndex;
    
    return (
      <div className="flex align-items-center gap-2">
        <div className="flex-1">
          <div 
            className="font-mono text-900 p-2 border-round"
            style={{ 
              background: "var(--surface-100)", 
              fontSize: "0.95rem",
              letterSpacing: "0.5px",
              wordBreak: "break-all"
            }}
          >
            {rowData.laps_password}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            icon={isCopied ? "pi pi-check" : "pi pi-copy"}
            tooltip={isCopied ? "Copié !" : "Copier"}
            tooltipOptions={{ position: 'top' }}
            outlined
            severity={isCopied ? "success" : "secondary"}
            size="small"
            onClick={() => copyToClipboard(rowData.laps_password, options.rowIndex)}
            className="custom-action-btn"
          />
          <Button
            icon="pi pi-eye"
            tooltip="Afficher les détails"
            tooltipOptions={{ position: 'top' }}
            outlined
            severity="info"
            size="small"
            onClick={() => viewPassword(rowData)}
            className="custom-action-btn"
          />
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <Head title="Mdp Admin Local" />
      <div className="grid">
        <div className="col-12">
          <Card className="shadow-3 border-round-xl">
            <DataTable
              value={rows}
              stripedRows
              responsiveLayout="scroll"
              className="custom-datatable"
              header={
                <div className="flex flex-column gap-4">
                  <div className="flex align-items-center gap-3">
                 
                    <div>
                      <h1 className="text-900 text-3xl font-bold m-0 mb-1">
                        Mots de passe LAPS
                      </h1>
                      <p className="text-600 m-0 text-lg">
                        Recherchez et récupérez les mots de passe administrateur locaux
                      </p>
                    </div>
                  </div>

                  <div className="p-inputgroup" style={{ height: "52px" }}>
                    
                    <InputText
                      ref={inputRef}
                      placeholder="Rechercher un ordinateur (nom ou SamAccountName)..."
                      value={computer}
                      onChange={(e) => setComputer(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      style={{ height: "52px", fontSize: "1.05rem" }}
                    />
                    <Button
                      label={loading ? "Recherche..." : "Rechercher"}
                      icon={loading ? "pi pi-spin pi-spinner" : "pi pi-search"}
                      onClick={handleSearch}
                      disabled={loading}
                      style={{ 
                        background: "linear-gradient(135deg, #6366f1, #4f46e5)", 
                        border: "none",
                        height: "52px",
                        minWidth: "150px",
                        fontWeight: "600"
                      }}
                    />
                  </div>

                  {error && (
                    <Message 
                      severity="error" 
                      text={error}
                      style={{ width: "100%" }}
                      className="custom-error-message"
                    />
                  )}
                </div>
              }
              emptyMessage={
                <div className="text-center py-8">
                  <div className="mb-4">
                    <i className="pi pi-desktop text-400" style={{ fontSize: "4rem" }}></i>
                  </div>
                  <h3 className="text-900 text-2xl font-semibold mb-2">Aucune recherche effectuée</h3>
                  <p className="text-600 text-lg">Utilisez la barre de recherche pour trouver un ordinateur</p>
                </div>
              }
            >
              <Column field="sam" header="Ordinateur" body={computerTemplate} style={{ minWidth: "280px" }} />
              <Column field="laps_password" header="Mot de passe LAPS" body={passwordTemplate} style={{ minWidth: "400px" }} />
            </DataTable>
          </Card>
        </div>
      </div>

      {/* Dialog de détails du mot de passe */}
      <Dialog
        visible={showPasswordDialog}
        onHide={() => setShowPasswordDialog(false)}
        modal
        dismissableMask
        style={{ width: "600px" }}
        className="custom-dialog"
      >
        {selectedPassword && (
          <div className="p-5">
            {/* Header */}
            <div className="text-center mb-4">
              <div
                className="inline-flex align-items-center justify-content-center border-circle mb-3"
                style={{
                  width: "90px",
                  height: "90px",
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  boxShadow: "0 8px 25px rgba(99, 102, 241, 0.35)",
                }}
              >
                <i className="pi pi-key text-white" style={{ fontSize: "3rem" }}></i>
              </div>
              <h2 className="text-900 font-bold text-2xl mb-2">
                Mot de passe LAPS
              </h2>
              <p className="text-600 text-lg">
                Informations d'identification pour l'accès administrateur local
              </p>
            </div>

            <Divider />

            {/* Détails */}
            <div className="surface-100 border-round-lg p-4 mb-4">
              <div className="flex align-items-start gap-3 mb-3 pb-3 border-bottom-1 surface-border">
                <i className="pi pi-desktop text-primary text-xl mt-1"></i>
                <div className="flex-1">
                  <div className="text-500 text-sm mb-1 font-medium">Nom de l'ordinateur</div>
                  <div className="text-900 font-semibold text-lg">{selectedPassword.sam}</div>
                </div>
              </div>

              <div className="flex align-items-start gap-3 mb-3 pb-3 border-bottom-1 surface-border">
                <i className="pi pi-clock text-primary text-xl mt-1"></i>
                <div className="flex-1">
                  <div className="text-500 text-sm mb-1 font-medium">Date de récupération</div>
                  <div className="text-900 font-semibold text-lg">{selectedPassword.timestamp}</div>
                </div>
              </div>

              <div className="flex align-items-start gap-3">
                <i className="pi pi-key text-primary text-xl mt-1"></i>
                <div className="flex-1">
                  <div className="text-500 text-sm mb-2 font-medium">Mot de passe</div>
                  <div 
                    className="font-mono text-900 p-3 border-round"
                    style={{ 
                      background: "var(--surface-0)", 
                      fontSize: "1.1rem",
                      letterSpacing: "1px",
                      wordBreak: "break-all",
                      border: "2px solid var(--primary-200)"
                    }}
                  >
                    {selectedPassword.laps_password}
                  </div>
                </div>
              </div>
            </div>

            {/* Message informatif */}
            <div className="bg-blue-50 p-3 border-round-lg mb-4">
              <div className="flex align-items-start gap-2">
                <i className="pi pi-info-circle mt-1 text-blue-600"></i>
                <small className="font-medium text-blue-900">
                  Ce mot de passe permet de se connecter avec les privilèges administrateur local sur cet ordinateur. 
                  Gardez-le confidentiel et ne le partagez qu'avec des personnes autorisées.
                </small>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3">
              <Button
                label="Copier"
                icon="pi pi-copy"
                onClick={() => {
                  copyToClipboard(selectedPassword.laps_password, -1);
                  setTimeout(() => setShowPasswordDialog(false), 1000);
                }}
                severity="secondary"
                outlined
                className="flex-1"
                style={{ height: "50px" }}
              />
              <Button
                label="Fermer"
                onClick={() => setShowPasswordDialog(false)}
                className="flex-1"
                style={{ 
                  height: "50px",
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  border: "none"
                }}
              />
            </div>
          </div>
        )}
      </Dialog>

      <style jsx>{`
        .custom-datatable :global(.p-datatable-header) {
          background: var(--surface-50);
          border-radius: 12px 12px 0 0;
          padding: 1.5rem;
        }

        .custom-datatable :global(.p-datatable-thead > tr > th) {
          background: var(--primary-50);
          color: var(--primary-700);
          font-weight: 600;
          font-size: 1rem;
        }

        .custom-datatable :global(.p-datatable-tbody > tr) {
          transition: all 0.2s ease;
        }

        .custom-datatable :global(.p-datatable-tbody > tr:hover) {
          background: var(--surface-100);
          transform: scale(1.005);
        }

        :global(.custom-dialog .p-dialog-content) {
          padding: 0 !important;
          border-radius: 12px;
        }

        :global(.custom-dialog .p-dialog-header) {
          display: none;
        }

        :global(.custom-action-btn) {
          transition: all 0.2s ease;
        }

        :global(.custom-action-btn:hover) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3) !important;
        }

        :global(.custom-error-message) {
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Layout>
  );
}