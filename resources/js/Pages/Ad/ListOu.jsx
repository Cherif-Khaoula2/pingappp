import { useState, useEffect } from "react";
import axios from "axios";

export default function AdExplorer() {
  const [ous, setOus] = useState([]);
  const [selectedOu, setSelectedOu] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("/api/ad/ous")
      .then((res) => setOus(res.data.data || []))
      .catch((err) => setError("Erreur lors du chargement des OU"));
  }, []);

  const handleOuClick = async (ouDn) => {
    setSelectedOu(ouDn);
    setUsers([]);
    setLoading(true);
    try {
      const res = await axios.post("/api/ad/users-by-ou", { ou_dn: ouDn });
      setUsers(res.data.data || []);
    } catch {
      setError("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 grid grid-cols-2 gap-6">
      <div>
        <h2 className="text-xl font-bold mb-3">Unités Organisationnelles (OU)</h2>
        <ul className="border rounded p-3 max-h-96 overflow-y-auto">
          {ous.map((ou, i) => (
            <li
              key={i}
              className={`p-2 cursor-pointer rounded ${selectedOu === ou.DistinguishedName ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => handleOuClick(ou.DistinguishedName)}
            >
              {ou.Name}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-3">Utilisateurs</h2>
        {loading ? (
          <p>Chargement...</p>
        ) : users.length ? (
          <ul className="border rounded p-3 max-h-96 overflow-y-auto">
            {users.map((u, i) => (
              <li key={i} className="border-b p-2">
                <span className="font-semibold">{u.Name}</span> — {u.SamAccountName}  
                {u.EmailAddress && <span className="text-gray-500"> ({u.EmailAddress})</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucun utilisateur trouvé.</p>
        )}
      </div>

      {error && <div className="col-span-2 text-red-600 mt-2">{error}</div>}
    </div>
  );
}
