import React, { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import Layout from "@/Layouts/layout/layout.jsx";

export default function UsersList() {
  const { users, meta, error } = usePage().props;
  const [search, setSearch] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    sam: null,
    action: null,
    userName: null,
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

  const handleSearch = () => {
    router.get("/ad/users", { search }, {
      preserveState: true,
      preserveScroll: true
    });
  };

  const handleClearSearch = () => {
    setSearch('');
    router.get('/ad/users', {}, {
      preserveState: true,
      preserveScroll: true
    });
  };

  const handleToggleClick = (user, action) => {
    setConfirmDialog({ 
      visible: true, 
      sam: user.sam, 
      action,
      userName: user.name 
    });
  };

  const confirmToggle = async () => {
<<<<<<< HEAD
    try {
      await router.post("/ad/users/toggle", {
        sam: confirmDialog.sam,
        action: confirmDialog.action,
      });
      router.get("/ad/users", { search });
    } catch (err) {
      alert("Erreur lors du changement de statut");
    } finally {
      setConfirmDialog({ visible: false, sam: null, action: null, userName: null });
=======
  try {
    const response = await router.post("/ad/users/toggle", {
      sam: confirmPopup.sam,
      action: confirmPopup.action,
    }, {
      preserveScroll: true, // option Inertia pour ne pas recharger
    });

    if (response.props?.errors) {
      alert("Erreur : " + JSON.stringify(response.props.errors));
      return;
>>>>>>> 7a75027986c0a72bb8f11a072fd78fff06f1c68a
    }

    // Mise à jour locale immédiate
    setUsers(prev =>
      prev.map(u =>
        u.sam === confirmPopup.sam
          ? { ...u, enabled: confirmPopup.action === "unblock" }
          : u
      )
    );

  } catch (err) {
    // Afficher l'erreur renvoyée par Laravel
    if (err.response?.data?.message) {
      alert("Erreur AD : " + err.response.data.message);
    } else {
      alert("Erreur lors du changement de statut");
    }
  } finally {
    setConfirmPopup({ visible: false, sam: null, action: null });
  }
};

  // Templates pour les colonnes
  const nameTemplate = (rowData) => {
    const initial = rowData.name ? rowData.name.charAt(0).toUpperCase() : 'U';
    
    return (
      <div className="flex align-items-center gap-3">
        <div 
          className="inline-flex align-items-center justify-content-center border-circle text-white font-bold"
          style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)'
          }}
        >
          {initial}
        </div>
        <div>
          <div className="font-medium text-900">{rowData.name}</div>
          <div className="text-sm text-600">{rowData.sam}</div>
        </div>
      </div>
    );
  };

  const emailTemplate = (rowData) => {
    return (
      <div className="flex align-items-center gap-2">
        <i className="pi pi-envelope text-600"></i>
        <span className="text-900">{rowData.email || '—'}</span>
      </div>
    );
  };

  const dateTemplate = (rowData, field) => {
    const dateValue = field === 'lastLogon' ? rowData.lastLogon : rowData.passwordLastSet;
    return (
      <div className="flex align-items-center gap-2">
        <i className={`pi ${field === 'lastLogon' ? 'pi-sign-in' : 'pi-key'} text-600`}></i>
        <span className="text-700">{formatAdDate(dateValue)}</span>
      </div>
    );
  };

  const statusTemplate = (rowData) => {
    return (
      <div className="flex align-items-center gap-3">
        {rowData.enabled ? (
          <>
            <Tag 
              severity="success" 
              value="Actif" 
              icon="pi pi-check-circle"
              className="font-medium"
            />
            <Button
              icon="pi pi-lock"
              label="Bloquer"
              severity="danger"
              text
              size="small"
              onClick={() => handleToggleClick(rowData, "block")}
            />
          </>
        ) : (
          <>
            <Tag 
              severity="danger" 
              value="Bloqué" 
              icon="pi pi-ban"
              className="font-medium"
            />
            <Button
              icon="pi pi-unlock"
              label="Débloquer"
              severity="success"
              text
              size="small"
              onClick={() => handleToggleClick(rowData, "unblock")}
            />
          </>
        )}
      </div>
    );
  };

  // Header du tableau
  const tableHeader = (
    <div className="flex flex-column gap-3">
      <div className="flex align-items-center justify-content-between flex-wrap gap-3">
        <div className="flex align-items-center gap-3">
          <div 
            className="inline-flex align-items-center justify-content-center bg-blue-100 border-circle" 
            style={{ width: '48px', height: '48px' }}
          >
            <i className="pi pi-shield text-3xl text-blue-600"></i>
          </div>
          <div>
            <h1 className="text-900 text-3xl font-bold m-0">
              Utilisateurs Active Directory
            </h1>
            <p className="text-600 mt-1 m-0">
              {meta?.total || 0} utilisateur{(meta?.total || 0) > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="p-inputgroup">
        <span className="p-inputgroup-addon">
          <i className="pi pi-search"></i>
        </span>
        <InputText
          placeholder="Rechercher par nom, SAM ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          style={{ height: '48px' }}
        />
        <Button
          label="Rechercher"
          icon="pi pi-search"
          onClick={handleSearch}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            border: 'none',
            minWidth: '140px'
          }}
        />
        {search && (
          <Button
            icon="pi pi-times"
            outlined
            onClick={handleClearSearch}
            style={{
              borderColor: '#6b7280',
              color: '#374151'
            }}
          />
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border-round flex align-items-center gap-2">
          <i className="pi pi-exclamation-triangle text-red-600"></i>
          <span className="text-red-700">{error}</span>
        </div>
      )}
    </div>
  );

  const currentPage = meta?.page || 1;
  const perPage = meta?.per_page || 10;
  const total = meta?.total || 0;

  return (
    <Layout>
      <div className="grid">
        <div className="col-12">
          <Card className="shadow-2">
            <DataTable
              value={users || []}
              header={tableHeader}
              lazy
              paginator
              first={(currentPage - 1) * perPage}
              rows={perPage}
              totalRecords={total}
              onPage={(e) => {
                const page = (e.first / e.rows) + 1;
                router.get('/ad/users', { 
                  search,
                  page 
                }, {
                  preserveState: true,
                  preserveScroll: true
                });
              }}
              rowsPerPageOptions={[10, 25, 50, 100]}
              emptyMessage={
                <div className="text-center py-6">
                  <i className="pi pi-users text-400 mb-3" style={{ fontSize: '3rem' }}></i>
                  <h3 className="text-900 text-xl font-medium mb-2">
                    Aucun utilisateur trouvé
                  </h3>
                  <p className="text-600">
                    {search 
                      ? 'Essayez de modifier votre recherche'
                      : 'Aucun utilisateur disponible'}
                  </p>
                </div>
              }
              stripedRows
              responsiveLayout="scroll"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} utilisateurs"
            >
              <Column
                field="name"
                header="Utilisateur"
                body={nameTemplate}
                sortable
                style={{ minWidth: '250px' }}
              />
              <Column
                field="email"
                header="Email"
                body={emailTemplate}
                sortable
                style={{ minWidth: '200px' }}
              />
              <Column
                field="lastLogon"
                header="Dernière connexion"
                body={(rowData) => dateTemplate(rowData, 'lastLogon')}
                sortable
                style={{ minWidth: '180px' }}
              />
              <Column
                field="passwordLastSet"
                header="Mot de passe modifié"
                body={(rowData) => dateTemplate(rowData, 'passwordLastSet')}
                sortable
                style={{ minWidth: '180px' }}
              />
              <Column
                field="enabled"
                header="Statut"
                body={statusTemplate}
                style={{ minWidth: '220px' }}
              />
            </DataTable>
          </Card>
        </div>
      </div>

      {/* Dialog de confirmation moderne */}
      <Dialog
        visible={confirmDialog.visible}
        onHide={() => setConfirmDialog({ visible: false, sam: null, action: null, userName: null })}
        header={
          <div className="flex align-items-center gap-3">
            <div 
              className="inline-flex align-items-center justify-content-center border-circle"
              style={{
                width: '48px',
                height: '48px',
                background: confirmDialog.action === 'block' ? '#fef2f2' : '#f0fdf4'
              }}
            >
              <i 
                className={`pi ${confirmDialog.action === 'block' ? 'pi-lock' : 'pi-unlock'} text-2xl`}
                style={{ color: confirmDialog.action === 'block' ? '#dc2626' : '#16a34a' }}
              ></i>
            </div>
            <span className="text-xl font-bold">
              {confirmDialog.action === 'block' ? 'Bloquer' : 'Débloquer'} l'utilisateur
            </span>
          </div>
        }
        style={{ width: '450px' }}
        draggable={false}
        modal
      >
        <div className="py-3">
          <p className="text-700 text-lg mb-3">
            Êtes-vous sûr de vouloir{' '}
            <strong className={confirmDialog.action === 'block' ? 'text-red-600' : 'text-green-600'}>
              {confirmDialog.action === 'block' ? 'bloquer' : 'débloquer'}
            </strong>
            {' '}cet utilisateur ?
          </p>
          
          <div className="p-3 bg-gray-50 border-round">
            <div className="flex align-items-center gap-2 mb-2">
              <i className="pi pi-user text-600"></i>
              <span className="font-semibold text-900">{confirmDialog.userName}</span>
            </div>
            <div className="flex align-items-center gap-2">
              <i className="pi pi-id-card text-600"></i>
              <span className="text-600 text-sm">{confirmDialog.sam}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-content-end gap-2 mt-4">
          <Button
            label="Annuler"
            icon="pi pi-times"
            outlined
            onClick={() => setConfirmDialog({ visible: false, sam: null, action: null, userName: null })}
            style={{
              borderColor: '#6b7280',
              color: '#374151'
            }}
          />
          <Button
            label="Confirmer"
            icon="pi pi-check"
            onClick={confirmToggle}
            severity={confirmDialog.action === 'block' ? 'danger' : 'success'}
            style={{
              background: confirmDialog.action === 'block' 
                ? 'linear-gradient(135deg, #dc2626, #b91c1c)' 
                : 'linear-gradient(135deg, #16a34a, #15803d)',
              border: 'none'
            }}
          />
        </div>
      </Dialog>

      <style>{`
        /* Card styling */
        :global(.p-card) {
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        :global(.p-card .p-card-body) {
          padding: 0;
        }

        :global(.p-card .p-card-content) {
          padding: 0;
        }

        /* DataTable styling */
        :global(.p-datatable .p-datatable-header) {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 1.5rem;
        }

        :global(.p-datatable .p-datatable-thead > tr > th) {
          background: #f9fafb;
          color: #374151;
          font-weight: 600;
          padding: 1rem;
          border-bottom: 2px solid #e5e7eb;
        }

        :global(.p-datatable .p-datatable-tbody > tr) {
          transition: all 0.2s ease;
        }

        :global(.p-datatable .p-datatable-tbody > tr:hover) {
          background: #f9fafb;
        }

        :global(.p-datatable .p-datatable-tbody > tr > td) {
          padding: 1rem;
        }

        /* Input styling */
        :global(.p-inputtext) {
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
        }

        :global(.p-inputtext:focus) {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        :global(.p-inputgroup-addon) {
          background: #f9fafb;
          border-radius: 8px 0 0 8px;
          border: 1px solid #e5e7eb;
          border-right: none;
        }

        /* Button styling */
        :global(.p-button) {
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        :global(.p-button:not(.p-button-outlined):not(.p-button-text):not(:disabled):hover) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        :global(.p-button-outlined) {
          border-width: 2px;
        }

        :global(.p-button-text) {
          font-weight: 600;
        }

        /* Tag styling */
        :global(.p-tag) {
          border-radius: 6px;
          padding: 0.35rem 0.7rem;
          font-size: 0.875rem;
        }

        /* Dialog styling */
        :global(.p-dialog) {
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        :global(.p-dialog .p-dialog-header) {
          border-radius: 12px 12px 0 0;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        :global(.p-dialog .p-dialog-content) {
          padding: 1.5rem;
        }

        /* Shadow */
        :global(.shadow-2) {
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
        }

        /* Paginator */
        :global(.p-paginator) {
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
          padding: 1rem 1.5rem;
        }

        :global(.p-paginator .p-paginator-pages .p-paginator-page) {
          border-radius: 6px;
          min-width: 2.5rem;
          height: 2.5rem;
        }

        :global(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          border-color: #6366f1;
        }

        /* Responsive */
        @media (max-width: 768px) {
          :global(.p-datatable .p-datatable-header) {
            padding: 1rem;
          }

          :global(.p-dialog) {
            width: 90vw !important;
          }
        }
      `}</style>
    </Layout>
  );
}