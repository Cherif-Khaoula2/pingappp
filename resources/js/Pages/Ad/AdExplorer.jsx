import { useState, useEffect } from "react";
import axios from "axios";

export default function AdExplorer() {
  const [ouTree, setOuTree] = useState([]);
  const [selectedOu, setSelectedOu] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Charger les OU à l'ouverture
  useEffect(() => {
    axios.get("/api/ad/ous")
      .then((res) => {
        const tree = buildOuTree(res.data.data);
        setOuTree(tree);
      })
      .catch(() => setError("Erreur lors du chargement des OU"));
  }, []);

  // 🔹 Charger les utilisateurs d'une OU
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

  // 🔹 Affichage récursif des OU (arborescence)
  const renderTree = (nodes, level = 0) => {
    return (
      <ul className={`${level === 0 ? '' : 'ml-4'} border-l border-gray-200`}>
        {nodes.map((node) => (
          <li key={node.DistinguishedName} className="my-1">
            <div
              onClick={() => handleOuClick(node.DistinguishedName)}
              className={`cursor-pointer p-1 rounded hover:bg-gray-100 ${
                selectedOu === node.DistinguishedName ? 'bg-blue-100 font-semibold' : ''
              }`}
            >
              {node.Name}
            </div>
            {node.children && node.children.length > 0 && renderTree(node.children, level + 1)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="p-6 grid grid-cols-2 gap-6">
      {/* Liste des OU */}
      <div>
        <h2 className="text-xl font-bold mb-3">Unités Organisationnelles (OU)</h2>
        <div className="border rounded p-3 max-h-[600px] overflow-y-auto bg-white">
          {ouTree.length > 0 ? renderTree(ouTree) : <p>Chargement...</p>}
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div>
        <h2 className="text-xl font-bold mb-3">Utilisateurs</h2>
        {loading ? (
          <p>Chargement...</p>
        ) : users.length > 0 ? (
          <ul className="border rounded p-3 max-h-[600px] overflow-y-auto">
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

// 🧩 Fonction pour construire la hiérarchie des OU
function buildOuTree(ous) {
  const map = {};
  const roots = [];

  ous.forEach((ou) => {
    map[ou.DistinguishedName] = { ...ou, children: [] };
  });

  ous.forEach((ou) => {
    const parentDn = ou.DistinguishedName.split(',').slice(1).join(',');
    const parent = ous.find((o) => o.DistinguishedName === parentDn);
    if (parent && map[parentDn]) {
      map[parentDn].children.push(map[ou.DistinguishedName]);
    } else if (!parentDn.includes('OU=')) {
      roots.push(map[ou.DistinguishedName]);
    }
  });

  return roots;
}
