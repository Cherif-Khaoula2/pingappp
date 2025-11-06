import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Message } from 'primereact/message';
import Layout from '@/Layouts/layout/layout.jsx';
import 'primereact/resources/themes/lara-light-indigo/theme.css';  // Thème
import 'primereact/resources/primereact.min.css';                   // Core CSS
import 'primeicons/primeicons.css';                                 // Icônes
import 'primeflex/primeflex.css';  
const RolesCreate = ({ permissions = [] }) => {
  const { data, setData, errors, post, processing } = useForm({
    name: '',
    permissions: []
  });

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Gérer la sélection des permissions
  const handlePermissionToggle = (permissionValue) => {
    const currentPermissions = [...data.permissions];
    const index = currentPermissions.indexOf(permissionValue);
    
    if (index > -1) {
      currentPermissions.splice(index, 1);
    } else {
      currentPermissions.push(permissionValue);
    }
    
    setData('permissions', currentPermissions);
  };

  // Soumettre le formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  // Confirmer la création
  const confirmCreate = () => {
    post(route('roles.store'), {
      onSuccess: () => {
        setShowConfirmDialog(false);
      },
      onError: () => {
        setShowConfirmDialog(false);
      }
    });
  };

  // Footer du dialog
  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Annuler"
        icon="pi pi-times"
        outlined
        severity="secondary"
        onClick={() => setShowConfirmDialog(false)}
        disabled={processing}
      />
      <Button
        label={processing ? "Création..." : "Créer"}
        icon={processing ? "pi pi-spin pi-spinner" : "pi pi-check"}
        severity="success"
        onClick={confirmCreate}
        loading={processing}
      />
    </div>
  );

  // Header de la page
  const pageHeader = (
    <div className="flex align-items-center gap-3 mb-4">
      <div>
        <h1 className="text-900 text-3xl font-bold m-0">
          Créer un rôle
        </h1>
        <p className="text-600 mt-1 m-0">
          Remplissez les informations pour créer un nouveau rôle
        </p>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="grid">
        <div className="col-12">
          {pageHeader}
          
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
                        {permissions.map((permission) => (
                          <div key={permission.value} className="col-12 md:col-6 lg:col-4">
                            <div 
                              className={`surface-card p-3 border-1 border-round cursor-pointer transition-all transition-duration-200 hover:surface-hover ${
                                data.permissions.includes(permission.value) 
                                  ? 'border-primary shadow-2' 
                                  : 'border-300'
                              }`}
                              onClick={() => handlePermissionToggle(permission.value)}
                            >
                              <div className="flex align-items-center gap-3">
                                <label 
                                  htmlFor={`permission-${permission.value}`} 
                                  className="text-900 font-medium cursor-pointer flex-1"
                                >
                                  {permission.label}
                                </label>
                                {data.permissions.includes(permission.value) && (
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
                      Sélectionnez une ou plusieurs permissions pour définir les accès de ce rôle
                    </small>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-12 mt-4">
                  <Divider />
                  <div className="flex justify-content-end gap-2">
                    <Button
                      label="Annuler"
                      outlined
                      severity="secondary"
                      onClick={() => router.visit(route('roles.index'))}
                      disabled={processing}
                    />
                    <Button
                      label="Créer le rôle"
                      icon="pi pi-plus"
                      type="submit"
                      loading={processing}
                      style={{
                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                        border: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Dialog de confirmation */}
      <Dialog
        visible={showConfirmDialog}
        onHide={() => setShowConfirmDialog(false)}
        header={
          <div className="flex align-items-center gap-2">
            <i className="pi pi-check-circle text-green-600 text-2xl"></i>
            <span>Confirmer la création</span>
          </div>
        }
        footer={dialogFooter}
        style={{ width: '480px' }}
        modal
        draggable={false}
      >
        <div className="text-center py-3">
          <div 
            className="inline-flex align-items-center justify-content-center bg-green-100 border-circle mb-4" 
            style={{ width: '80px', height: '80px' }}
          >
            <i className="pi pi-plus text-5xl text-green-600"></i>
          </div>
          
          <h3 className="text-900 text-xl font-bold mb-2">
            Créer un nouveau rôle
          </h3>
          
          <p className="text-600 mb-3">
            Êtes-vous sûr de vouloir créer ce rôle ?
          </p>

          <div className="surface-100 border-round p-3 text-left">
            <div className="flex align-items-center gap-2 mb-2">
              <i className="pi pi-shield text-600"></i>
              <span className="text-900 font-medium">
                {data.name || 'Non défini'}
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

        /* Permission card styling */
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

export default RolesCreate;