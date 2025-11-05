import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, X, Loader2, Server } from "lucide-react";

export default function FindAllComputersLaps() {
  const [computers, setComputers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  useEffect(() => {
    fetchComputers();
  }, []);

  const fetchComputers = async (filter = "") => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/ad/computers/laps/all?search=${encodeURIComponent(filter)}`);
      const data = await response.json();
      
      if (data.success) {
        setComputers(data.computers);
      } else {
        setError(data.message || "Erreur inconnue");
      }
    } catch (err) {
      setError(err.message || "Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchComputers(search);
  
  const handleClearSearch = () => {
    setSearch("");
    fetchComputers();
  };

  const filteredComputers = computers.filter(computer =>
    computer.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredComputers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedComputers = filteredComputers.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <Card className="max-w-7xl mx-auto shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Server className="w-6 h-6" />
            Tous les Ordinateurs LAPS
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Barre de recherche */}
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Rechercher par nom d'ordinateur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <button 
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Rechercher
            </button>
            {search && (
              <button 
                onClick={handleClearSearch}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Effacer
              </button>
            )}
          </div>

          {/* Barre de progression améliorée */}
          {loading && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-medium">Chargement des ordinateurs en cours...</span>
                </div>
                <span className="text-sm text-gray-500">Veuillez patienter</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 animate-progress"></div>
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Cette opération peut prendre jusqu'à 2 minutes selon la taille de votre Active Directory
              </p>
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800 font-medium">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Compteur de résultats */}
          {!loading && computers.length > 0 && (
            <div className="mb-4 text-sm text-gray-600">
              <strong>{filteredComputers.length}</strong> ordinateur(s) trouvé(s)
              {search && ` pour "${search}"`}
            </div>
          )}

          {/* Table */}
          {!loading && filteredComputers.length > 0 ? (
            <>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom de l'ordinateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mot de passe LAPS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedComputers.map((computer, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {computer.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            computer.enabled 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {computer.enabled ? "Activé" : "Désactivé"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-700">
                          {computer.laps_password || (
                            <span className="text-gray-400 italic">Non disponible</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} sur {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : !loading && (
            <div className="text-center py-12">
              <Server className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Aucun ordinateur trouvé
              </h3>
              <p className="text-gray-500">
                {search 
                  ? "Essayez de modifier votre recherche" 
                  : "Aucun ordinateur disponible dans l'Active Directory"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress {
          animation: progress 1.5s ease-in-out infinite;
          width: 50%;
        }
      `}</style>
    </div>
  );
}