import React, { useState } from 'react';
import { useForm, usePage, Link, useForm as useInertiaForm } from '@inertiajs/react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Message } from 'primereact/message';
import Layout from "@/Layouts/layout/layout.jsx";
import 'primereact/resources/themes/lara-light-indigo/theme.css';  // Thème
import 'primereact/resources/primereact.min.css';                   // Core CSS
import 'primeicons/primeicons.css';                                 // Icônes
import 'primeflex/primeflex.css';                                   // PrimeFlex pour le grid
const Edit = () => {
  const { role, permissions } = usePage().props;
  const pageProps = usePage().props;
  const { userspermissions = [] } = pageProps;
  const canupdate = userspermissions.includes("updaterole");
  const candelete = userspermissions.includes("deleterole");
  
  const { data, setData, post, processing, errors } = useForm({
    name: role.name || '',
    permissions: role.permissions?.map(p => p.name) || [],
    _method: 'put'
  });
  
  const deleteForm = useInertiaForm({});

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function togglePermission(name) {
    const current = data.permissions || [];
    setData(
      'permissions',
      current.includes(name)
        ? current.filter(n => n !== name)
        : [...current, name]
    );
  }

  // Ouvrir le dialog de confirmation de modification
  function handleSubmit(e) {
    e.preventDefault();
    setShowEditDialog(true);
  }

  // Confirmer la modification
  function confirmEdit() {
    post(route('roles.update', role.id), {
      onSuccess: () => {
        setShowEditDialog(false);
      },
      onError: () => {
        setShowEditDialog(false);
      }
    });
  }

  // Confirmer la suppression
  function confirmDelete() {
    setIsDeleting(true);
    deleteForm.delete(route('roles.destroy', role.id), {
      onFinish: () => {
        setIsDeleting(false);
        setShowDeleteDialog(false);
      }
    });
  }

  // Footer du dialog de modification
  const editDialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Annuler"
        outlined
        severity="secondary"
        onClick={() => setShowEditDialog(false)}
        disabled={processing}
      />
      <Button
        label={processing ? "Modification..." : "Confirmer"}
        severity="info"
        onClick={confirmEdit}
        loading={processing}
      />
    </div>
  );

  // Footer du dialog de suppression
  const deleteDialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Annuler"
        outlined
        severity="secondary"
        onClick={() => setShowDeleteDialog(false)}
        disabled={isDeleting}
      />
      <Button
        label={isDeleting ? "Suppression..." : "Supprimer"}
        icon={isDeleting ? "pi pi-spin pi-spinner" : "pi pi-trash"}
        severity="danger"
        onClick={confirmDelete}
        loading={isDeleting}
      />
    </div>
  );

  // Header de la page
  const pageHeader = (
    <div className="flex align-items-center justify-content-between mb-4">
      <div>
        <h1 className="text-900 text-3xl font-bold m-0">
          Modifier le rôle
        </h1>
        <p className="text-600 mt-1 m-0">
          {data.name}
        </p>
      </div>
      {candelete && !role.deleted_at && (
        <Button
          label="Supprimer"
          icon="pi pi-trash"
          severity="danger"
          outlined
          onClick={() => setShowDeleteDialog(true)}
        />
      )}
    </div>
  );

  return (
    <Layout title="Edit Role">
      <div className="grid">
        <div className="col-12">
          {pageHeader}

          {/* Message si rôle supprimé */}
          {role.deleted_at && (
            <Message 
              severity="warn" 
              className="mb-4 w-full"
              text="Ce rôle a été supprimé."
            />
          )}
          
          <Card className="shadow-3">
            <form onSubmit={handleSubmit}>
              <div className="grid">
                {/* Section Informations du rôle */}
                <div className="col-12">
                  <div className="flex align-items-center gap-2 mb-4">
                    <i className="pi pi-shield text-primary text-2xl"></i>
                    <h2 className="text-900 text-xl font-semibold m-0">
                      Informations du rôle
                    </h2>
                  </div>
                  <Divider />
                </div>

                <div className="col-12">
                  <div className="field">
                    <label htmlFor="name" className="block text-900 font-medium mb-2">
                      Nom du rôle <span className="text-red-500">*</span>
                    </label>
                    <InputText
                      id="name"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      className={`w-full ${errors.name ? 'p-invalid' : ''}`}
                      disabled={!canupdate}
                      placeholder="Ex: Administrateur, Éditeur..."
                    />
                    {errors.name && (
                      <small className="p-error block mt-1">{errors.name}</small>
                    )}
                  </div>
                </div>

                {/* Section Permissions */}
                <div className="col-12 mt-4">
                  <div className="flex align-items-center gap-2 mb-4">
                    <i className="pi pi-lock text-primary text-2xl"></i>
                    <h2 className="text-900 text-xl font-semibold m-0">
                      Permissions
                    </h2>
                  </div>
                  <Divider />
                </div>

                <div className="col-12">
                  <div className="field">
                    <label className="block text-900 font-medium mb-3">
                      Sélectionner les permissions <span className="text-red-500">*</span>
                    </label>
                    
                    {permissions.length > 0 ? (
                      <div className="grid">
                        {permissions.map((p) => (
                          <div key={p.value} className="col-12 md:col-6 lg:col-4">
                            <div 
                              className={`surface-card p-3 border-1 border-round cursor-pointer transition-all transition-duration-200 hover:surface-hover ${
                                data.permissions.includes(p.value) 
                                  ? 'border-primary shadow-2' 
                                  : 'border-300'
                              }`}
                              onClick={() => canupdate && togglePermission(p.value)}
                            >
                              <div className="flex align-items-center gap-3">
                                <label 
                                  htmlFor={`permission-${p.value}`} 
                                  className="text-900 font-medium cursor-pointer flex-1"
                                >
                                  {p.label}
                                </label>
                                {data.permissions.includes(p.value) && (
                                  <i className="pi pi-check-circle text-primary"></i>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Message 
                        severity="info" 
                        text="Aucune permission disponible pour le moment" 
                        className="w-full"
                      />
                    )}

                    {errors.permissions && (
                      <small className="p-error block mt-2">{errors.permissions}</small>
                    )}
                    
                    <small className="text-600 block mt-2">
                      <i className="pi pi-info-circle mr-1"></i>
                      {data.permissions.length} permission{data.permissions.length > 1 ? 's' : ''} sélectionnée{data.permissions.length > 1 ? 's' : ''}
                    </small>
                  </div>
                </div>

                {/* Actions */}
                {canupdate && (
                  <div className="col-12 mt-4">
                    <Divider />
                    <div className="flex justify-content-end gap-2">
                      <Button
                        label="Annuler"
                        outlined
                        severity="secondary"
                        onClick={() => window.history.back()}
                        disabled={processing}
                      />
                      <Button
                        label="Modifier le rôle"
                        icon="pi pi-save"
                        type="submit"
                        loading={processing}
                        style={{
                          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                          border: 'none'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Dialog de confirmation de modification */}
      <Dialog
        visible={showEditDialog}
        onHide={() => setShowEditDialog(false)}
        header={
          <div className="flex align-items-center gap-2">
            <i className="pi pi-pencil text-blue-600 text-2xl"></i>
            <span>Confirmer la modification</span>
          </div>
        }
        footer={editDialogFooter}
        style={{ width: '480px' }}
        modal
        draggable={false}
      >
        <div className="text-center py-3">
          <div 
            className="inline-flex align-items-center justify-content-center bg-blue-100 border-circle mb-4" 
            style={{ width: '80px', height: '80px' }}
          >
            <i className="pi pi-pencil text-5xl text-blue-600"></i>
          </div>
          
          <h3 className="text-900 text-xl font-bold mb-2">
            Modifier le rôle
          </h3>
          
          <p className="text-600 mb-3">
            Êtes-vous sûr de vouloir modifier ce rôle ?<br />
            Les modifications seront enregistrées.
          </p>

          <div className="surface-100 border-round p-3 text-left">
            <div className="flex align-items-center gap-2 mb-2">
              <i className="pi pi-shield text-600"></i>
              <span className="text-900 font-medium">
                {data.name}
              </span>
            </div>
            <div className="flex align-items-center gap-2">
              <i className="pi pi-lock text-600"></i>
              <span className="text-700">
                {data.permissions.length} permission{data.permissions.length > 1 ? 's' : ''} sélectionnée{data.permissions.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        visible={showDeleteDialog}
        onHide={() => setShowDeleteDialog(false)}
        header={
          <div className="flex align-items-center gap-2">
            <i className="pi pi-exclamation-triangle text-red-600 text-2xl"></i>
            <span>Confirmer la suppression</span>
          </div>
        }
        footer={deleteDialogFooter}
        style={{ width: '480px' }}
        modal
        draggable={false}
      >
        <div className="text-center py-3">
          <div 
            className="inline-flex align-items-center justify-content-center bg-red-100 border-circle mb-4" 
            style={{ width: '80px', height: '80px' }}
          >
            <i className="pi pi-trash text-5xl text-red-600"></i>
          </div>
          
          <h3 className="text-900 text-xl font-bold mb-2">
            Supprimer le rôle
          </h3>
          
          <p className="text-600 mb-3">
            Êtes-vous sûr de vouloir supprimer ce rôle ?<br />
            Cette action est irréversible.
          </p>

          <div className="surface-100 border-round p-3 text-left">
            <div className="flex align-items-center gap-2 mb-2">
              <i className="pi pi-shield text-600"></i>
              <span className="text-900 font-medium">
                {data.name}
              </span>
            </div>
            <div className="flex align-items-center gap-2">
              <i className="pi pi-lock text-600"></i>
              <span className="text-700">
                {data.permissions.length} permission{data.permissions.length > 1 ? 's' : ''} associée{data.permissions.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </Dialog>

      <style jsx>{`
        /* Card styling */
        :global(.p-card) {
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        :global(.p-card .p-card-body) {
          padding: 2rem;
        }

        /* Input styling */
        :global(.p-inputtext) {
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
        }

        :global(.p-inputtext:enabled:focus) {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        :global(.p-inputtext.p-invalid) {
          border-color: #ef4444;
        }

        :global(.p-inputtext:disabled) {
          background: #f3f4f6;
          opacity: 0.6;
        }

        /* Button styling */
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

        /* Dialog styling */
        :global(.p-dialog) {
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        :global(.p-dialog .p-dialog-header) {
          border-radius: 12px 12px 0 0;
          padding: 1.5rem;
          background: #f9fafb;
        }

        :global(.p-dialog .p-dialog-content) {
          padding: 1.5rem;
        }

        :global(.p-dialog .p-dialog-footer) {
          padding: 1rem 1.5rem 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        /* Divider styling */
        :global(.p-divider) {
          margin: 1rem 0;
        }

        /* Message styling */
        :global(.p-message) {
          border-radius: 8px;
        }

        /* Permission card hover effect */
        :global(.surface-card) {
          border-width: 2px;
        }

        :global(.surface-card:hover) {
          border-color: #6366f1 !important;
        }

        /* Shadow */
        :global(.shadow-3) {
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
        }

        /* Field spacing */
        :global(.field) {
          margin-bottom: 1.5rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          :global(.p-card .p-card-body) {
            padding: 1.5rem;
          }

          :global(.p-dialog) {
            width: 90% !important;
          }
        }
      `}</style>
    </Layout>
  );
};

export default Edit;