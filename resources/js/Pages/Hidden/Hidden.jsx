import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { router } from "@inertiajs/react";
import Layout from "@/Layouts/layout/layout.jsx";

export default function Hidden({ hiddenAccounts }) {

    const handleDelete = (id) => {
        if (confirm("Voulez-vous vraiment supprimer ce compte masqué ?")) {
            router.delete(route("hidden.destroy", id));
        }
    };

    const goToLdapUsers = () => {
        router.get(route("hidden.index")); // 🔹 redirige vers la page LDAP (Hidden/Index.jsx)
    };

    return (
        <Layout>
            <div className="card">
                <div className="flex justify-content-between align-items-center mb-4">
                    <h3>🕵️ Liste des comptes masqués</h3>

                    <Button
                        label="Utilisateurs LDAP"
                        icon="pi pi-users"
                        severity="secondary"
                        onClick={goToLdapUsers}
                        rounded
                    />
                </div>

                <DataTable
                    value={hiddenAccounts}
                    paginator
                    rows={10}
                    stripedRows
                    emptyMessage="Aucun compte masqué trouvé."
                >
                    <Column field="id" header="ID" sortable />
                    <Column field="samaccountname" header="SamAccountName" sortable />
                    <Column
                        field="created_at"
                        header="Date d’ajout"
                        sortable
                        body={(row) => new Date(row.created_at).toLocaleString()}
                    />

                    <Column
                        header="Actions"
                        body={(rowData) => (
                            <div className="flex gap-2 justify-content-center">
                                <Button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    rounded
                                    tooltip="Supprimer"
                                    onClick={() => handleDelete(rowData.id)}
                                />
                            </div>
                        )}
                    />
                </DataTable>
            </div>
        </Layout>
    );
}
