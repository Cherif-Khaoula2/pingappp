import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import Layout from '@/Layouts/layout/layout.jsx';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

export default function AdOuUsersExplorer() {
    const { props } = usePage();
    const data = props.data || []; // liste combinée OU + users
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState(data);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredData(data);
        } else {
            const filtered = data.filter((item) => 
                item.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.SamAccountName && item.SamAccountName.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredData(filtered);
        }
    }, [searchTerm, data]);

    const handleOuClick = (ouDn) => {
        router.get(`/ad/ou-explorer/${encodeURIComponent(ouDn)}`);
    };

    const nameTemplate = (rowData) => {
        if(rowData.type === 'ou'){
            return (
                <Button
                    label={`📂 ${rowData.Name}`}
                    text
                    onClick={() => handleOuClick(rowData.DistinguishedName)}
                />
            );
        } else {
            return <div>👤 {rowData.Name} ({rowData.SamAccountName})</div>;
        }
    };

    const emailTemplate = (rowData) => {
        if(rowData.type === 'user'){
            return rowData.EmailAddress || <i>Pas d'email</i>;
        }
        return null;
    };

    return (
        <Layout>
            <Head title="Explorateur OU et Utilisateurs - AD" />
            <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
                <div className="grid">
                    <div className="col-12">
                        <Card className="shadow-3 border-round-xl">
                            <div className="p-inputgroup mb-4">
                                <span className="p-inputgroup-addon">
                                    <i className="pi pi-search"></i>
                                </span>
                                <InputText
                                    placeholder="Rechercher OU ou utilisateur..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <Button
                                        icon="pi pi-times"
                                        className="p-button-text"
                                        onClick={() => setSearchTerm('')}
                                    />
                                )}
                            </div>

                            {filteredData.length === 0 ? (
                                <Message
                                    severity="info"
                                    text="Aucun résultat trouvé"
                                    style={{ width: "100%" }}
                                />
                            ) : (
                                <DataTable
                                    value={filteredData}
                                    stripedRows
                                    responsiveLayout="scroll"
                                    className="custom-datatable"
                                >
                                    <Column
                                        field="Name"
                                        header="Nom"
                                        body={nameTemplate}
                                        style={{ minWidth: '250px' }}
                                    />
                                    <Column
                                        field="EmailAddress"
                                        header="Email"
                                        body={emailTemplate}
                                        style={{ minWidth: '250px' }}
                                    />
                                </DataTable>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
