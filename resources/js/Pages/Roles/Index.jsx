import { useState } from 'react';
import { useForm, router, usePage, Head } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Chip } from 'primereact/chip';
import Layout from '@/Layouts/layout/layout.jsx';
import 'primereact/resources/themes/lara-light-indigo/theme.css';  // Thème
import 'primereact/resources/primereact.min.css';                   // Core CSS
import 'primeicons/primeicons.css';                                 // Icônes
import 'primeflex/primeflex.css';

const RolesIndex = ({ roles: rolesPaginated = {}, search = '' }) => {
  const [query, setQuery] = useState(search || '');
  const { processing } = useForm({});

  const pageProps = usePage().props || {};
  const { permissions = [] } = pageProps;

  const canadd = permissions.includes('addrole');
  const canupdate = permissions.includes('updaterole');
  const candelete = permissions.includes('deleterole');

  // données paginées
  const roles = rolesPaginated.data || [];
  const total = rolesPaginated.total || 0;
  const currentPage = rolesPaginated.current_page || 1;
  const perPage = rolesPaginated.per_page || 10;

  // recherche
  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route('roles.index'), { search: query }, {
      preserveState: true,
      preserveScroll: true
    });
  };

  // Template nom + icône + tag supprimé
  const nameTemplate = (rowData) => {
    return (
      <div className="flex align-items-center gap-2">
        <i className="pi pi-shield text-primary text-xl"></i>
        <div>
          <div className="font-medium text-900">{rowData.name}</div>
          {rowData.description && (
            <div className="text-sm text-600">{rowData.description}</div>
          )}
        </div>
        {rowData.deleted_at && (
          <Tag
            value="Supprimé"
            severity="danger"
            icon="pi pi-trash"
            className="ml-2"
          />
        )}
      </div>
    );
  };

  // Template permissions (chips)
  const permissionsBodyTemplate = (rowData) => {
    if (!rowData.permissions || rowData.permissions.length === 0) {
      return (
        <div className="flex align-items-center gap-2 text-500">
          <i className="pi pi-info-circle"></i>
          <span className="text-sm">Aucune permission</span>
        </div>
      );
    }

    const displayed = rowData.permissions.slice(0, 3);
    const remaining = rowData.permissions.length - displayed.length;

    return (
      <div className="flex flex-wrap gap-2">
        {displayed.map((p) => (
          <Chip
            key={p.id || p.name}
            label={p.name}
            className="text-sm"
            style={{ background: '#f3f4f6', color: '#374151' }}
          />
        ))}
        {remaining > 0 && (
          <Chip
            label={`+${remaining}`}
            className="text-sm"
            style={{ background: '#e5e7eb', color: '#6b7280', fontWeight: 600 }}
          />
        )}
      </div>
    );
  };

  // compteur de permissions
  const permissionsCountTemplate = (rowData) => {
    const count = rowData.permissions?.length || 0;
    return (
      <div className="flex align-items-center justify-content-center">
        <Tag
          value={count}
          severity={count > 0 ? 'success' : 'warning'}
          rounded
          style={{ minWidth: '2.5rem' }}
        />
      </div>
    );
  };

  // date création
  const createdAtTemplate = (rowData) => {
    if (!rowData.created_at) return '-';
    const date = new Date(rowData.created_at);
    return (
      <span className="text-600">
        {date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
      </span>
    );
  };

  // actions (edit / delete / restore)
  const handleDelete = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
      router.delete(route('roles.destroy', id), {
        preserveState: true,
      });
    }
  };

  const handleRestore = (id) => {
    if (confirm('Êtes-vous sûr de vouloir restaurer ce rôle ?')) {
      router.put(route('roles.restore', id), {}, {
        preserveState: true,
      });
    }
  };

  const actionsTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        {canupdate && !rowData.deleted_at && (
          <Button
            icon="pi pi-pencil"
            rounded
            text
            severity="info"
            tooltip="Modifier"
            tooltipOptions={{ position: 'top' }}
            onClick={() => router.visit(route('roles.edit', rowData.id))}
          />
        )}

        {candelete && !rowData.deleted_at && (
          <Button
            icon="pi pi-trash"
            rounded
            text
            severity="danger"
            tooltip="Supprimer"
            tooltipOptions={{ position: 'top' }}
            onClick={() => handleDelete(rowData.id)}
          />
        )}

        {rowData.deleted_at && (
          <Button
            icon="pi pi-replay"
            rounded
            text
            severity="success"
            tooltip="Restaurer"
            tooltipOptions={{ position: 'top' }}
            onClick={() => handleRestore(rowData.id)}
          />
        )}
      </div>
    );
  };

  // header du tableau
  const tableHeader = (
    <div className="flex flex-column gap-3">
      <div className="flex align-items-center justify-content-between flex-wrap gap-3">
        <div className="flex align-items-center gap-3">
          <div
            className="inline-flex align-items-center justify-content-center bg-indigo-50 border-circle"
          
          >
          </div>
          <div>
            <h1 className="text-900 text-3xl font-bold m-0">Gestion des rôles</h1>
            <p className="text-600 mt-1 m-0">{total} rôle{total > 1 ? 's' : ''} au total</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {canadd && (
            <Button
              label="Créer un rôle"
              icon="pi pi-plus"
              onClick={() => router.visit(route('roles.create'))}
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none' }}
            />
          )}
        </div>
      </div>

      {/* barre de recherche */}
      <form onSubmit={handleSearch}>
        <div className="p-inputgroup">
          <span className="p-inputgroup-addon">
            <i className="pi pi-search"></i>
          </span>
          <InputText
            placeholder="Rechercher par nom ou permission..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ height: '48px' }}
          />
          <Button
            type="submit"
            label="Rechercher"
            icon="pi pi-search"
            loading={processing}
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', minWidth: '140px' }}
          />
          {query && (
            <Button
              icon="pi pi-times"
              outlined
              onClick={() => {
                setQuery('');
                router.get(route('roles.index'), {}, { preserveState: true, preserveScroll: true });
              }}
              style={{ borderColor: '#6b7280', color: '#374151' }}
            />
          )}
        </div>
      </form>
    </div>
  );

  return (
    <Layout>
      <Head title="Gestion des rôles" />
      <div className="grid">
        <div className="col-12">
          <Card className="shadow-2">
            <DataTable
              value={roles}
              header={tableHeader}
              lazy
              paginator
              first={(currentPage - 1) * perPage}
              rows={perPage}
              totalRecords={total}
              onPage={(e) => {
                const page = (e.first / e.rows) + 1;
                router.get(route('roles.index'), { search: query, page }, { preserveState: true, preserveScroll: true });
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              onRowsPerPageChange={(e) => {
                router.get(route('roles.index'), { search: query, per_page: e.value }, { preserveState: true, preserveScroll: true });
              }}
              emptyMessage={
                <div className="text-center py-6">
                  <i className="pi pi-shield text-400 mb-3" style={{ fontSize: '3rem' }}></i>
                  <h3 className="text-900 text-xl font-medium mb-2">Aucun rôle trouvé</h3>
                  <p className="text-600 mb-4">
                    {query ? 'Essayez de modifier votre recherche' : 'Commencez par créer votre premier rôle'}
                  </p>
                  {!query && canadd && (
                    <Button
                      label="Créer un rôle"
                      icon="pi pi-plus"
                      onClick={() => router.visit(route('roles.create'))}
                      style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none' }}
                    />
                  )}
                </div>
              }
              stripedRows
              responsiveLayout="scroll"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} rôles"
              onRowClick={(e) => {
                if (e.data && e.data.id && canupdate) {
                  router.visit(route('roles.edit', e.data.id));
                }
              }}
              rowClassName={(data) => data.id ? 'cursor-pointer hover:bg-gray-50' : ''}
              selectionMode="single"
              dataKey="id"
            >
              <Column
                field="name"
                header="Nom du rôle"
                body={nameTemplate}
                sortable
                style={{ minWidth: '220px' }}
              />

              <Column
                header="Permissions"
                body={permissionsBodyTemplate}
                style={{ minWidth: '300px' }}
              />

              <Column
                header="Nombre"
                body={permissionsCountTemplate}
                sortable
                sortField="permissions.length"
                style={{ minWidth: '120px', textAlign: 'center' }}
              />

              <Column
                field="created_at"
                header="Créé le"
                body={createdAtTemplate}
                sortable
                style={{ minWidth: '160px' }}
              />

              <Column
                header="Actions"
                body={actionsTemplate}
                style={{ minWidth: '140px', textAlign: 'center' }}
              />
            </DataTable>
          </Card>
        </div>
      </div>

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

export default RolesIndex;
