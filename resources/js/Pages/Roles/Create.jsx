import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import LoadingButton from '@/Components/LoadingButton.jsx';
import TextInput from '@/Components/TextInput.jsx';
import FieldGroup from '@/Components/FieldGroup.jsx';
import Layout from "@/Layouts/layout/layout.jsx";
const Create = () => {
  const { permissions } = usePage().props;

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    permissions: []
  });
  
  const [showCreateModal, setShowCreateModal] = useState(false);

  function togglePermission(name) {
    const current = data.permissions || [];
    setData(
      'permissions',
      current.includes(name)
        ? current.filter(n => n !== name)
        : [...current, name]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    setShowCreateModal(true);
  }

  const confirmCreate = () => {
    post(route('roles.store'));
    setShowCreateModal(false);
  };

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">
        <Link
          href={route('roles.index')}
          className="text-indigo-600 hover:text-indigo-700"
        >
          Rôles
        </Link>
        <span className="font-medium text-indigo-600"> /</span> Créer
      </h1>

      <div className="max-w-8xl overflow-hidden bg-white rounded shadow">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 p-8 lg:grid-cols-1">
            {/* Role Name */}
            <FieldGroup label="Nom du rôle" name="name" error={errors.name}>
              <TextInput
                name="name"
                error={errors.name}
                value={data.name}
                onChange={e => setData('name', e.target.value)}
                placeholder="Ex: Administrateur, Gestionnaire..."
              />
            </FieldGroup>

            {/* Permissions */}
            <FieldGroup label="Permissions" name="permissions" error={errors.permissions}>
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-md ${
                  errors.permissions ? 'border-red-500' : 'border-gray-300'
                } bg-gray-50`}
              >
                {permissions.map((p) => (
                  <label
                    key={p.value}
                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded shadow-sm hover:border-indigo-500 transition cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={data.permissions.includes(p.value)}
                      onChange={() => togglePermission(p.value)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-800">{p.label}</span>
                  </label>
                ))}
                {permissions.length === 0 && (
                  <p className="text-sm text-gray-500 italic col-span-full">
                    Aucune permission disponible
                  </p>
                )}
              </div>

              {errors.permissions && (
                <div className="mt-2 text-sm text-red-600">{errors.permissions}</div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {data.permissions.length > 0 ? (
                    <span className="font-medium text-indigo-600">
                      {data.permissions.length} permission(s) sélectionnée(s)
                    </span>
                  ) : (
                    'Sélectionnez les permissions pour ce rôle.'
                  )}
                </p>
                {data.permissions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setData('permissions', [])}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Tout désélectionner
                  </button>
                )}
              </div>
            </FieldGroup>
          </div>

          <div className="flex items-center justify-end px-8 py-4 bg-gray-100 border-t border-gray-200">
            <LoadingButton loading={processing} type="submit" className="btn-indigo">
              Créer le rôle
            </LoadingButton>
          </div>
        </form>
      </div>

      {/* Modal de confirmation de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-[450px] transform transition-all">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Confirmer la création
              </h3>
              <p className="text-gray-600 text-center mb-2">
                Êtes-vous sûr de vouloir créer ce rôle ?
              </p>
              {data.name && (
                <p className="text-sm text-gray-500 mb-4">
                  <span className="font-semibold">Rôle :</span> {data.name}
                  <br />
                  <span className="font-semibold">Permissions :</span> {data.permissions.length}
                </p>
              )}

              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={confirmCreate}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Create.layout = (page) => (
  <Layout title="Créer un role" children={page} />
);

export default Create;