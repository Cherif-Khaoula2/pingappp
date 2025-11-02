import { useState, useRef } from 'react';
import { router, useForm } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { Button } from "primereact/button";
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dropdown } from 'primereact/dropdown';

export default function Index({ employees }) {
    const [visible, setVisible] = useState(false);
    const toast = useRef(null);
    const [showfirst_name, setShowfirst_name] = useState(false);

    const directions = [
        { label: 'Test', value: 'OU=TempUsers,DC=sarpi-dz,DC=sg' },
    ];

    const { data, setData, post, reset, errors } = useForm({
        first_name: '',
        last_name: '',
        last_name: '',
        email: '',
        first_name: '',
        department: null,
        isAdOnly: true
    });

    const handleSamAccountChange = (e) => {
        const value = e.target.value.slice(0, 26);
        setData('last_name', value);
    };

    const handleTypeChange = (e) => {
        setData('isAdOnly', e.target.checked);
    };

    const updateStatus = (id, status) => {
        router.patch(`/employees/${id}/status`, { status }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Statut mis à jour',
                    detail: `Employé ${status === 'approved' ? 'approuvé' : 'rejeté'}`,
                    life: 3000
                });
            }
        });
    };

    const deleteEmployee = (employee) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer "${employee.first_name} ${employee.last_name}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Supprimer',
            rejectLabel: 'Annuler',
            acceptClassName: 'p-button-danger',
            accept: () => {
                router.delete(`/employees/${employee.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Supprimé',
                            detail: 'Employé supprimé avec succès',
                            life: 3000
                        });
                    }
                });
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/employees', {
            onSuccess: () => {
                reset();
                setVisible(false);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Employé ajouté avec succès',
                    life: 3000
                });
            },
            onError: () => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Veuillez vérifier les champs',
                    life: 3000
                });
            }
        });
    };

    const statusBodyTemplate = (rowData) => {
        const statusConfig = {
            pending: { label: 'En attente', severity: 'warning' },
            approved: { label: 'Approuvé', severity: 'success' },
            rejected: { label: 'Rejeté', severity: 'danger' }
        };
        const config = statusConfig[rowData.status] || statusConfig.pending;
        return <Tag value={config.label} severity={config.severity} />;
    };

    const actionsBodyTemplate = (rowData) => (
        <div className="flex gap-2">
            {rowData.status === 'pending' && (
                <>
                    <Button icon="pi pi-check" rounded text severity="success" tooltip="Valider"
                        onClick={() => updateStatus(rowData.id, 'approved')} />
                    <Button icon="pi pi-times" rounded text severity="danger" tooltip="Rejeter"
                        onClick={() => updateStatus(rowData.id, 'rejected')} />
                </>
            )}
            <Button icon="pi pi-trash" rounded text severity="danger" tooltip="Supprimer"
                onClick={() => deleteEmployee(rowData)} />
        </div>
    );

    const nameBodyTemplate = (rowData) => `${rowData.first_name} ${rowData.last_name}`;
    const first_nameBodyTemplate = (rowData) => <span>{rowData.first_name}</span>;

    return (
        <Layout>
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        <div className="flex justify-content-between align-items-center mb-4">
                            <h5 className="m-0">Liste des Employés</h5>
                            <Button label="Ajouter un Employé" onClick={() => setVisible(true)} className="p-button-success" />
                        </div>

                        <DataTable value={employees} paginator rows={10} rowsPerPageOptions={[5,10,25,50]}
                            tableStyle={{ minWidth: '50rem' }}
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} employés"
                            emptyMessage="Aucun employé trouvé">
                            <Column header="Nom Complet" body={nameBodyTemplate} sortable style={{ width: '25%' }} />
                            <Column field="email" header="Email" sortable style={{ width: '25%' }} />
                            <Column field="department" header="Direction" sortable style={{ width: '20%' }} />
                            <Column field="first_name" header="Mot de passe" body={first_nameBodyTemplate} sortable style={{ width: '15%' }} />
                            <Column field="status" header="Statut" body={statusBodyTemplate} sortable style={{ width: '15%' }} />
                            <Column header="Actions" body={actionsBodyTemplate} style={{ width: '15%' }} />
                        </DataTable>
                    </div>
                </div>
            </div>

            {/* Dialog Ajouter un employé */}
            <Dialog header="Ajouter un nouvel employé" visible={visible} style={{ width: '50vw' }}
                onHide={() => setVisible(false)} breakpoints={{ '960px': '75vw', '641px': '90vw' }}>
                <form onSubmit={handleSubmit} className="p-fluid">
                    <div className="grid">

                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="last_name" className="font-medium">
                                    last_name <span className="text-red-500">*</span>
                                </label>
                                <InputText id="last_name" value={data.last_name} onChange={handleSamAccountChange}
                                    className={errors.last_name ? 'p-invalid' : ''} />
                                <small>Max 26 caractères</small>
                                {errors.last_name && <small className="p-error">{errors.last_name}</small>}
                            </div>
                        </div>

                        

                        <div className="col-12 md:col-6">
                            <div className="field-checkbox">
                                <label className="flex align-items-center gap-2">
                                    <input type="checkbox" checked={data.isAdOnly} onChange={handleTypeChange} />
                                    Compte AD seulement
                                </label>
                            </div>
                        </div>

                        {!data.isAdOnly && (
                            <div className="col-12 md:col-6">
                                <div className="field">
                                    <label htmlFor="email" className="font-medium">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <InputText id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                                        className={errors.email ? 'p-invalid' : ''} />
                                    {errors.email && <small className="p-error">{errors.email}</small>}
                                </div>
                            </div>
                        )}

                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="first_name" className="font-medium">
                                    Mot de passe <span className="text-red-500">*</span>
                                </label>
                                <div className="p-inputgroup">
                                    <InputText id="first_name" type={showfirst_name ? 'text' : 'first_name'} value={data.first_name}
                                        onChange={e => setData('first_name', e.target.value)} className={errors.first_name ? 'p-invalid' : ''} />
                                    <button type="button" className="p-button p-button-text" onClick={() => setShowfirst_name(!showfirst_name)}>
                                        <i className={showfirst_name ? "pi pi-eye-slash" : "pi pi-eye"}></i>
                                    </button>
                                </div>
                                {errors.first_name && <small className="p-error">{errors.first_name}</small>}
                            </div>
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="department" className="font-medium">
                                    Direction <span className="text-red-500">*</span>
                                </label>
                                <Dropdown id="department" value={data.department} options={directions} onChange={e => setData('department', e.value)}
                                    placeholder="Sélectionner" className={errors.department ? 'p-invalid' : ''} />
                                {errors.department && <small className="p-error">{errors.department}</small>}
                            </div>
                        </div>

                        <div className="col-12">
                            <div className="flex justify-content-end gap-2 mt-3">
                                <Button label="Annuler" onClick={() => setVisible(false)} className="p-button-text" type="button" />
                                <Button label="Enregistrer" type="submit" className="p-button-success" />
                            </div>
                        </div>

                    </div>
                </form>
            </Dialog>
        </Layout>
    );
}
