import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/lara-light-indigo/theme.css';  // Thème
import 'primereact/resources/primereact.min.css';                   // Core CSS
import 'primeicons/primeicons.css';                                 // Icônes
import 'primeflex/primeflex.css';  import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Message } from 'primereact/message';
import Layout from '@/Layouts/layout/layout.jsx';

const UsersCreate = ({ roles = [] }) => {
  const { data, setData, errors, post, processing } = useForm({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: []
  });

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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
    setShowConfirmDialog(true);
  };

  // Confirmer la création
  const confirmCreate = () => {
    post(route('users.store'), {
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
          Créer un utilisateur
        </h1>
        <p className="text-600 mt-1 m-0">
          Remplissez les informations pour créer un nouveau compte utilisateur
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
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <InputText
                      id="first_name"
                      value={data.first_name}
                      onChange={(e) => setData('first_name', e.target.value)}
                      className={`w-full ${errors.first_name ? 'p-invalid' : ''}`}
                    />
                    {errors.first_name && (
                      <small className="p-error block mt-1">{errors.first_name}</small>
                    )}
                  </div>
                </div>

                <div className="col-12 md:col-6">
                  <div className="field">
                    <label htmlFor="last_name" className="block text-900 font-medium mb-2">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <InputText
                      id="last_name"
                      value={data.last_name}
                      onChange={(e) => setData('last_name', e.target.value)}
                      className={`w-full ${errors.last_name ? 'p-invalid' : ''}`}
                    />
                    {errors.last_name && (
                      <small className="p-error block mt-1">{errors.last_name}</small>
                    )}
                  </div>
                </div>

                <div className="col-12">
                  <div className="field">
                    <label htmlFor="email" className="block text-900 font-medium mb-2">
                      Adresse email <span className="text-red-500">*</span>
                    </label>
                    <InputText
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      className={`w-full ${errors.email ? 'p-invalid' : ''}`}
                    />
                    {errors.email && (
                      <small className="p-error block mt-1">{errors.email}</small>
                    )}
                  </div>
                </div>

                {/* Section Sécurité */}
                <div className="col-12 mt-4">
                  <div className="flex align-items-center gap-2 mb-4">
                    <i className="pi pi-lock text-primary text-2xl"></i>
                    <h2 className="text-900 text-xl font-semibold m-0">
                      Sécurité
                    </h2>
                  </div>
                  <Divider />
                </div>

                <div className="col-12 md:col-6">
                  <div className="field">
                    <label htmlFor="password" className="block text-900 font-medium mb-2">
                      Mot de passe <span className="text-red-500">*</span>
                    </label>
                    <Password
                      id="password"
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      className={`w-full ${errors.password ? 'p-invalid' : ''}`}
                      inputClassName="w-full"
                      promptLabel="Choisissez un mot de passe"
                      weakLabel="Faible"
                      mediumLabel="Moyen"
                      strongLabel="Fort"
                    />
                    {errors.password && (
                      <small className="p-error block mt-1">{errors.password}</small>
                    )}
                  </div>
                </div>

                <div className="col-12 md:col-6">
                  <div className="field">
                    <label htmlFor="password_confirmation" className="block text-900 font-medium mb-2">
                      Confirmer le mot de passe <span className="text-red-500">*</span>
                    </label>
                    <Password
                      id="password_confirmation"
                      value={data.password_confirmation}
                      onChange={(e) => setData('password_confirmation', e.target.value)}
                      className={`w-full ${errors.password_confirmation ? 'p-invalid' : ''}`}
                      inputClassName="w-full"
                      feedback={false}
                    />
                    {errors.password_confirmation && (
                      <small className="p-error block mt-1">{errors.password_confirmation}</small>
                    )}
                  </div>
                </div>

                {/* Section Rôles */}
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
                              onClick={() => handleRoleToggle(role.value)}
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

                {/* Actions */}
                <div className="col-12 mt-4">
                  <Divider />
                  <div className="flex justify-content-end gap-2">
                    <Button
                      label="Annuler"
                      outlined
                      severity="secondary"
                      onClick={() => router.visit(route('users.index'))}
                      disabled={processing}
                    />
                    <Button
                      label="Créer l'utilisateur"
                      icon="pi pi-user-plus"
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
            <i className="pi pi-user-plus text-5xl text-green-600"></i>
          </div>
          
          <h3 className="text-900 text-xl font-bold mb-2">
            Créer un nouvel utilisateur
          </h3>
          
          <p className="text-600 mb-3">
            Êtes-vous sûr de vouloir créer ce compte utilisateur ?
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
    </Layout>
  );
};

export default UsersCreate;