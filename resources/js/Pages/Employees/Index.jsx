import { router } from '@inertiajs/react';

export default function Index({ employees }) {
  const updateStatus = (id, status) => {
    router.patch(`/employees/${id}/status`, { status });
  };

  const deleteEmployee = (id) => {
    if (confirm('Supprimer cette demande ?')) {
      router.delete(`/employees/${id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Liste des employés</h1>
      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">Nom</th>
            <th className="p-2">Email</th>
            <th className="p-2">Direction</th>
            <th className="p-2">Statut</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id} className="border-t">
              <td className="p-2">{emp.first_name} {emp.last_name}</td>
              <td className="p-2">{emp.email}</td>
              <td className="p-2">{emp.department}</td>
              <td className="p-2">{emp.status}</td>
              <td className="p-2 space-x-2">
                {emp.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => updateStatus(emp.id, 'approved')} 
                      className="bg-green-600 text-white px-2 py-1 rounded"
                    >
                      Valider
                    </button>
                    <button 
                      onClick={() => updateStatus(emp.id, 'rejected')} 
                      className="bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Rejeter
                    </button>
                  </>
                )}
                <button 
                  onClick={() => deleteEmployee(emp.id)} 
                  className="bg-gray-600 text-white px-2 py-1 rounded"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}