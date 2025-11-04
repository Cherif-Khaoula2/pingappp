import React, { useState } from 'react';
import axios from 'axios';

const FindAdUser = () => {
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

   const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
        // Changer l'URL pour la route Laravel existante
        const response = await axios.post('/ad/computers/find', { search });
        if (response.data.success) {
            setUsers(response.data.users);
        } else {
            setError(response.data.message || 'Erreur inconnue');
            setUsers([]);
        }
    } catch (err) {
        setError('Erreur serveur');
        setUsers([]);
    } finally {
        setLoading(false);
    }
};

    return (
        <div>
            <h2>Recherche Active Directory</h2>
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nom, email ou samaccountname"
            />
            <button onClick={handleSearch} disabled={loading}>
                {loading ? 'Recherche...' : 'Rechercher'}
            </button>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {users.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>SamAccountName</th>
                            <th>Email</th>
                            <th>Activé</th>
                            <th>Dernière connexion</th>
                            <th>Local</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={index}>
                                <td>{user.name}</td>
                                <td>{user.sam}</td>
                                <td>{user.email}</td>
                                <td>{user.enabled ? 'Oui' : 'Non'}</td>
                                <td>{user.last_logon || 'N/A'}</td>
                                <td>{user.is_local ? 'Oui' : 'Non'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default FindAdUser;