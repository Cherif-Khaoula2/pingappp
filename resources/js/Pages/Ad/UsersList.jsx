import React, { useState, useEffect } from 'react';
import axios from 'axios';


export default function UsersList(props) {
  const [page, setPage] = useState(props.meta?.page || 1);
  const [perPage, setPerPage] = useState(props.meta?.per_page || 50);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // si tu préfères fetch côté client :
    fetchUsers();
  }, [page, perPage]);

  function fetchUsers() {
    axios.get('/ad/users', { params: { page, per_page: perPage, search } })
      .then(r => {
        // si route renvoie Inertia render, tu peux utiliser Inertia.visit au lieu de axios
        // ici on reload la page Inertia:
        Inertia.reload();
      })
      .catch(err => {
        console.error(err);
        alert('Erreur lors de la récupération des utilisateurs AD');
      });
  }

  // Si tu utilises props.users fournis par Inertia initialement:
  const users = props.users || [];

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-3">Utilisateurs Active Directory</h1>

      <div className="mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom..." />
        <button onClick={() => { setPage(1); fetchUsers(); }}>Rechercher</button>
      </div>

      <table className="min-w-full">
        <thead>
          <tr>
            <th>Nom</th>
            <th>SamAccountName</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i}>
              <td>{u.name}</td>
              <td>{u.sam}</td>
              <td>{u.email}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4">
        <button onClick={() => setPage(Math.max(1, page - 1))}>Préc</button>
        <span> {page} </span>
        <button onClick={() => setPage(page + 1)}>Suiv</button>
      </div>
    </div>
  );
}
