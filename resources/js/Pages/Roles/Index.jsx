import { useState } from 'react';
import { router, usePage ,Head} from '@inertiajs/react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Chip } from 'primereact/chip';
import { Skeleton } from 'primereact/skeleton';
import Layout from '@/Layouts/layout/layout.jsx';
import 'primereact/resources/themes/lara-light-indigo/theme.css';  // Thème
import 'primereact/resources/primereact.min.css';                   // Core CSS
import 'primeicons/primeicons.css';                                 // Icônes
import 'primeflex/primeflex.css';  
const RolesIndex = () => {
  const { roles } = usePage().props;
  const pageProps = usePage().props;
  const { permissions = [] } = pageProps;
  
  const canadd = permissions.includes("addrole");
  const canupdate = permissions.includes("updaterole");
  const candelete = permissions.includes("deleterole");

  const [globalFilter, setGlobalFilter] = useState('');

  // Vérification de sécurité
  if (!roles || !roles.data) {
    return (
      <Layout>
        <div className="grid">
          <div className="col-12">
            <Card>
              <Skeleton height="3rem" className="mb-3" />
              <Skeleton height="10rem" />
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  const rolesData = roles.data || [];
  const currentPage = roles.meta?.current_page || 1;
  const perPage = roles.meta?.per_page || 10;

  // Header du tableau avec recherche
  const tableHeader = (
    <div className="flex flex-wrap align-items-center justify-content-between gap-3">
      <div className="flex align-items-center gap-2">
        <i className="pi pi-shield text-primary text-2xl"></i>
        <h2 className="text-900 text-xl font-semibold m-0">
          Rôles 
        </h2>
      </div>
      <div className="flex gap-2">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Rechercher un rôle..."
            className="w-full md:w-20rem"
          />
        </span>
        {canadd && (
          <Button
            label="Créer un rôle"
            icon="pi pi-plus"
            onClick={() => router.visit(route('roles.create'))}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              border: 'none'
            }}
          />
        )}
      </div>
    </div>
  );

  // Template pour le nom avec icône
  const nameBodyTemplate = (rowData) => {
    return (
      <div className="flex align-items-center gap-2">
        <i className="pi pi-shield text-primary"></i>
        <span className="font-semibold text-900">{rowData.name}</span>
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

  // Template pour les permissions
  const permissionsBodyTemplate = (rowData) => {
    if (!rowData.permissions || rowData.permissions.length === 0) {
      return (
        <div className="flex align-items-center gap-2 text-500">
          <i className="pi pi-info-circle"></i>
          <span className="text-sm">Aucune permission</span>
        </div>
      );
    }

    const displayedPermissions = rowData.permissions.slice(0, 3);
    const remainingCount = rowData.permissions.length - 3;

    return (
      <div className="flex flex-wrap gap-2">
        {displayedPermissions.map((permission) => (
          <Chip
            key={permission.id}
            label={permission.name}
            className="text-sm"
            style={{
              background: '#f3f4f6',
              color: '#374151'
            }}
          />
        ))}
        {remainingCount > 0 && (
          <Chip
            label={`+${remainingCount}`}
            className="text-sm"
            style={{
              background: '#e5e7eb',
              color: '#6b7280',
              fontWeight: '600'
            }}
          />
        )}
      </div>
    );
  };

  // Template pour le compteur de permissions
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

  // Template pour la date de création
  const createdAtTemplate = (rowData) => {
    if (!rowData.created_at) return '-';
    
    const date = new Date(rowData.created_at);
    return (
      <span className="text-600">
        {date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })}
      </span>
    );
  };

  // Template pour les actions
  const actionsBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        {canupdate && (
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

  // Gestionnaires d'événements
  const handleDelete = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
      router.delete(route('roles.destroy', id));
    }
  };

  const handleRestore = (id) => {
    if (confirm('Êtes-vous sûr de vouloir restaurer ce rôle ?')) {
      router.put(route('roles.restore', id));
    }
  };

  return (
    <Layout>
      <Head title="Gestion des roles" />
      <div className="grid">
        <div className="col-12">
          {/* Header de la page */}
          <div className="flex align-items-center justify-content-between mb-4">
            <div>
              <h1 className="text-900 text-3xl font-bold m-0">
                Gestion des rôles
              </h1>
              <p className="text-600 mt-1 m-0">
                Gérez les rôles et leurs permissions
              </p>
            </div>
          </div>

          {/* Tableau */}
          <Card className="shadow-3">
            <DataTable
              value={rolesData}
              header={tableHeader}
              globalFilter={globalFilter}
              emptyMessage={
                <div className="text-center py-6">
                  <i className="pi pi-shield text-400 mb-3" style={{ fontSize: '3rem' }}></i>
                  <h3 className="text-900 text-xl font-medium mb-2">
                    Aucun rôle trouvé
                  </h3>
                  <p className="text-600 mb-4">
                    {globalFilter 
                      ? 'Essayez de modifier votre recherche'
                      : 'Commencez par créer votre premier rôle'}
                  </p>
                  {!globalFilter && canadd && (
                    <Button
                      label="Créer un rôle"
                      icon="pi pi-plus"
                      onClick={() => router.visit(route('roles.create'))}
                      style={{
                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                        border: 'none'
                      }}
                    />
                  )}
                </div>
              }
              stripedRows
              showGridlines={false}
              responsiveLayout="scroll"
              onRowClick={(e) => {
                if (e.data?.id && canupdate) {
                  router.visit(route('roles.edit', e.data.id));
                }
              }}
              rowClassName={(data) => {
                return (data.id && canupdate) ? 'cursor-pointer hover:bg-gray-50' : '';
              }}
              selectionMode="single"
              dataKey="id"
            >
              <Column
                field="name"
                header="Nom du rôle"
                body={nameBodyTemplate}
                sortable
                style={{ minWidth: '200px' }}
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
                style={{ minWidth: '200px' }}
              />
              
              
          
            </DataTable>
          </Card>
        </div>
      </div>

      
    </Layout>
  );
};

export default RolesIndex;