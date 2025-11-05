import { useState } from 'react';
import { useForm, router, usePage,Head } from '@inertiajs/react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Message } from 'primereact/message';
import Layout from '@/Layouts/layout/layout.jsx';

const UsersEdit = () => {
  const { user, roles } = usePage().props;
  const pageProps = usePage().props;
  const { permissions = [] } = pageProps;
  
  const canupdate = permissions.includes("updateuser");
  const candelete = permissions.includes("deleteuser");
  const canviewrole = permissions.includes("getallrole");

  const { data, setData, errors, post, processing } = useForm({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email || '',
    password: '',
    password_confirmation: '',
    role: user.roles || [],
    _method: 'put'
  });

  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Gérer la sélection des rôles
  const handleRoleToggle = (roleValue) => {
    const currentRoles = [...data.role];
    const index = currentRoles.indexOf(roleValue);
    
    if (index > -1) {
      currentRoles.splice(index, 1);
    } else {
      currentRoles.push(roleValue);
    }
    
    setData('role', currentRoles);
  };

  // Soumettre le formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowUpdateDialog(true);
  };

  // Confirmer la modification
  const confirmUpdate = () => {
    post(route('users.update', user.id), {
      onSuccess: () => {
        setShowUpdateDialog(false);
      },
      onError: () => {
        setShowUpdateDialog(false);
      }
    });
  };

  // Confirmer la suppression
  const confirmDelete = () => {
    router.delete(route('users.destroy', user.id), {
      onSuccess: () => {
        setShowDeleteDialog(false);
      }
    });
  };

  // Restaurer l'utilisateur
  const restore = () => {
    router.put(route('users.restore', user.id));
  };

  // Footer du dialog de modification
  const updateDialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Annuler"
        icon="pi pi-times"
        outlined
        severity="secondary"
        onClick={() => setShowUpdateDialog(false)}
        disabled={processing}
      />
      <Button
        label={processing ? "Modification..." : "Confirmer"}
        icon={processing ? "pi pi-spin pi-spinner" : "pi pi-check"}
        severity="info"
        onClick={confirmUpdate}
        loading={processing}
      />
    </div>
  );

  // Footer du dialog de suppression
  const deleteDialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Annuler"
        icon="pi pi-times"
        outlined
        severity="secondary"
        onClick={() => setShowDeleteDialog(false)}
      />
      <Button
        label="Supprimer"
        icon="pi pi-trash"
        severity="danger"
        onClick={confirmDelete}
      />
    </div>
  );

  // Header de la page
  const pageHeader = (
    <div className="flex align-items-center justify-content-between mb-4">
      <div>
        <h1 className="text-900 text-3xl font-bold m-0">
          Modifier l'utilisateur
        </h1>
        <p className="text-600 mt-1 m-0">
          {data.first_name} {data.last_name}
        </p>
      </div>
      {candelete && !user.deleted_at && (
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
    <Layout>
      <Head title="Modifier utilisateur" />
      <div className="grid">
        <div className="col-12">
          {pageHeader}

          {/* Message si utilisateur supprimé */}
          {user.deleted_at && (
            <Message 
              severity="warn" 
              className="mb-4 w-full"
              content={
                <div className="flex align-items-center justify-content-between w-full">
                  <span>Cet utilisateur a été supprimé.</span>
                  <Button
                    label="Restaurer"
                    icon="pi pi-replay"
                    size="small"
                    onClick={restore}
                  />
                </div>
              }
            />
          )}
          
          <Card className="shadow-3">
            <form onSubmit={handleSubmit}>
              <div className="grid">
                {/* Section Informations personnelles */}
                <div className="col-12">
                  <div className="flex align-items-center gap-2 mb-4">
                    <i className="pi pi-user text-primary text-2xl"></i>
                    <h2 className="text-900 text-xl font-semibold m-0">
                      Informations personnelles
                    </h2>
                  </div>
                  <Divider />
                </div>

              <div className="col-12 md:col-6">
  <div className="field">
    <label htmlFor="first_name" className="block text-900 font-medium mb-2">
      Prénom
    </label>
    <InputText
      id="first_name"
      value={data.first_name} 
      readOnly                 
      className="w-full"
    />
  </div>
</div>

<div className="col-12 md:col-6">
  <div className="field">
    <label htmlFor="last_name" className="block text-900 font-medium mb-2">
      Nom
    </label>
    <InputText
      id="last_name"
      value={data.last_name}   
      readOnly                
      className="w-full"
    />
  </div>
</div>

<div className="col-12">
  <div className="field">
    <label htmlFor="email" className="block text-900 font-medium mb-2">
      Adresse email
    </label>
    <InputText
      id="email"
      type="email"
      value={data.email}      
      readOnly                
      className="w-full"
    />
  </div>
</div>

               

                

                {/* Section Rôles */}
                {canviewrole && (
                  <>
                    <div className="col-12 mt-4">
                      <div className="flex align-items-center gap-2 mb-4">
                        <i className="pi pi-shield text-primary text-2xl"></i>
                        <h2 className="text-900 text-xl font-semibold m-0">
                          Rôles
                        </h2>
                      </div>
                      <Divider />
                    </div>

                    <div className="col-12">
                      <div className="field">
                        <label className="block text-900 font-medium mb-3">
                          Sélectionner les rôles <span className="text-red-500">*</span>
                        </label>
                        
                        {roles.length > 0 ? (
                          <div className="grid">
                            {roles.map((role) => (
                              <div key={role.value} className="col-12 md:col-6 lg:col-4">
                                <div 
                                  className={`surface-card p-3 border-1 border-round cursor-pointer transition-all transition-duration-200 hover:surface-hover ${
                                    data.role.includes(role.value) 
                                      ? 'border-primary shadow-2' 
                                      : 'border-300'
                                  }`}
                                  onClick={() => canupdate && handleRoleToggle(role.value)}
                                >
                                  <div className="flex align-items-center gap-3">
                                    <label 
                                      htmlFor={`role-${role.value}`} 
                                      className="text-900 font-medium cursor-pointer flex-1"
                                    >
                                      {role.label}
                                    </label>
                                    {data.role.includes(role.value) && (
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
                            text="Aucun rôle disponible pour le moment" 
                            className="w-full"
                          />
                        )}

                        {errors.role && (
                          <small className="p-error block mt-2">{errors.role}</small>
                        )}
                        
                        <small className="text-600 block mt-2">
                          <i className="pi pi-info-circle mr-1"></i>
                          Sélectionnez un ou plusieurs rôles pour définir les permissions de l'utilisateur
                        </small>
                      </div>
                    </div>
                  </>
                )}

                {/* Actions */}
                {canupdate && (
                  <div className="col-12 mt-4">
                    <Divider />
                    <div className="flex justify-content-end gap-2">
                      <Button
                        label="Annuler"
                        outlined
                        severity="secondary"
                        onClick={() => router.visit(route('users'))}
                        disabled={processing}
                      />
                      <Button
                        label="Modifier l'utilisateur"
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
        visible={showUpdateDialog}
        onHide={() => setShowUpdateDialog(false)}
        header={
          <div className="flex align-items-center gap-2">
            <i className="pi pi-pencil text-blue-600 text-2xl"></i>
            <span>Confirmer la modification</span>
          </div>
        }
        footer={updateDialogFooter}
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
            Modifier l'utilisateur
          </h3>
          
          <p className="text-600 mb-3">
            Êtes-vous sûr de vouloir modifier cet utilisateur ?<br />
            Les modifications seront enregistrées.
          </p>

          <div className="surface-100 border-round p-3 text-left">
            <div className="flex align-items-center gap-2 mb-2">
              <i className="pi pi-user text-600"></i>
              <span className="text-900 font-medium">
                {data.first_name} {data.last_name}
              </span>
            </div>
            <div className="flex align-items-center gap-2 mb-2">
              <i className="pi pi-envelope text-600"></i>
              <span className="text-700">{data.email}</span>
            </div>
            <div className="flex align-items-center gap-2">
              <i className="pi pi-shield text-600"></i>
              <span className="text-700">
                {data.role.length} rôle{data.role.length > 1 ? 's' : ''} sélectionné{data.role.length > 1 ? 's' : ''}
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
            Supprimer l'utilisateur
          </h3>
          
          <p className="text-600 mb-3">
            Êtes-vous sûr de vouloir supprimer cet utilisateur ?<br />
            Cette action est irréversible.
          </p>

          <div className="surface-100 border-round p-3 text-left">
            <div className="flex align-items-center gap-2 mb-2">
              <i className="pi pi-user text-600"></i>
              <span className="text-900 font-medium">
                {data.first_name} {data.last_name}
              </span>
            </div>
            <div className="flex align-items-center gap-2">
              <i className="pi pi-envelope text-600"></i>
              <span className="text-700">{data.email}</span>
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
        :global(.p-inputtext),
        :global(.p-password input) {
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
        }

        :global(.p-inputtext:enabled:focus),
        :global(.p-password input:enabled:focus) {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        :global(.p-inputtext.p-invalid),
        :global(.p-password.p-invalid input) {
          border-color: #ef4444;
        }

        :global(.p-inputtext:disabled),
        :global(.p-password input:disabled) {
          background: #f3f4f6;
          opacity: 0.6;
        }

        /* Password styling */
        :global(.p-password) {
          width: 100%;
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

        /* Checkbox styling */
        :global(.p-checkbox .p-checkbox-box) {
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        :global(.p-checkbox .p-checkbox-box.p-highlight) {
          background: #6366f1;
          border-color: #6366f1;
        }

        :global(.p-checkbox:not(.p-disabled) .p-checkbox-box:hover) {
          border-color: #6366f1;
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

export default UsersEdit;