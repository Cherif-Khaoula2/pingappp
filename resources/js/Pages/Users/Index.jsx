import { useState } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import Layout from '@/Layouts/layout/layout.jsx';

const UsersIndex = ({ users: usersPaginated = {}, search = '' }) => {
  const [query, setQuery] = useState(search || '');
  const { processing } = useForm({});
  
  const pageProps = usePage().props || {};
  const { permissions = [] } = pageProps;
  const canadd = permissions.includes("adduser");
  const canviewldap = permissions.includes("getallldap");
  
  // Extraire les données paginées
  const users = usersPaginated.data || [];
  const total = usersPaginated.total || 0;
  const currentPage = usersPaginated.current_page || 1;
  const perPage = usersPaginated.per_page || 10;

  // 🔍 Recherche utilisateur
  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route('users.index'), { search: query }, {
      preserveState: true,
      preserveScroll: true
    });
  };

  // Template pour le nom avec icône et avatar
  const nameTemplate = (rowData) => {
    const fullName = `${rowData.first_name || ''} ${rowData.last_name || ''}`.trim();
    const initial = rowData.first_name ? rowData.first_name.charAt(0).toUpperCase() : 'U';
    
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
          <div className="font-medium text-900">{fullName || 'Sans nom'}</div>
          <div className="text-sm text-600">{rowData.email}</div>
        </div>
      </div>
    );
  };

  // Template pour les rôles
  const rolesTemplate = (rowData) => {
    return (
      <div className="flex flex-wrap gap-1">
        {rowData.roles && rowData.roles.length > 0 ? (
          rowData.roles.map((role, index) => (
            <Tag 
              key={index}
              value={role.name}
              className="capitalize"
              style={{
                background: '#eef2ff',
                color: '#4338ca',
                border: '1px solid #c7d2fe',
                padding: '0.25rem 0.625rem',
                fontSize: '0.75rem'
              }}
            />
          ))
        ) : (
          <Tag 
            value="Aucun rôle"
            severity="secondary"
            style={{
              padding: '0.25rem 0.625rem',
              fontSize: '0.75rem'
            }}
          />
        )}
      </div>
    );
  };

  // Template statut
  const statusTemplate = (rowData) => {
    return rowData.deleted_at ? (
      <Tag 
        severity="danger" 
        value="Supprimé" 
        icon="pi pi-trash"
        className="font-medium"
      />
    ) : (
      <Tag 
        severity="success" 
        value="Actif" 
        className="font-medium"
      />
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
            <i className="pi pi-users text-3xl text-blue-600"></i>
          </div>
          <div>
            <h1 className="text-900 text-3xl font-bold m-0">
              Gestion des utilisateurs
            </h1>
            <p className="text-600 mt-1 m-0">
              {total} utilisateur{total > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {canviewldap && (
            <Button
              label="Utilisateurs LDAP"
              icon="pi pi-shield"
              outlined
              onClick={() => router.visit(route('ldap.index'))}
              style={{
                borderColor: '#6b7280',
                color: '#374151'
              }}
            />
          )}
       
        </div>
      </div>

      {/* Barre de recherche */}
      <form onSubmit={handleSearch}>
        <div className="p-inputgroup">
          <span className="p-inputgroup-addon">
            <i className="pi pi-search"></i>
          </span>
          <InputText
            placeholder="Rechercher par nom ou email..."
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
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              border: 'none',
              minWidth: '140px'
            }}
          />
          {query && (
            <Button
              icon="pi pi-times"
              outlined
              onClick={() => {
                setQuery('');
                router.get(route('users.index'), {}, {
                  preserveState: true,
                  preserveScroll: true
                });
              }}
              style={{
                borderColor: '#6b7280',
                color: '#374151'
              }}
            />
          )}
        </div>
      </form>
    </div>
  );

  return (
    <Layout>
      <div className="grid">
        <div className="col-12">
          <Card className="shadow-2">
           <DataTable
  value={users}
  header={tableHeader}
  lazy
  paginator
  first={(currentPage - 1) * perPage}
  rows={perPage}
  totalRecords={total}
  onPage={(e) => {
    const page = (e.first / e.rows) + 1;
    router.get(route('users.index'), { 
      search: query,
      page: page 
    }, {
      preserveState: true,
      preserveScroll: true
    });
  }}
  rowsPerPageOptions={[5, 10, 25, 50]}
  onRowsPerPageChange={(e) => {
    router.get(route('users.index'), { 
      search: query,
      per_page: e.value 
    }, {
      preserveState: true,
      preserveScroll: true
    });
  }}
  emptyMessage={
    <div className="text-center py-6">
      <i className="pi pi-users text-400 mb-3" style={{ fontSize: '3rem' }}></i>
      <h3 className="text-900 text-xl font-medium mb-2">
        Aucun utilisateur trouvé
      </h3>
      <p className="text-600 mb-4">
        {query 
          ? 'Essayez de modifier votre recherche'
          : 'Commencez par créer votre premier utilisateur'}
      </p>
      {!query && canadd && (
        <Button
          label="Créer un utilisateur"
          icon="pi pi-user-plus"
          onClick={() => router.visit(route('users.create'))}
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
  paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
  currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} utilisateurs"
  onRowClick={(e) => {
    if (e.data && e.data.id) {
      router.visit(route('users.edit', e.data.id));
      
    }
  }}
  rowClassName={(data) => data.id ? 'cursor-pointer hover:bg-gray-50' : ''}
  selectionMode="single"
>
  <Column
    field="first_name"
    header="Utilisateur"
    body={nameTemplate}
    sortable
    style={{ minWidth: '250px' }}
  />
  <Column
    field="roles"
    header="Rôles"
    body={rolesTemplate}
    style={{ minWidth: '200px' }}
  />

  {/* ✅ Nouvelle colonne Historique */}
  <Column
    header="Historique"
    body={(rowData) => (
      <Button
        icon="pi pi-clock"
        label="Voir"
        severity="info"
        text
        size="small"
        onClick={() => router.visit(`/ad/activity-logs/user/${rowData.id}`)}
        style={{
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          border: 'none',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '6px'
        }}
      />
    )}
    style={{ minWidth: '140px', textAlign: 'center' }}
  />
</DataTable>

          </Card>
        </div>
      </div>

      <style >{`
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

        :global(.cursor-pointer) {
          cursor: pointer;
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

        :global(.p-button:not(.p-button-outlined):not(:disabled):hover) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        :global(.p-button-outlined) {
          border-width: 2px;
        }

        /* Tag styling */
        :global(.p-tag) {
          border-radius: 6px;
          padding: 0.35rem 0.7rem;
          font-size: 0.875rem;
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
          :global(.p-datatable .p-datatable-header) {
            padding: 1rem;
          }

          :global(.p-card .p-card-body) {
            padding: 1rem;
          }
        }
      `}</style>
    </Layout>
  );
};

export default UsersIndex;