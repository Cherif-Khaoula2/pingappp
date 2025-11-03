import React, { useState } from "react";
import axios from "axios";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Dialog } from "primereact/dialog";
import { Message } from "primereact/message";
import Layout from "@/Layouts/layout/layout.jsx";

const ManageAddUser = () => {
  const [form, setForm] = useState({
    name: "",
    sam: "",
    email: "",
    password: "",
    ou_path: "OU=OuTempUsers,DC=sarpi-dz,DC=sg",
  });

  const [accountType, setAccountType] = useState("AD");
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const accountOptions = [
    { label: "Compte Active Directory (AD)", value: "AD" },
    { label: "Compte AD + Exchange", value: "AD+Exchange" },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  const confirmCreate = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const payload = { ...form, accountType };
      const res = await axios.post("/ad/create-user", payload);
      setMessage(res.data.message || "Utilisateur créé avec succès !");
      setForm({
        name: "",
        sam: "",
        email: "",
        password: "",
        ou_path: "OU=OuTempUsers,DC=sarpi-dz,DC=sg",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création de l'utilisateur.");
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Annuler"
        icon="pi pi-times"
        outlined
        onClick={() => setShowConfirmDialog(false)}
        disabled={loading}
      />
      <Button
        label={loading ? "Création..." : "Créer"}
        icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
        severity="success"
        onClick={confirmCreate}
        loading={loading}
      />
    </div>
  );

  return (
    <Layout>
      <div className="grid">
        <div className="col-12">
          {/* Header */}
          <div className="flex align-items-center gap-3 mb-4">
            <i className="pi pi-user-plus text-primary text-3xl"></i>
            <div>
              <h1 className="text-900 text-3xl font-bold m-0">
                Créer un utilisateur AD / Exchange
              </h1>
              <p className="text-600 mt-1 m-0">
                Remplissez les informations nécessaires pour créer un compte Active Directory.
              </p>
            </div>
          </div>

          {/* Card */}
          <Card className="shadow-3">
            <form onSubmit={handleSubmit}>
              <div className="grid">

                {/* Type de compte */}
                <div className="col-12">
                  <div className="field">
                    <label className="block text-900 font-medium mb-2">
                      Type de compte <span className="text-red-500">*</span>
                    </label>
                    <Dropdown
                      value={accountType}
                      options={accountOptions}
                      onChange={(e) => setAccountType(e.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Section infos utilisateur */}
                <div className="col-12 mt-3">
                  <div className="flex align-items-center gap-2 mb-3">
                    <i className="pi pi-id-card text-primary text-2xl"></i>
                    <h2 className="text-900 text-xl font-semibold m-0">Informations utilisateur</h2>
                  </div>
                  <Divider />
                </div>

                <div className="col-12 md:col-6">
                  <div className="field">
                    <label htmlFor="name" className="block text-900 font-medium mb-2">
                      Nom complet <span className="text-red-500">*</span>
                    </label>
                    <InputText
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full"
                      required
                    />
                  </div>
                </div>

                <div className="col-12 md:col-6">
                  <div className="field">
                    <label htmlFor="sam" className="block text-900 font-medium mb-2">
                      Nom d'utilisateur (SamAccountName) <span className="text-red-500">*</span>
                    </label>
                    <InputText
                      id="sam"
                      name="sam"
                      value={form.sam}
                      onChange={handleChange}
                      className="w-full"
                      required
                    />
                  </div>
                </div>

                {accountType === "AD+Exchange" && (
                  <div className="col-12">
                    <div className="field">
                      <label htmlFor="email" className="block text-900 font-medium mb-2">
                        Adresse email <span className="text-red-500">*</span>
                      </label>
                      <InputText
                        id="email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Section Sécurité */}
                <div className="col-12 mt-3">
                  <div className="flex align-items-center gap-2 mb-3">
                    <i className="pi pi-lock text-primary text-2xl"></i>
                    <h2 className="text-900 text-xl font-semibold m-0">Sécurité</h2>
                  </div>
                  <Divider />
                </div>

                <div className="col-12 md:col-6">
                  <div className="field">
                    <label htmlFor="password" className="block text-900 font-medium mb-2">
                      Mot de passe <span className="text-red-500">*</span>
                    </label>
                    <Password
                      id="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full"
                      inputClassName="w-full"
                      promptLabel="Choisissez un mot de passe"
                      weakLabel="Faible"
                      mediumLabel="Moyen"
                      strongLabel="Fort"
                      required
                    />
                  </div>
                </div>

                <div className="col-12 md:col-6">
                  <div className="field">
                    <label htmlFor="ou_path" className="block text-900 font-medium mb-2">
                      Chemin OU <span className="text-red-500">*</span>
                    </label>
                    <InputText
                      id="ou_path"
                      name="ou_path"
                      value={form.ou_path}
                      onChange={handleChange}
                      className="w-full"
                      required
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="col-12 mt-4">
                  <Divider />
                  <div className="flex justify-content-end gap-2">
                    <Button
                      type="button"
                      label="Annuler"
                      icon="pi pi-times"
                      outlined
                      onClick={() =>
                        setForm({
                          name: "",
                          sam: "",
                          email: "",
                          password: "",
                          ou_path: "OU=OuTempUsers,DC=sarpi-dz,DC=sg",
                        })
                      }
                      disabled={loading}
                    />
                    <Button
                      type="submit"
                      label="Créer l'utilisateur"
                      icon="pi pi-user-plus"
                      loading={loading}
                      style={{
                        background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                        border: "none",
                      }}
                    />
                  </div>
                </div>
              </div>
            </form>

            {message && <Message severity="success" text={message} className="mt-3" />}
            {error && <Message severity="error" text={error} className="mt-3" />}
          </Card>
        </div>
      </div>

      {/* Dialog de confirmation */}
      <Dialog
        visible={showConfirmDialog}
        onHide={() => setShowConfirmDialog(false)}
        header={
          <div className="flex align-items-center gap-2">
            <i className="pi pi-check-circle text-green-600 text-2xl"></i>
            <span>Confirmer la création</span>
          </div>
        }
        footer={dialogFooter}
        style={{ width: "480px" }}
        modal
      >
        <div className="text-center py-3">
          <div
            className="inline-flex align-items-center justify-content-center bg-green-100 border-circle mb-4"
            style={{ width: "80px", height: "80px" }}
          >
            <i className="pi pi-user-plus text-5xl text-green-600"></i>
          </div>

          <h3 className="text-900 text-xl font-bold mb-2">
            Créer un utilisateur Active Directory
          </h3>

          <p className="text-600 mb-3">
            Êtes-vous sûr de vouloir créer ce compte ?
          </p>

          <div className="surface-100 border-round p-3 text-left">
            <div className="flex align-items-center gap-2 mb-2">
              <i className="pi pi-user text-600"></i>
              <span className="text-900 font-medium">{form.name}</span>
            </div>
            <div className="flex align-items-center gap-2 mb-2">
              <i className="pi pi-id-card text-600"></i>
              <span className="text-700">{form.sam}</span>
            </div>
            {accountType === "AD+Exchange" && (
              <div className="flex align-items-center gap-2 mb-2">
                <i className="pi pi-envelope text-600"></i>
                <span className="text-700">{form.email}</span>
              </div>
            )}
            <div className="flex align-items-center gap-2">
              <i className="pi pi-sitemap text-600"></i>
              <span className="text-700">{form.ou_path}</span>
            </div>
          </div>
        </div>
      </Dialog>
    </Layout>
  );
};

export default ManageAddUser;
