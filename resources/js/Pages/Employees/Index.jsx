import { useState, useRef } from 'react';
import { router, useForm } from '@inertiajs/react';
import Layout from "@/Layouts/layout/layout.jsx";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

export default function Index({ employees }) {
  const [visible, setVisible] = useState(false);
  const toast = useRef(null);

  const { data, setData, post, reset, errors } = useForm({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    department: ''
  });

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
const passwordBodyTemplate = (rowData) => {
    return (
        <span>{rowData.password}</span>
    );
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

  // Templates
  const statusBodyTemplate = (rowData) => {
    const statusConfig = {
      pending: { label: 'En attente', severity: 'warning' },
      approved: { label: 'Approuvé', severity: 'success' },
      rejected: { label: 'Rejeté', severity: 'danger' }
    };
    const config = statusConfig[rowData.status] || statusConfig.pending;
    return <Tag value={config.label} severity={config.severity} />;
  };

  const actionsBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        {rowData.status === 'pending' && (
          <>
            <Button
              icon="pi pi-check"
              rounded
              text
              severity="success"
              tooltip="Valider"
              tooltipOptions={{ position: 'top' }}
              onClick={() => updateStatus(rowData.id, 'approved')}
            />
            <Button
              icon="pi pi-times"
              rounded
              text
              severity="danger"
              tooltip="Rejeter"
              tooltipOptions={{ position: 'top' }}
              onClick={() => updateStatus(rowData.id, 'rejected')}
            />
          </>
        )}
        <Button
          icon="pi pi-trash"
          rounded
          text
          severity="danger"
          tooltip="Supprimer"
          tooltipOptions={{ position: 'top' }}
          onClick={() => deleteEmployee(rowData)}
        />
      </div>
    );
  };
  const [showPassword, setShowPassword] = useState(false);

  const nameBodyTemplate = (rowData) => {
    return `${rowData.first_name} ${rowData.last_name}`;
  };



  return (
    <Layout>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="grid">


        


        {/* Table des employés */}
        <div className="col-12">
          <div className="card">
            <div className="flex justify-content-between align-items-center mb-4">
              <h5 className="m-0">Liste des Employés</h5>
              <Button
                label="Ajouter un Employé"
                onClick={() => setVisible(true)}
                className="p-button-success"
              />
            </div>

            <DataTable
              value={employees}
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
              tableStyle={{ minWidth: '50rem' }}
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} employés"
              emptyMessage="Aucun employé trouvé"
            >
              <Column
                header="Nom Complet"
                body={nameBodyTemplate}
                sortable
                style={{ width: '25%' }}
              ></Column>
              <Column
                field="email"
                header="Email"
                sortable
                style={{ width: '25%' }}
              ></Column>
              <Column
                field="department"
                header="Direction"
                sortable
                style={{ width: '20%' }}
              ></Column>
              <Column
    field="password"
    header="Mot de passe"
    body={passwordBodyTemplate} // <- correct
    sortable
    style={{ width: '15%' }}
></Column>

              <Column
                field="status"
                header="Statut"
                body={statusBodyTemplate}
                sortable
                style={{ width: '15%' }}
              ></Column>
              <Column
                header="Actions"
                body={actionsBodyTemplate}
                style={{ width: '15%' }}
              ></Column>
            </DataTable>
          </div>
        </div>
      </div>

      {/* Dialog Ajouter un employé */}
      <Dialog
        header="Ajouter un nouvel employé"
        visible={visible}
        style={{ width: '50vw' }}
        onHide={() => setVisible(false)}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
      >
        <form onSubmit={handleSubmit} className="p-fluid">
          <div className="grid">
            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="first_name" className="font-medium">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <InputText
                  id="first_name"
                  value={data.first_name}
                  onChange={e => setData('first_name', e.target.value)}
                  className={errors.first_name ? 'p-invalid' : ''}
                />
                {errors.first_name && <small className="p-error">{errors.first_name}</small>}
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="last_name" className="font-medium">
                  Nom <span className="text-red-500">*</span>
                </label>
                <InputText
                  id="last_name"
                  value={data.last_name}
                  onChange={e => setData('last_name', e.target.value)}
                  className={errors.last_name ? 'p-invalid' : ''}
                />
                {errors.last_name && <small className="p-error">{errors.last_name}</small>}
              </div>
            </div>

            <div className="col-12">
              <div className="field">
                <label htmlFor="email" className="font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <InputText
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={e => setData('email', e.target.value)}
                  className={errors.email ? 'p-invalid' : ''}
                />
                {errors.email && <small className="p-error">{errors.email}</small>}
              </div>
            </div>
            <div className="col-12 md:col-6">

           <div className="field">
                <label htmlFor="password" className="font-medium">
                    Mot de passe <span className="text-red-500">*</span>
                </label>
                <div className="p-inputgroup">
                    <InputText
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={data.password}
                        onChange={e => setData('password', e.target.value)}
                        className={errors.password ? 'p-invalid' : ''}
                    />
                    <button
                        type="button"
                        className="p-button p-button-text"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        <i className={showPassword ? "pi pi-eye-slash" : "pi pi-eye"}></i>
                    </button>
                </div>
                {errors.password && <small className="p-error">{errors.password}</small>}
            </div>
            </div>
            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="department" className="font-medium">
                  Direction <span className="text-red-500">*</span>
                </label>
                <InputText
                  id="department"
                  value={data.department}
                  onChange={e => setData('department', e.target.value)}
                  className={errors.department ? 'p-invalid' : ''}
                />
                {errors.department && <small className="p-error">{errors.department}</small>}
              </div>
            </div>

            <div className="col-12">
              <div className="flex justify-content-end gap-2 mt-3">
                <Button
                  label="Annuler"
                  onClick={() => setVisible(false)}
                  className="p-button-text"
                  type="button"
                />
                <Button
                  label="Enregistrer"
                  type="submit"
                  className="p-button-success"
                />
              </div>
            </div>
          </div>
        </form>
      </Dialog>
    </Layout>
  );
}