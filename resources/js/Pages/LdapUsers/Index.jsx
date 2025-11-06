import { useState } from 'react';
import { useForm, router, usePage, Head } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import Layout from '@/Layouts/layout/layout.jsx';
import 'primereact/resources/themes/lara-light-indigo/theme.css';  // Thème
import 'primereact/resources/primereact.min.css';                   // Core CSS
import 'primeicons/primeicons.css';                                 // Icônes
import 'primeflex/primeflex.css';  
const LdapUsersIndex = ({ users = [], search = '', roles = [] }) => {
  const [query, setQuery] = useState(search || '');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [visible, setVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const { processing } = useForm({});
  
  const pageProps = usePage().props || {};
  const permissions = pageProps.permissions || [];
  const canDelete = permissions.includes("deleteuser");

  // 🔍 Recherche utilisateur
  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route('ldap.index'), { search: query });
  };

  // 🔹 Ouvrir le Dialog d'autorisation
  const openAuthorizeModal = (user) => {
    setSelectedUser(user);
    setSelectedRole('');
    setVisible(true);
  };

  // 🔹 Fermer le Dialog
  const closeDialog = () => {
    setVisible(false);
    setSelectedUser(null);
    setSelectedRole('');
  };

  // 🔹 Ouvrir le Dialog de suppression
  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setDeleteVisible(true);
  };

  // 🔹 Fermer le Dialog de suppression
  const closeDeleteDialog = () => {
    setDeleteVisible(false);
    setUserToDelete(null);
  };

  // 🔹 Autoriser un utilisateur
  const handleAuthorize = () => {
    if (!selectedUser || !selectedRole) {
      return;
    }

    router.post(
      route('ldap.authorize', { username: selectedUser.username }),
      { role: selectedRole },
      {
        onSuccess: closeDialog,
        onError: () => alert('Erreur lors de l\'autorisation de l\'utilisateur.'),
      }
    );
  };

  // 🔹 Supprimer un utilisateur autorisé
  const handleDelete = () => {
    if (!userToDelete) return;

    router.delete(
      route('ldap.delete', { email: userToDelete.email }),
      {
        onSuccess: closeDeleteDialog,
        onError: () => alert('Erreur lors de la suppression de l\'utilisateur.'),
      }
    );
  };

  // Template pour le nom avec icône
  const nameTemplate = (rowData) => {
    return (
      <div className="flex align-items-center gap-2">
        <i className="pi pi-user text-blue-600"></i>
        <span className="font-medium">{rowData.name}</span>
      </div>
    );
  };

  // Template pour l'email avec icône
  const emailTemplate = (rowData) => {
    return (
      <div className="flex align-items-center gap-2">
        <i className="pi pi-envelope text-gray-500"></i>
        <span className="text-600">{rowData.email}</span>
      </div>
    );
  };

  // Template statut
  const statusTemplate = (rowData) => {
    return rowData.is_local ? (
      <Tag 
        severity="success" 
        value="Autorisé" 
        icon="pi pi-check-circle"
        className="font-medium"
      />
    ) : (
      <Tag 
        severity="warning" 
        value="Non autorisé" 
        icon="pi pi-exclamation-circle"
        className="font-medium"
      />
    );
  };

  // Template action
  const actionTemplate = (rowData) => {
    if (rowData.is_local) {
      // Si l'utilisateur est autorisé, afficher le bouton Supprimer
      return canDelete ? (
        <Button
  label="Désactiver"
  icon="pi pi-ban"
  size="small"
  severity="danger"
  outlined
  onClick={() => openDeleteModal(rowData)}
  loading={processing}
/>

      ) : null;
    }
    
    // Si l'utilisateur n'est pas autorisé, afficher le bouton Autoriser
    return (
      <Button
        label="Autoriser"
        icon="pi pi-shield"
        size="small"
        onClick={() => openAuthorizeModal(rowData)}
        loading={processing}
        style={{
          background: 'linear-gradient(135deg, #155ecc, #6366f1)',
          border: 'none'
        }}
      />
    );
  };

  // Footer du Dialog d'autorisation
  const footerDialog = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Annuler"
        outlined
        severity="secondary"
        onClick={closeDialog}
        disabled={processing}
      />
      <Button
        label={processing ? "Autorisation..." : "Autoriser"}
        icon={processing ? "pi pi-spin pi-spinner" : "pi pi-check"}
        onClick={handleAuthorize}
        loading={processing}
        disabled={!selectedRole}
        style={{
          background: selectedRole ? 'linear-gradient(135deg, #22c55e, #16a34a)' : undefined,
          border: 'none'
        }}
      />
    </div>
  );

  // Footer du Dialog de suppression
  const deleteDialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Annuler"
        outlined
        severity="secondary"
        onClick={closeDeleteDialog}
        disabled={processing}
      />
      <Button
        label={processing ? "Suppression..." : "Supprimer"}
        severity="danger"
        onClick={handleDelete}
        loading={processing}
      />
    </div>
  );

  // Header du tableau
  const tableHeader = (
    <div className="flex flex-column gap-3">
      <div className="flex align-items-center gap-3">
        <div 
          className="inline-flex align-items-center justify-content-center bg-blue-100 border-circle" 
          style={{ width: '48px', height: '48px' }}
        >
          <i className="pi pi-users text-3xl text-blue-600"></i>
        </div>
        <div>
          <h1 className="text-900 text-3xl font-bold m-0">
            Gestion des utilisateurs LDAP
          </h1>
          <p className="text-600 mt-1 m-0">
            Recherchez et autorisez les utilisateurs du répertoire LDAP
          </p>
        </div>
      </div>

      {/* Barre de recherche */}
      <form onSubmit={handleSearch}>
        <div className="p-inputgroup">
          <span className="p-inputgroup-addon">
            <i className="pi pi-search"></i>
          </span>
          <InputText
            placeholder="Rechercher un utilisateur dans LDAP (nom, login, email)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ height: '48px' }}
          />
          <Button
            type="submit"
            label="Rechercher"
            icon="pi pi-search"
            loading={processing}
            style={{
              background: 'linear-gradient(135deg, #155ecc, #6366f1)',
              border: 'none',
              minWidth: '140px'
            }}
          />
        </div>
      </form>
    </div>
  );

  return (
    <Layout>
      <Head title="Gestion des utilisateurs LDAP" />
      <div className="grid">
        <div className="col-12">
          <Card className="shadow-2">
            <DataTable
              value={users}
              header={tableHeader}
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
              emptyMessage="Aucun utilisateur trouvé. Utilisez la recherche pour trouver des utilisateurs LDAP."
              stripedRows
              responsiveLayout="scroll"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} utilisateurs"
            >
              <Column
                field="name"
                header="Nom"
                body={nameTemplate}
                sortable
                style={{ minWidth: '200px' }}
              />
              <Column
                field="username"
                header="Login"
                sortable
                style={{ minWidth: '150px' }}
              />
              <Column
                field="email"
                header="Email"
                body={emailTemplate}
                sortable
                style={{ minWidth: '200px' }}
              />
              <Column
                header="Statut"
                body={statusTemplate}
                style={{ minWidth: '130px' }}
              />
              <Column
                header="Action"
                body={actionTemplate}
                style={{ minWidth: '130px', textAlign: 'center' }}
              />
            </DataTable>
          </Card>
        </div>
      </div>

      {/* Dialog d'autorisation */}
      <Dialog
        visible={visible}
        onHide={closeDialog}
        header={
          <div className="flex align-items-center gap-2">
            <i className="pi pi-shield text-blue-600"></i>
            <span>Autorisation d'accès</span>
          </div>
        }
        footer={footerDialog}
        style={{ width: '480px' }}
        modal
        draggable={false}
      >
        {selectedUser && (
          <div>
            <div className="text-center mb-4">
              <div 
                className="inline-flex align-items-center justify-content-center bg-blue-100 border-circle mb-3" 
                style={{ width: '60px', height: '60px' }}
              >
                <i className="pi pi-user text-4xl text-blue-600"></i>
              </div>
              <p className="text-700 text-lg m-0">
                Voulez-vous autoriser l'accès à
              </p>
              <p className="text-900 font-bold text-xl mt-2 mb-0">
                {selectedUser.name}
              </p>
              <p className="text-600 text-sm mt-1">
                <i className="pi pi-at mr-1"></i>
                {selectedUser.username} • {selectedUser.email}
              </p>
            </div>

            <Divider />

            <div className="mb-3">
              <label htmlFor="role-select" className="block text-900 font-medium mb-2">
                <i className="pi pi-tag mr-2 text-blue-600"></i>
                Rôle à attribuer <span className="text-red-500">*</span>
              </label>
              <Dropdown
                id="role-select"
                value={selectedRole}
                options={roles.map((r) => ({ label: r, value: r }))}
                onChange={(e) => setSelectedRole(e.value)}
                placeholder="-- Sélectionner un rôle --"
                className="w-full"
                style={{ height: '48px' }}
              />
              <small className="text-500 block mt-2">
                <i className="pi pi-info-circle mr-1"></i>
                Choisissez le niveau d'accès approprié pour cet utilisateur
              </small>
            </div>

            {!selectedRole && (
              <Message 
                severity="warn" 
                text="Veuillez sélectionner un rôle avant de continuer." 
                className="w-full"
              />
            )}
          </div>
        )}
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        visible={deleteVisible}
        onHide={closeDeleteDialog}
        header={
          <div className="flex align-items-center gap-2">
            <i className="pi pi-exclamation-triangle text-red-600 text-2xl"></i>
            <span>Confirmer la désactivation</span>
          </div>
        }
        footer={deleteDialogFooter}
        style={{ width: '480px' }}
        modal
        draggable={false}
      >
        {userToDelete && (
          <div className="text-center py-3">
            <div 
              className="inline-flex align-items-center justify-content-center bg-red-100 border-circle mb-4" 
              style={{ width: '80px', height: '80px' }}
            >
              <i className="pi pi-trash text-5xl text-red-600"></i>
            </div>
            
            <h3 className="text-900 text-xl font-bold mb-2">
              Désactiver l'autorisation de l'utilisateur LDAP
            </h3>
            
            <p className="text-600 mb-3">
              Êtes-vous sûr de vouloir désactiver l'autorisation de cet utilisateur ?<br />
              
            </p>

            <div className="surface-100 border-round p-3 text-left">
              <div className="flex align-items-center gap-2 mb-2">
                <i className="pi pi-user text-600"></i>
                <span className="text-900 font-medium">
                  {userToDelete.name}
                </span>
              </div>
              <div className="flex align-items-center gap-2 mb-2">
                <i className="pi pi-at text-600"></i>
                <span className="text-700">{userToDelete.username}</span>
              </div>
              <div className="flex align-items-center gap-2">
                <i className="pi pi-envelope text-600"></i>
                <span className="text-700">{userToDelete.email}</span>
              </div>
            </div>

            <Message 
              severity="warn" 
              text="L'utilisateur ne pourra plus se connecter après la désactivation." 
              className="w-full mt-3"
            />
          </div>
        )}
      </Dialog>

      <style jsx>{`
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

        /* Dropdown styling */
        :global(.p-dropdown) {
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        :global(.p-dropdown:not(.p-disabled):hover) {
          border-color: #6366f1;
        }

        :global(.p-dropdown:not(.p-disabled).p-focus) {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
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

        :global(.p-button-danger:not(.p-button-outlined):hover) {
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
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

        /* Tag styling */
        :global(.p-tag) {
          border-radius: 6px;
          padding: 0.35rem 0.7rem;
          font-size: 0.875rem;
        }

        /* Message styling */
        :global(.p-message) {
          border-radius: 8px;
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

        /* Responsive */
        @media (max-width: 768px) {
          :global(.p-card .p-card-body) {
            padding: 1rem;
          }

          :global(.p-dialog) {
            width: 90% !important;
          }
        }
      `}</style>
    </Layout>
  );
};

export default LdapUsersIndex;