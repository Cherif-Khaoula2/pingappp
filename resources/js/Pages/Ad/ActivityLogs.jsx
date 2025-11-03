import { Head, router, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function ActivityLogs({ logs, stats, filters }) {
    // Récupération de auth depuis usePage()
    const { auth } = usePage().props;

    const [localFilters, setLocalFilters] = useState({
        action: filters.action || '',
        target_user: filters.target_user || '',
        status: filters.status || '',
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
    });

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        
        router.get('/ad/activity-logs', newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        setLocalFilters({
            action: '',
            target_user: '',
            status: '',
            start_date: '',
            end_date: '',
        });
        router.get('/ad/activity-logs');
    };

    const exportLogs = () => {
        window.location.href = `/ad/activity-logs-export?${new URLSearchParams(localFilters).toString()}`;
    };

    const getActionBadge = (action) => {
        const badges = {
            login: 'bg-blue-100 text-blue-800',
            logout: 'bg-gray-100 text-gray-800',
            block_user: 'bg-red-100 text-red-800',
            unblock_user: 'bg-green-100 text-green-800',
            reset_password: 'bg-yellow-100 text-yellow-800',
            create_user: 'bg-purple-100 text-purple-800',
        };
        return badges[action] || 'bg-gray-100 text-gray-800';
    };

    const getActionLabel = (action) => {
        const labels = {
            login: '🔑 Connexion',
            logout: '🚪 Déconnexion',
            block_user: '🔒 Blocage',
            unblock_user: '🔓 Déblocage',
            reset_password: '🔄 Reset MDP',
            create_user: '➕ Création',
        };
        return labels[action] || action;
    };

    const getStatusBadge = (status) => {
        return status === 'success'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800';
    };

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title="Logs d'activité AD" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* En-tête */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">
                            📊 Logs d'activité Active Directory
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Traçabilité complète des actions sur les utilisateurs AD
                        </p>
                    </div>

                    {/* Statistiques rapides */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-sm text-gray-600">Total aujourd'hui</div>
                            <div className="text-3xl font-bold text-gray-900">{stats?.total_today || 0}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-sm text-gray-600">Connexions réussies</div>
                            <div className="text-3xl font-bold text-green-600">{stats?.logins_today || 0}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-sm text-gray-600">Échecs</div>
                            <div className="text-3xl font-bold text-red-600">{stats?.failed_today || 0}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-sm text-gray-600">Blocages</div>
                            <div className="text-3xl font-bold text-orange-600">{stats?.blocks_today || 0}</div>
                        </div>
                    </div>

                    {/* Filtres */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">🔍 Filtres</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Action
                                </label>
                                <select
                                    value={localFilters.action}
                                    onChange={(e) => handleFilterChange('action', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">Toutes les actions</option>
                                    <option value="login">Connexion</option>
                                    <option value="logout">Déconnexion</option>
                                    <option value="block_user">Blocage</option>
                                    <option value="unblock_user">Déblocage</option>
                                    <option value="reset_password">Reset mot de passe</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Utilisateur ciblé
                                </label>
                                <input
                                    type="text"
                                    value={localFilters.target_user}
                                    onChange={(e) => handleFilterChange('target_user', e.target.value)}
                                    placeholder="Rechercher un utilisateur..."
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Statut
                                </label>
                                <select
                                    value={localFilters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">Tous les statuts</option>
                                    <option value="success">Réussi</option>
                                    <option value="failed">Échoué</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date début
                                </label>
                                <input
                                    type="date"
                                    value={localFilters.start_date}
                                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date fin
                                </label>
                                <input
                                    type="date"
                                    value={localFilters.end_date}
                                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex items-end gap-2">
                                <button
                                    onClick={resetFilters}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                                >
                                    Réinitialiser
                                </button>
                                <button
                                    onClick={exportLogs}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                                >
                                    📥 Exporter CSV
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table des logs */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date/Heure
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Utilisateur ciblé
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Effectué par
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        IP
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {logs?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                            Aucun log trouvé
                                        </td>
                                    </tr>
                                ) : (
                                    logs?.data?.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(log.created_at).toLocaleString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionBadge(log.action)}`}>
                                                    {getActionLabel(log.action)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {log.target_user}
                                                </div>
                                                {log.target_user_name && (
                                                    <div className="text-sm text-gray-500">
                                                        {log.target_user_name}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {log.performed_by_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.ip_address || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(log.status)}`}>
                                                    {log.status === 'success' ? '✅ Réussi' : '❌ Échoué'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Link
                                                    href={`/ad/activity-logs/${log.id}`}
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Détails →
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {logs?.last_page > 1 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    {logs.prev_page_url && (
                                        <Link
                                            href={logs.prev_page_url}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Précédent
                                        </Link>
                                    )}
                                    {logs.next_page_url && (
                                        <Link
                                            href={logs.next_page_url}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Suivant
                                        </Link>
                                    )}
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Affichage de <span className="font-medium">{logs.from}</span> à{' '}
                                            <span className="font-medium">{logs.to}</span> sur{' '}
                                            <span className="font-medium">{logs.total}</span> résultats
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            {logs.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        link.active
                                                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}