import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Layout from "@/Layouts/layout/layout.jsx";

export default function HiddenIndex({ users, search }) {
  const [searchTerm, setSearchTerm] = useState(search || "");

  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route("hidden.index"), { search: searchTerm });
  };

  const handleHide = (user) => {
    router.post(route("hidden.store"), { samaccountname: user.username });
  };

  return (
    <Layout>
      <Card title="Gestion des Comptes Active Directory">
        <form onSubmit={handleSearch} className="flex gap-2 mb-3">
          <InputText
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un utilisateur LDAP..."
          />
          <Button label="Rechercher" type="submit" />
        </form>

        <DataTable value={users} paginator rows={10} responsiveLayout="scroll">
          <Column field="name" header="Nom complet" />
          <Column field="email" header="Email" />
          <Column field="username" header="Identifiant AD" />
          <Column
            header="Action"
            body={(rowData) =>
              rowData.is_hidden ? (
                <Button label="Déjà masqué" disabled />
              ) : (
                <Button
                  label="Masquer"
                  icon="pi pi-eye-slash"
                  severity="warning"
                  onClick={() => handleHide(rowData)}
                />
              )
            }
          />
        </DataTable>
      </Card>
    </Layout>
  );
}
