import React, { useState } from 'react';

import axios from 'axios';


export default function IpConfigPage() {
  const [host, setHost] = useState('');
  const [user, setUser] = useState('');
  const [password, setPassword] = useState(''); // optionnel, pas recommandé
  const [loading, setLoading] = useState(false);
  const [ips, setIps] = useState([]);
  const [raw, setRaw] = useState('');
  const [error, setError] = useState(null);

  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

  const handleClick = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIps([]);
    setRaw('');

    try {
      const res = await axios.post('/ad/user/ipconfig', {
        host,
        user,
        password: password || null,
      }, {
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json',
        }
      });

      if (res.data.success) {
        setIps(res.data.ips || []);
        setRaw(res.data.raw || '');
      } else {
        setError(res.data.message || 'Erreur inconnue');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Exécuter ipconfig via SSH</h1>

      <form onSubmit={handleClick} className="space-y-3 max-w-lg">
        <div>
          <label>Hôte (IP ou nom)</label>
          <input value={host} onChange={e => setHost(e.target.value)} className="w-full border p-2" required />
        </div>

        <div>
          <label>Utilisateur SSH</label>
          <input value={user} onChange={e => setUser(e.target.value)} className="w-full border p-2" required />
        </div>

        <div>
          <label>Mot de passe (optionnel — déconseillé)</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border p-2" />
        </div>

        <div>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white">
            {loading ? 'Exécution...' : 'IP Config'}
          </button>
        </div>
      </form>

      <div className="mt-6">
        {error && <div className="text-red-600">Erreur : {error}</div>}

        {ips.length > 0 && (
          <div>
            <h2 className="font-semibold">Adresses IPv4 trouvées :</h2>
            <ul className="list-disc ml-6">
              {ips.map((ip, idx) => <li key={idx}>{ip}</li>)}
            </ul>
          </div>
        )}

        {raw && (
          <div className="mt-4">
            <h3 className="font-semibold">Sortie brute (ipconfig)</h3>
            <pre className="whitespace-pre-wrap bg-gray-100 p-3 rounded">{raw}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
