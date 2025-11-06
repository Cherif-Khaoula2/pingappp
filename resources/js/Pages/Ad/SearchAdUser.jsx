import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import 'primereact/resources/themes/lara-light-indigo/theme.css';  // Thème
import 'primereact/resources/primereact.min.css';                   // Core CSS
import 'primeicons/primeicons.css';                                 // Icônes
import 'primeflex/primeflex.css';  
export default function SearchAdUser() {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setError('');
    setUserData(null);

    try {
      const response = await axios.post('/ad-user', { username });
      setUserData(response.data);
    } catch (err) {
      setError('Utilisateur introuvable ou erreur de connexion à l’AD.');
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <Head title="Recherche Active Directory" />

      <h1 className="text-2xl font-semibold mb-4">🔍 Rechercher un utilisateur AD</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="ex: khaoula.cherif"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Rechercher
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {userData && (
        <div className="mt-4 bg-gray-100 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Résultat :</h2>
          <p><b>Nom :</b> {userData.Name}</p>
          <p><b>Login :</b> {userData.SamAccountName}</p>
          <p><b>Email :</b> {userData.EmailAddress}</p>
        </div>
      )}
    </div>
  );
}
