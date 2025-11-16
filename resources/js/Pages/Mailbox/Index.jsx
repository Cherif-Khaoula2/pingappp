import React, { useState, useEffect, useRef } from 'react';
import { router, Head } from '@inertiajs/react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import Layout from '@/Layouts/layout/layout.jsx';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

export default function MailboxIndex({ mailboxes = [] }) {
  const toast = useRef(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [currentMailbox, setCurrentMailbox] = useState({ name: '', active: false, id: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMailboxes, setFilteredMailboxes] = useState(mailboxes);

  // Mettre à jour les mailboxes filtrées quand les mailboxes changent
  useEffect(() => {
    handleSearch(searchQuery);
  }, [mailboxes]);

  // Filtrer les mailboxes en fonction de la recherche
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredMailboxes(mailboxes);
    } else {
      const filtered = mailboxes.filter(mailbox =>
        mailbox.name.toLowerCase().includes(query.toLowerCase()) ||
        mailbox.id.toString().includes(query)
      );
      setFilteredMailboxes(filtered);
    }
  };

  const openDialog = (mailbox = null) => {
    if (mailbox) {
      setCurrentMailbox({ ...mailbox });
    } else {
      setCurrentMailbox({ name: '', active: true, id: null });
    }
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setCurrentMailbox({ name: '', active: false, id: null });
  };

  const openConfirmDialog = (action, mailbox) => {
    setConfirmAction({ type: action, data: mailbox });
    setShowConfirmDialog(true);
  };

  const closeConfirmDialog = () => {
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const handleConfirmedAction = () => {
    if (!confirmAction) return;

    const successMessages = {
      save: currentMailbox.id ? 'Mailbox modifiée avec succès' : 'Mailbox créée avec succès',
      delete: 'Mailbox supprimée avec succès',
      activate: 'Mailbox activée avec succès',
      deactivate: 'Mailbox désactivée avec succès'
    };

    switch (confirmAction.type) {
      case 'delete':
        router.delete(`/mailboxes/${confirmAction.data.id}`, { 
          preserveScroll: true,
          onSuccess: () => {
            toast.current.show({
              severity: 'success',
              summary: 'Succès',
              detail: successMessages.delete,
              life: 3000
            });
          },
          onError: () => {
            toast.current.show({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Une erreur est survenue lors de la suppression',
              life: 3000
            });
          }
        });
        break;
      case 'activate':
        router.put(`/mailboxes/${confirmAction.data.id}`, { active: true }, { 
          preserveScroll: true,
          onSuccess: () => {
            toast.current.show({
              severity: 'success',
              summary: 'Succès',
              detail: successMessages.activate,
              life: 3000
            });
          },
          onError: () => {
            toast.current.show({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Une erreur est survenue lors de l\'activation',
              life: 3000
            });
          }
        });
        break;
      case 'deactivate':
        router.put(`/mailboxes/${confirmAction.data.id}`, { active: false }, { 
          preserveScroll: true,
          onSuccess: () => {
            toast.current.show({
              severity: 'success',
              summary: 'Succès',
              detail: successMessages.deactivate,
              life: 3000
            });
          },
          onError: () => {
            toast.current.show({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Une erreur est survenue lors de la désactivation',
              life: 3000
            });
          }
        });
        break;
      case 'save':
        if (currentMailbox.id) {
          router.put(`/mailboxes/${currentMailbox.id}`, currentMailbox, { 
            preserveScroll: true,
            onSuccess: () => {
              toast.current.show({
                severity: 'success',
                summary: 'Succès',
                detail: successMessages.save,
                life: 3000
              });
              closeDialog();
            },
            onError: () => {
              toast.current.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Une erreur est survenue lors de la modification',
                life: 3000
              });
            }
          });
        } else {
          router.post('/mailboxes', currentMailbox, { 
            preserveScroll: true,
            onSuccess: () => {
              toast.current.show({
                severity: 'success',
                summary: 'Succès',
                detail: successMessages.save,
                life: 3000
              });
              closeDialog();
            },
            onError: () => {
              toast.current.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Une erreur est survenue lors de la création',
                life: 3000
              });
            }
          });
        }
        break;
    }
    closeConfirmDialog();
  };

  const handleSave = () => {
    openConfirmDialog('save', currentMailbox);
  };

  const nameTemplate = (rowData) => {
    const initial = rowData.name ? rowData.name.charAt(0).toUpperCase() : 'M';
    
    return (
      <div className="flex align-items-center gap-3">
        <div
          className="inline-flex align-items-center justify-content-center border-circle text-white font-bold"
          style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          }}
        >
          {initial}
        </div>
        <div>
          <div className="font-medium text-900">{rowData.name}</div>
        </div>
      </div>
    );
  };

  const statusTemplate = (rowData) => {
    return rowData.active ? (
      <Tag 
        severity="success" 
        value="Active" 
        icon="pi pi-check-circle"
        className="font-medium"
      />
    ) : (
      <Tag 
        severity="danger" 
        value="Inactive" 
        icon="pi pi-times-circle"
        className="font-medium"
      />
    );
  };

  const actionsTemplate = (rowData) => {
    return (
      <div className="flex gap-2 justify-content-center">
        <Button
          icon="pi pi-pencil"
          rounded
          outlined
          severity="info"
          onClick={(e) => {
            e.stopPropagation();
            openDialog(rowData);
          }}
          tooltip="Modifier"
          tooltipOptions={{ position: 'top' }}
        />
        
        {rowData.active ? (
          <Button
            icon="pi pi-ban"
            rounded
            outlined
            severity="warning"
            onClick={(e) => {
              e.stopPropagation();
              openConfirmDialog('deactivate', rowData);
            }}
            tooltip="Désactiver"
            tooltipOptions={{ position: 'top' }}
          />
        ) : (
          <Button
            icon="pi pi-check"
            rounded
            outlined
            severity="success"
            onClick={(e) => {
              e.stopPropagation();
              openConfirmDialog('activate', rowData);
            }}
            tooltip="Activer"
            tooltipOptions={{ position: 'top' }}
          />
        )}
        
        <Button
          icon="pi pi-trash"
          rounded
          outlined
          severity="danger"
          onClick={(e) => {
            e.stopPropagation();
            openConfirmDialog('delete', rowData);
          }}
          tooltip="Supprimer"
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  };

  const tableHeader = (
    <div className="flex flex-column gap-3">
      <div className="flex align-items-center justify-content-between flex-wrap gap-3">
        <div className="flex align-items-center gap-3">
          <div className="flex-1">
            <h1 className="text-900 text-2xl md:text-3xl font-bold m-0 mb-1">
              Gestion des Mailboxes
            </h1>
            <p className="text-600 text-sm md:text-base m-0">
              {filteredMailboxes.length} mailbox{filteredMailboxes.length > 1 ? 'es' : ''} {searchQuery ? 'trouvée(s)' : 'au total'}
            </p>
          </div>
        </div>

        <Button
          label="Nouvelle Mailbox"
          icon="pi pi-plus"
          onClick={() => openDialog()}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            border: 'none',
          }}
          className="w-full md:w-auto"
        />
      </div>

      {/* Barre de recherche */}
      <div className="p-inputgroup" style={{ height: '52px' }}>
        <span className="p-inputgroup-addon">
          <i className="pi pi-search"></i>
        </span>
        <InputText
          placeholder="Rechercher une mailbox par nom..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ height: '52px' }}
        />
        {searchQuery && (
          <Button
            icon="pi pi-times"
            outlined
            onClick={() => handleSearch('')}
            style={{
              borderColor: '#6b7280',
              color: '#374151',
              height: '52px'
            }}
          />
        )}
      </div>
    </div>
  );

  const getConfirmDialogContent = () => {
    if (!confirmAction) return null;

    const titles = {
      save: currentMailbox.id ? 'Modifier la mailbox' : 'Créer une mailbox',
      delete: 'Supprimer la mailbox',
      activate: 'Activer la mailbox',
      deactivate: 'Désactiver la mailbox'
    };

    const messages = {
      save: currentMailbox.id 
        ? 'Confirmez-vous la modification de cette mailbox ?'
        : 'Confirmez-vous la création de cette mailbox ?',
      delete: `Êtes-vous sûr de vouloir supprimer cette mailbox ? Cette action est irréversible.`,
      activate: 'Confirmez-vous l\'activation de cette mailbox ?',
      deactivate: 'Confirmez-vous la désactivation de cette mailbox ?'
    };

    const mailboxName = confirmAction.type === 'save' ? currentMailbox.name : confirmAction.data.name;
    const isActive = confirmAction.type === 'activate' || (confirmAction.type === 'save' && currentMailbox.active);
    const actionColor = confirmAction.type === 'delete' ? 'danger' : 
                       confirmAction.type === 'deactivate' ? 'warning' : 'success';

    return (
      <div className="p-4">
        <div className="text-center mb-4">
          <div
            className="inline-flex align-items-center justify-content-center border-circle mb-3"
            style={{
              width: "70px",
              height: "70px",
              background: confirmAction.type === 'delete' 
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : confirmAction.type === 'deactivate'
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: confirmAction.type === 'delete'
                ? '0 8px 20px rgba(239, 68, 68, 0.3)'
                : confirmAction.type === 'deactivate'
                ? '0 8px 20px rgba(245, 158, 11, 0.3)'
                : '0 8px 20px rgba(16, 185, 129, 0.3)',
            }}
          >
            <i 
              className={`pi ${
                confirmAction.type === 'delete' ? 'pi-trash' :
                confirmAction.type === 'activate' ? 'pi-check' :
                confirmAction.type === 'deactivate' ? 'pi-ban' :
                'pi-save'
              } text-white`}
              style={{ fontSize: "2rem" }}
            />
          </div>
          <h2 className="text-900 font-bold text-2xl mb-2">
            {titles[confirmAction.type]}
          </h2>
          <p className="text-600 text-lg">
            {messages[confirmAction.type]}
          </p>
        </div>

        <div className={`p-3 border-round-lg mb-4 border-1 ${
          confirmAction.type === 'delete' ? 'bg-red-50 border-red-200' :
          confirmAction.type === 'deactivate' ? 'bg-orange-50 border-orange-200' :
          'bg-green-50 border-green-200'
        }`}>
          <div className="flex align-items-center gap-2 mb-2">
            <i className={`pi pi-database ${
              confirmAction.type === 'delete' ? 'text-red-600' :
              confirmAction.type === 'deactivate' ? 'text-orange-600' :
              'text-green-600'
            }`}></i>
            <span className="font-semibold text-900 text-lg">{mailboxName}</span>
          </div>
          <div className="flex align-items-center gap-2">
            <i className={`pi pi-info-circle ${
              confirmAction.type === 'delete' ? 'text-red-600' :
              confirmAction.type === 'deactivate' ? 'text-orange-600' :
              'text-green-600'
            }`}></i>
            <span className="text-600">
              Statut : {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {confirmAction.type !== 'save' && (
          <div className={`p-3 border-round-lg mb-4 ${
            confirmAction.type === 'delete' ? 'bg-orange-50' :
            confirmAction.type === 'deactivate' ? 'bg-blue-50' :
            'bg-blue-50'
          }`}>
            <div className="flex align-items-start gap-2">
              <i className={`pi ${
                confirmAction.type === 'delete' ? 'pi-exclamation-triangle text-orange-600' :
                'pi-info-circle text-blue-600'
              } mt-1`}></i>
              <div>
                <div className={`font-semibold mb-1 ${
                  confirmAction.type === 'delete' ? 'text-orange-900' : 'text-blue-900'
                }`}>
                  {confirmAction.type === 'delete' ? 'Attention !' : 'Information'}
                </div>
                <small className={confirmAction.type === 'delete' ? 'text-orange-700' : 'text-blue-700'}>
                  {confirmAction.type === 'delete'
                    ? 'Cette mailbox sera définitivement supprimée et ne pourra pas être récupérée.'
                    : confirmAction.type === 'deactivate'
                    ? 'Cette mailbox ne sera plus disponible pour les nouveaux utilisateurs.'
                    : 'Cette mailbox sera disponible pour les nouveaux utilisateurs.'}
                </small>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <Button
            label="Annuler"
            outlined
            severity="secondary"
            onClick={closeConfirmDialog}
            className="flex-1"
            style={{ height: "50px" }}
          />
          <Button
            label="Confirmer"
            onClick={handleConfirmedAction}
            severity={actionColor}
            className="flex-1"
            style={{ height: "50px" }}
          />
        </div>
      </div>
    );
  };

  const editDialogFooter = (
    <div className="flex justify-content-end gap-2 mt-3 px-4 pb-4">
      <Button
        label="Annuler"
        outlined
        onClick={closeDialog}
        className="p-button-sm md:p-button-md"
      />
      <Button
        label="Enregistrer"
        onClick={handleSave}
        disabled={!currentMailbox.name.trim()}
        style={{
          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          border: 'none',
        }}
        className="p-button-sm md:p-button-md"
      />
    </div>
  );

  return (
    <Layout>
      <Head title="Gestion des Mailboxes" />
      
      <Toast ref={toast} position="top-right" />
      
      <div className="grid">
        <div className="col-12">
          <Card className="shadow-3 border-round-xl">
            <DataTable
              value={filteredMailboxes}
              header={tableHeader}
              emptyMessage={
                <div className="text-center py-6">
                  <i className="pi pi-database text-400 mb-3" style={{ fontSize: '3rem' }}></i>
                  <h3 className="text-900 text-xl font-medium mb-2">
                    {searchQuery ? 'Aucune mailbox trouvée' : 'Aucune mailbox'}
                  </h3>
                  <p className="text-600 mb-4">
                    {searchQuery 
                      ? 'Essayez de modifier votre recherche'
                      : 'Commencez par créer votre première mailbox'}
                  </p>
                  {!searchQuery && (
                    <Button
                      label="Créer une mailbox"
                      icon="pi pi-plus"
                      onClick={() => openDialog()}
                      style={{
                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                        border: 'none'
                      }}
                    />
                  )}
                </div>
              }
              stripedRows
              responsiveLayout="scroll"
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} mailboxes"
            >
              <Column
                field="name"
                header="Mailbox"
                body={nameTemplate}
                sortable
                style={{ minWidth: '250px' }}
              />

              <Column
                field="active"
                header="Statut"
                body={statusTemplate}
                sortable
                style={{ minWidth: '150px', textAlign: 'center' }}
              />

              <Column
                header="Actions"
                body={actionsTemplate}
                style={{ minWidth: '200px', textAlign: 'center' }}
              />
            </DataTable>
          </Card>
        </div>
      </div>

      {/* Dialog d'édition/création */}
      <Dialog
        visible={showDialog}
        onHide={closeDialog}
        header={
          <div className="flex align-items-center gap-2">
            <i className={`pi ${currentMailbox.id ? 'pi-pencil' : 'pi-plus'} text-primary text-xl`}></i>
            <span className="text-base md:text-lg font-semibold">
              {currentMailbox.id ? 'Modifier la mailbox' : 'Nouvelle mailbox'}
            </span>
          </div>
        }
        footer={editDialogFooter}
        style={{ width: '95vw', maxWidth: '500px' }}
        modal
        breakpoints={{ '960px': '90vw', '640px': '95vw' }}
        dismissableMask
      >
        <div className="py-2 px-4 pt-4">
          <div className="field mb-4">
            <label htmlFor="mailboxName" className="block text-900 font-semibold mb-2 text-sm md:text-base">
              Nom de la mailbox <span className="text-red-500">*</span>
            </label>
            <InputText
              id="mailboxName"
              value={currentMailbox.name}
              onChange={(e) => setCurrentMailbox({ ...currentMailbox, name: e.target.value })}
              className="w-full text-sm md:text-base"
              placeholder="Ex: Mailbox Principal"
              required
            />
          </div>

          <div className="field">
            <div className="flex align-items-center gap-2">
              <Checkbox
                inputId="mailboxActive"
                checked={currentMailbox.active}
                onChange={(e) => setCurrentMailbox({ ...currentMailbox, active: e.checked })}
              />
              <label htmlFor="mailboxActive" className="text-900 font-medium text-sm md:text-base cursor-pointer">
                Mailbox active
              </label>
            </div>
            <small className="text-600 block mt-1">
              Les mailboxes inactives ne seront pas disponibles pour les nouveaux utilisateurs
            </small>
          </div>
        </div>
      </Dialog>

      {/* Dialog de confirmation */}
      <Dialog
        visible={showConfirmDialog}
        onHide={closeConfirmDialog}
        header={null}
        footer={null}
        style={{ width: '95vw', maxWidth: '500px' }}
        modal
        breakpoints={{ '960px': '90vw', '640px': '95vw' }}
        dismissableMask
        className="custom-dialog"
      >
        {getConfirmDialogContent()}
      </Dialog>

      <style>{`
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

        :global(.p-button) {
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        :global(.p-button:not(.p-button-outlined):not(:disabled):hover) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        :global(.p-button-outlined) {
          border-width: 2px;
        }

        :global(.p-button-rounded) {
          width: 2.5rem;
          height: 2.5rem;
        }

        :global(.p-tag) {
          border-radius: 6px;
          padding: 0.35rem 0.7rem;
          font-size: 0.875rem;
        }

        :global(.shadow-3) {
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
        }

        :global(.p-paginator) {
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
          padding: 1rem 1.5rem;
        }

        :global(.p-checkbox .p-checkbox-box) {
          border-radius: 4px;
          border: 2px solid #d1d5db;
          width: 1.25rem;
          height: 1.25rem;
        }

        :global(.p-checkbox .p-checkbox-box.p-highlight) {
          background: #6366f1;
          border-color: #6366f1;
        }

        :global(.border-round-xl) {
          border-radius: 12px;
        }

        :global(.custom-dialog .p-dialog-content) {
          padding: 0 !important;
          border-radius: 12px;
        }

        :global(.custom-dialog .p-dialog-header) {
          display: none;
        }

        :global(.p-toast) {
          opacity: 0.95;
        }

        :global(.p-toast .p-toast-message) {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        :global(.p-toast .p-toast-message-success) {
          background: #10b981;
          border: none;
          color: white;
        }

        :global(.p-toast .p-toast-message-error) {
          background: #ef4444;
          border: none;
          color: white;
        }

        :global(.p-toast .p-toast-message-success .p-toast-message-icon),
        :global(.p-toast .p-toast-message-success .p-toast-icon-close),
        :global(.p-toast .p-toast-message-error .p-toast-message-icon),
        :global(.p-toast .p-toast-message-error .p-toast-icon-close) {
          color: white;
        }

        @media (max-width: 768px) {
          :global(.p-datatable .p-datatable-header) {
            padding: 1rem;
          }

          :global(.p-button-rounded) {
            width: 2rem;
            height: 2rem;
          }
        }
      `}</style>
    </Layout>
  );
}