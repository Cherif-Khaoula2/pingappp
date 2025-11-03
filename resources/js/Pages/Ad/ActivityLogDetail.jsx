import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function ActivityLogDetail({ log }) {
    const getActionLabel = (action) => {
        const labels = {
            login: '🔑 Connexion',
            logout: '🚪 Déconnexion',
            block_user: '🔒 Blocage utilisateur',
            unblock_user: '🔓 Déblocage utilisateur',
            reset_password: '🔄 Réinitialisation mot de passe',
            create_user: '➕ Création utilisateur',
        };
        return labels[action] || action;
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Log #${log.id}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Bouton retour */}
                    <div className="mb-6">
                        <Link
                            href="/ad/activity-logs"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            ← Retour aux logs
                        </Link>
                    </div>

                    {/* En-tête */}
                    <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-3xl font-bold text-gray-900">
                                Détails du log #{log.id}
                            </h1>
                            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                                log.status === 'success'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {log.status === 'success' ? '✅ Réussi' : '❌ Échoué'}
                            </span>
                        </div>

                        {/* Informations principales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Action effectuée
                                    </label>
                                    <div className="text-lg font-semibold text-gray-900">
                                        {getActionLabel(log.action)}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Utilisateur ciblé
                                    </label>
                                    <div className="text-lg font-semibold text-gray-900">
                                        {log.target_user}
                                    </div>
                                    {log.target_user_name && (
                                        <div className="text-sm text-gray-600">
                                            {log.target_user_name}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Effectué par
                                    </label>
                                    <div className="text-lg font-semibold text-gray-900">
                                        {log.performed_by_name}
                                    </div>
                                    {log.performer && (
                                        <div className="text-sm text-gray-600">
                                            {log.performer.email}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Date et heure
                                    </label>
                                    <div className="text-lg font-semibold text-gray-900">
                                        {new Date(log.created_at).toLocaleString('fr-FR', {
                                            dateStyle: 'full',
                                            timeStyle: 'long'
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Adresse IP
                                    </label>
                                    <div className="text-lg font-semibold text-gray-900">
                                        {log.ip_address || 'Non disponible'}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        User Agent
                                    </label>
                                    <div className="text-sm text-gray-700 break-words">
                                        {log.user_agent || 'Non disponible'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Message d'erreur si échec */}
                    {log.status === 'failed' && log.error_message && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow mb-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium text-red-800 mb-2">
                                        Message d'erreur
                                    </h3>
                                    <p className="text-red-700">
                                        {log.error_message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Détails supplémentaires */}
                    {log.details && Object.keys(log.details).length > 0 && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                📋 Informations complémentaires
                            </h2>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                                    {JSON.stringify(log.details, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* Timeline visuelle */}
                    <div className="bg-white rounded-lg shadow p-6 mt-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            ⏱️ Timeline de l'action
                        </h2>
                        <div className="relative">
                            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                            
                            <div className="relative flex items-start mb-8">
                                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 font-bold text-lg z-10">
                                    1
                                </div>
                                <div className="ml-6">
                                    <div className="text-sm font-medium text-gray-900">
                                        Demande initiée
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Par {log.performed_by_name} depuis {log.ip_address}
                                    </div>
                                </div>
                            </div>

                            <div className="relative flex items-start mb-8">
                                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 font-bold text-lg z-10">
                                    2
                                </div>
                                <div className="ml-6">
                                    <div className="text-sm font-medium text-gray-900">
                                        Action: {getActionLabel(log.action)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Cible: {log.target_user} ({log.target_user_name})
                                    </div>
                                </div>
                            </div>

                            <div className="relative flex items-start">
                                <div className={`flex items-center justify-center w-16 h-16 rounded-full ${
                                    log.status === 'success' 
                                        ? 'bg-green-100 text-green-600' 
                                        : 'bg-red-100 text-red-600'
                                } font-bold text-lg z-10`}>
                                    3
                                </div>
                                <div className="ml-6">
                                    <div className={`text-sm font-medium ${
                                        log.status === 'success' 
                                            ? 'text-green-900' 
                                            : 'text-red-900'
                                    }`}>
                                        {log.status === 'success' ? 'Action réussie' : 'Action échouée'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(log.created_at).toLocaleTimeString('fr-FR')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}