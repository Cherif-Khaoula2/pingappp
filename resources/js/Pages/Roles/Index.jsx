import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import Pagination from '@/Components/Pagination.jsx';
import Table from '@/Components/Table.jsx';
import { Trash2, Shield } from 'lucide-react';

const Index = () => {
  const { roles } = usePage().props;
  const pageProps = usePage().props;
  const { permissions = [] } = pageProps;
  const canadd = permissions.includes("addrole");

  // Vérification de sécurité
  if (!roles || !roles.data) {
    return <div>Chargement...</div>;
  }

  const data = roles.data;
  const links = roles.meta?.links || [];

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Gestion des rôles</h1>
      <div className="flex items-center justify-end mb-6">
        {canadd && (
          <>
            <Link
              className="btn-indigo focus:outline-none"
              href={route('roles.create')}
            >
              <span>Créer</span>
              <span className="hidden md:inline"> un role </span>
            </Link>
          </>
        )}
      </div>
      <Table
        columns={[
          {
            label: 'Nom',
            name: 'name',
            renderCell: row => (
              <div className="flex items-center">
                <Shield size={16} className="mr-2 text-indigo-600" />
                <span>{row.name}</span>
                {row.deleted_at && (
                  <Trash2 size={16} className="ml-2 text-gray-400" />
                )}
              </div>
            )
          },
          {
            label: 'Permissions',
            name: 'permissions',
            renderCell: row => (
              <div className="flex flex-wrap gap-1">
                {row.permissions.length > 0 ? (
                  row.permissions.slice(0, 3).map(permission => (
                    <span
                      key={permission.id}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      {permission.name}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">Aucune permission</span>
                )}
                {row.permissions.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">
                    +{row.permissions.length - 3}
                  </span>
                )}
              </div>
            )
          }
        ]}
        rows={data}
        getRowDetailsUrl={row => route('roles.edit', row.id)}
      />
      {links.length > 0 && <Pagination links={links} />}
    </div>
  );
};

/**
 * Persistent Layout (Inertia.js)
 *
 * [Learn more](https://inertiajs.com/pages#persistent-layouts)
 */
Index.layout = (page) => (
  <Layout title="Roles" children={page} />
);

export default Index;