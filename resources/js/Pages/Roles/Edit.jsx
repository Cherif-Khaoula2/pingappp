import React, { useState } from 'react';
import { useForm, usePage, Link, useForm as useInertiaForm } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import LoadingButton from '@/Components/LoadingButton.jsx';
import FieldGroup from '@/Components/FieldGroup.jsx';
import TextInput from '@/Components/TextInput.jsx';

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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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

  // Ouvrir le modal de confirmation de modification
  function handleSubmitClick(e) {
    e.preventDefault();
    setShowEditModal(true);
  }

  // Confirmer la modification
  function confirmEdit() {
    setShowEditModal(false);
    post(route('roles.update', role.id));
  }

  // Ouvrir le modal de suppression
  function handleDeleteClick() {
    setShowDeleteModal(true);
  }

  // Confirmer la suppression
  function confirmDelete() {
    setIsDeleting(true);
    deleteForm.delete(route('roles.destroy', role.id), {
      onFinish: () => {
        setIsDeleting(false);
        setShowDeleteModal(false);
      }
    });
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">
        <Link
          href={route('roles.index')}
          className="text-indigo-600 hover:text-indigo-700"
        >
          Roles
        </Link>
        <span className="font-medium text-indigo-600"> /</span> 
        <span className="text-gray-900"> Modifier</span>
      </h1>

      <div className="max-w-8xl overflow-hidden bg-white rounded shadow">
        <form onSubmit={handleSubmitClick}>
          <div className="grid gap-8 p-8">
            <FieldGroup label="Nom du rôle" name="name" error={errors.name}>
              <TextInput
                name="name"
                error={errors.name}
                value={data.name}
                onChange={e => setData('name', e.target.value)}
                disabled={!canupdate}
              />
            </FieldGroup>

            <FieldGroup
              label="Permissions"
              name="permissions"
              error={errors.permissions}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border rounded-md border-gray-300 bg-gray-50">
                {permissions.map(p => (
                  <label 
                    key={p.value} 
                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded shadow-sm hover:border-indigo-500 transition"
                  >
                    <input
                      type="checkbox"
                      checked={data.permissions.includes(p.value)}
                      onChange={() => togglePermission(p.value)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      disabled={!canupdate}
                    />
                    <span className="text-sm font-medium text-gray-900">{p.label}</span>
                  </label>
                ))}
              </div>
              {errors.permissions && (
                <div className="mt-2 text-sm text-red-600">{errors.permissions}</div>
              )}
            </FieldGroup>
          </div>

          <div className="flex items-center justify-between px-8 py-4 bg-gray-100 border-t border-gray-200">
            {candelete && (
              <>
                {!role.deleted_at && (
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="text-red-600 font-semibold"
                  >
                    Supprimer le rôle
                  </button>
                )}
              </>
            )}
            {canupdate && (
              <>
                <LoadingButton
                  loading={processing}
                  type="submit"
                  className="btn-indigo ml-auto"
                >
                  Modifier le rôle
                </LoadingButton>
              </>
            )}
          </div>
        </form>
      </div>

      {/* Modal de confirmation de modification */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-[450px] transform transition-all">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                Confirmer la modification
              </h3>
              <p className="text-gray-900 text-center mb-6 font-medium">
                Êtes-vous sûr de vouloir modifier ce rôle ?<br />
                <span className="text-indigo-600 font-semibold"></span>
              </p>

              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={processing}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={confirmEdit}
                  disabled={processing}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Modification...
                    </>
                  ) : (
                    'Confirmer'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-[450px] transform transition-all">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                Confirmer la suppression
              </h3>
              <p className="text-gray-900 text-center mb-6 font-medium">
                Êtes-vous sûr de vouloir supprimer ce rôle ?<br />
                <span className="text-red-600 font-semibold"></span>
              </p>

              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Suppression...
                    </>
                  ) : (
                    'Supprimer '
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Edit.layout = (page) => (
  <Layout title="Edit Role" children={page} />
);

export default Edit;