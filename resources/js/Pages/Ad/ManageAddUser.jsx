import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Dialog } from "primereact/dialog";
import Layout from "@/Layouts/layout/layout.jsx";
import { Head } from '@inertiajs/react';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

const ManageAddUser = ({ directions: initialDirections = [] }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    name: "",
    sam: "",
    email: "",
    logmail: "",
    password: "",
    direction_id: "",
    mailbox: "",
  });

  const [directions, setDirections] = useState(initialDirections);
  const [selectedDirection, setSelectedDirection] = useState(null);
  const [accountType, setAccountType] = useState("AD");
  const [passwordMode, setPasswordMode] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [createdUserDetails, setCreatedUserDetails] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [mailboxes, setMailboxes] = useState([]);
  const [samError, setSamError] = useState("");

  const loadMailboxes = async () => {
    try {
      const response = await axios.get("/ad/mailboxes");
      if (response.data.success) {
        setMailboxes(response.data.mailboxes);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (accountType === "AD+Exchange") {
      loadMailboxes();
    }
  }, [accountType]);

  useEffect(() => {
    if (initialDirections.length === 0) {
      loadDirections();
    }
  }, []);

  const loadDirections = async () => {
    try {
      const response = await axios.get("/ad/directions");
      if (response.data.success) {
        setDirections(response.data.directions);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des directions:", err);
      showError("Erreur de chargement", "Impossible de charger les directions");
    }
  };

  const formatFirstName = (name) => {
    if (!name) return "";
    const cleaned = name.trim();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  };

  const formatLastName = (name) => {
    if (!name) return "";
    return name.trim().toUpperCase();
  };

  const generatePassword = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `S@rpi${randomDigits}`;
  };

  const checkUserExists = async (firstName, lastName) => {
    try {
      const response = await axios.post("/ad/check-user-exists", {
        firstName: formatFirstName(firstName),
        lastName: formatLastName(lastName)
      });
      return response.data.exists;
    } catch (err) {
      console.error("Erreur lors de la vérification:", err);
      return false;
    }
  };

  const handleDirectionChange = (e) => {
    const direction = directions.find(d => d.id === e.value);
    setSelectedDirection(direction);
    setForm((prev) => ({
      ...prev,
      direction_id: e.value
    }));
  };

  const handleAccountTypeChange = (type) => {
    setAccountType(type);
  };

  const handlePasswordModeChange = (mode) => {
    setPasswordMode(mode);
    if (mode === "auto") {
      const newPassword = generatePassword();
      setForm((prev) => ({
        ...prev,
        password: newPassword
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        password: ""
      }));
    }
  };

  const showError = (title, message) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setShowErrorDialog(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    if (name === "sam") {
      newValue = newValue.slice(0, 25);
      const regex = /^[A-Za-z0-9._-]*$/;
      if (!regex.test(newValue)) {
        setSamError("⚠️ Seules les lettres, chiffres , ' . ' , ' _ ' et ' - ' sont autorisés");
        return;
      } else {
        setSamError("");
      }
    }

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
      logmail: accountType === "AD"
        ? `${name === "sam" ? newValue : prev.sam}@sarpi-dz.sg`
        : accountType === "AD+Exchange" && name === "sam"
        ? `${newValue}@sarpi-dz.com`
        : prev.logmail,
      email: accountType === "AD+Exchange" && name === "sam" 
        ? `${newValue}@sarpi-dz.com` 
        : prev.email,
    }));
  };

  const handleNameChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const newForm = { ...prev };
      
      if (name === "firstName") {
        newForm.firstName = formatFirstName(value);
      } else if (name === "lastName") {
        newForm.lastName = formatLastName(value);
      }
      
      newForm.name = `${newForm.firstName} ${newForm.lastName}`.trim();
      return newForm;
    });
  };
useEffect(() => {
  // ✅ Débloque les clics sur mobile
  document.addEventListener('touchstart', () => {}, { passive: true });
}, []);

  useEffect(() => {
    if (passwordMode === "auto" && !form.password) {
      setForm((prev) => ({
        ...prev,
        password: generatePassword()
      }));
    }
  }, [passwordMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const exists = await checkUserExists(form.firstName, form.lastName);
    if (exists) {
      showError(
        "Utilisateur existant",
        `L'utilisateur ${form.firstName} ${form.lastName} existe déjà dans Active Directory !`
      );
      return;
    }
    
    setShowConfirmDialog(true);
  };

  const confirmCreate = async () => {
    setLoading(true);
    try {
      const selectedMailbox = mailboxes.find(m => m.id === form.mailbox);

      const payload = { 
        ...form, 
        accountType,
        mailbox: selectedMailbox ? selectedMailbox.name : null
      };

      const res = await axios.post("/ad/create-user", payload);

      setCreatedUserDetails({
        name: form.name,
        sam: form.sam,
        email: form.email,
        password: form.password,
        direction: selectedDirection?.nom || '',
        accountType: accountType,
        mailbox: selectedMailbox ? selectedMailbox.name : ''
      });

      setShowConfirmDialog(false);
      setShowSuccessDialog(true);

      setForm({
        firstName: "",
        lastName: "",
        name: "",
        sam: "",
        email: "",
        logmail: "",
        password: "",
        direction_id: "",
        mailbox: "",
      });
      setSelectedDirection(null);
      setPasswordMode("auto");
    } catch (err) {
      console.error("Erreur lors de la création :", err);

      const errorMsg = err.response?.data?.message || "Une erreur inconnue est survenue.";

      if (errorMsg.includes("SamAccountName")) {
        showError(
          "Utilisateur déjà existant",
          "Un utilisateur avec ce SamAccountName existe déjà dans Active Directory."
        );
      } else if (errorMsg.includes("mot de passe")) {
        showError(
          "Mot de passe invalide",
          "Le mot de passe doit contenir :\n• Une majuscule\n• Une minuscule\n• Un chiffre\n• Un caractère spécial (@$!%*?&)"
        );
      } else {
        showError("Erreur de création", errorMsg);
      }

      setShowConfirmDialog(false);
    } finally {
      setLoading(false);
    }
  };

  const dialogFooter = (
    <div className="flex justify-content-end gap-2 mt-3">
      <Button
        label="Annuler"
        outlined
        onClick={() => setShowConfirmDialog(false)}
        disabled={loading}
        className="p-button-sm md:p-button-md"
      />
      <Button
        label={loading ? "Création..." : "Créer"}
        icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
        severity="success"
        onClick={confirmCreate}
        loading={loading}
        className="p-button-sm md:p-button-md"
      />
    </div>
  );

  const successDialogFooter = (
    <div className="flex justify-content-center mt-3">
      <Button
        label="OK"
        onClick={() => setShowSuccessDialog(false)}
        className="p-button-sm md:p-button-md"
        style={{
          background: "linear-gradient(135deg, #10b981, #059669)",
          border: "none",
          minWidth: "120px"
        }}
      />
    </div>
  );

  const errorDialogFooter = (
    <div className="flex justify-content-center mt-3">
      <Button
        label="OK"
        onClick={() => setShowErrorDialog(false)}
        severity="danger"
        className="p-button-sm md:p-button-md"
        style={{ minWidth: "120px" }}
      />
    </div>
  );

  const directionOptions = directions.map(d => ({
    label: d.nom,
    value: d.id
  }));

  return (
    <Layout>
      <Head title="Créer un utilisateur AD" />
      
      <div className="grid">
        <div className="col-12">
          <div className="flex align-items-center gap-3 mb-3 md:mb-4">
            <div>
              <h1 className="text-900 text-xl md:text-3xl font-bold m-0">
                Créer un utilisateur AD / Exchange
              </h1>
              <p className="text-600 text-sm md:text-base mt-1 m-0">
                Remplissez les informations nécessaires pour créer un compte Active Directory.
              </p>
            </div>
          </div>

          <Card className="shadow-3">
            <form onSubmit={handleSubmit}>
              <div className="grid">

                {/* Type de compte */}
                <div className="col-12">
                  <div className="field">
                    <label className="block text-900 font-medium mb-2 md:mb-3 text-sm md:text-base">
                      Type de compte <span className="text-red-500">*</span>
                    </label>
                    <div className="grid">
                      <div className="col-12 md:col-6">
                        <div
                          onClick={() => handleAccountTypeChange("AD")}
                          className={`p-3 md:p-4 border-2 border-round cursor-pointer transition-all ${
                            accountType === "AD"
                              ? "border-primary bg-primary-50 shadow-3"
                              : "border-300 hover:border-400 hover:bg-gray-50"
                          }`}
                          style={{ transition: "all 0.3s ease" }}
                        >
                          <div className="flex align-items-center gap-2 md:gap-3">
                            <div
                              className={`border-circle flex align-items-center justify-content-center ${
                                accountType === "AD" ? "bg-primary" : "bg-gray-300"
                              }`}
                              style={{ width: "20px", height: "20px", minWidth: "20px", transition: "all 0.3s" }}
                            >
                              {accountType === "AD" && (
                                <i className="pi pi-check text-white" style={{ fontSize: "0.65rem" }}></i>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex align-items-center gap-2 mb-1">
                                <i className="pi pi-server text-lg md:text-xl" style={{ color: accountType === "AD" ? "var(--primary-color)" : "#6c757d" }}></i>
                                <span className={`font-bold text-sm md:text-base ${accountType === "AD" ? "text-primary" : "text-700"}`}>
                                  Active Directory (AD)
                                </span>
                              </div>
                              <p className="text-600 text-xs md:text-sm m-0">
                                Compte utilisateur standard pour l'authentification réseau
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-12 md:col-6">
                        <div
                          onClick={() => handleAccountTypeChange("AD+Exchange")}
                          className={`p-3 md:p-4 border-2 border-round cursor-pointer transition-all ${
                            accountType === "AD+Exchange"
                              ? "border-primary bg-primary-50 shadow-3"
                              : "border-300 hover:border-400 hover:bg-gray-50"
                          }`}
                          style={{ transition: "all 0.3s ease" }}
                        >
                          <div className="flex align-items-center gap-2 md:gap-3">
                            <div
                              className={`border-circle flex align-items-center justify-content-center ${
                                accountType === "AD+Exchange" ? "bg-primary" : "bg-gray-300"
                              }`}
                              style={{ width: "20px", height: "20px", minWidth: "20px", transition: "all 0.3s" }}
                            >
                              {accountType === "AD+Exchange" && (
                                <i className="pi pi-check text-white" style={{ fontSize: "0.65rem" }}></i>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex align-items-center gap-2 mb-1">
                                <i className="pi pi-envelope text-lg md:text-xl" style={{ color: accountType === "AD+Exchange" ? "var(--primary-color)" : "#6c757d" }}></i>
                                <span className={`font-bold text-sm md:text-base ${accountType === "AD+Exchange" ? "text-primary" : "text-700"}`}>
                                  AD + Exchange
                                </span>
                              </div>
                              <p className="text-600 text-xs md:text-sm m-0">
                                Compte avec boîte mail et accès messagerie Exchange
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section infos utilisateur */}
                <div className="col-12 mt-3">
                  <div className="flex align-items-center gap-2 mb-2 md:mb-3">
                    <i className="pi pi-id-card text-primary text-xl md:text-2xl"></i>
                    <h2 className="text-900 text-lg md:text-xl font-semibold m-0">Informations utilisateur</h2>
                  </div>
                  <Divider />
                </div>

                <div className="col-12 md:col-6">
                  <div className="field">
                    <label htmlFor="firstName" className="block text-900 font-medium mb-2 text-sm md:text-base">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <InputText
                      id="firstName"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleNameChange}
                      className="w-full text-sm md:text-base"
                      placeholder="Ex: Mohamed"
                      required
                    />
                  </div>
                </div>

                <div className="col-12 md:col-6">
                  <div className="field">
                    <label htmlFor="lastName" className="block text-900 font-medium mb-2 text-sm md:text-base">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <InputText
                      id="lastName"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleNameChange}
                      className="w-full text-sm md:text-base"
                      placeholder="Ex: BENALI"
                      required
                    />
                  </div>
                </div>

                <div className="col-12 md:col-6">
                  <div className="field">
                    <label htmlFor="sam" className="block text-900 font-medium mb-2 text-sm md:text-base">
                      Nom d'utilisateur <span className="text-red-500">*</span>
                    </label>
                    <InputText
                      id="sam"
                      name="sam"
                      value={form.sam}
                      onChange={handleChange}
                      className="w-full text-sm md:text-base"
                      maxLength={25}
                      placeholder="Ex: m.benali"
                      required
                    />
                    {samError && <small className="p-error text-xs md:text-sm">{samError}</small>}
                  </div>
                </div>

                {accountType === "AD+Exchange" && (
                  <div className="col-12 md:col-6">
                    <div className="field">
                      <label htmlFor="email" className="block text-900 font-medium mb-2 text-sm md:text-base">
                        Adresse email <span className="text-red-500">*</span>
                      </label>
                      <InputText
                        id="email"
                        name="email"
                        value={form.email}
                        className="w-full text-sm md:text-base"
                        disabled
                      />
                    </div>
                  </div>
                )}

               

                {/* Section Sécurité */}
                <div className="col-12 mt-3">
                  <div className="flex align-items-center gap-2 mb-2 md:mb-3">
                    <i className="pi pi-lock text-primary text-xl md:text-2xl"></i>
                    <h2 className="text-900 text-lg md:text-xl font-semibold m-0">Sécurité</h2>
                  </div>
                  <Divider />
                </div>

                {/* Mode de mot de passe */}
                <div className="col-12">
                  <div className="field">
                    <label className="block text-900 font-medium mb-2 md:mb-3 text-sm md:text-base">
                      Mode de mot de passe <span className="text-red-500">*</span>
                    </label>
                    <div className="grid">
                      <div className="col-12 md:col-6">
                        <div
                          onClick={() => handlePasswordModeChange("auto")}
                          className={`p-3 md:p-4 border-2 border-round cursor-pointer transition-all ${
                            passwordMode === "auto"
                              ? "border-green-500 bg-green-50 shadow-3"
                              : "border-300 hover:border-400 hover:bg-gray-50"
                          }`}
                          style={{ transition: "all 0.3s ease" }}
                        >
                          <div className="flex align-items-center gap-2 md:gap-3">
                            <div
                              className={`border-circle flex align-items-center justify-content-center ${
                                passwordMode === "auto" ? "bg-green-500" : "bg-gray-300"
                              }`}
                              style={{ width: "20px", height: "20px", minWidth: "20px", transition: "all 0.3s" }}
                            >
                              {passwordMode === "auto" && (
                                <i className="pi pi-check text-white" style={{ fontSize: "0.65rem" }}></i>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex align-items-center gap-2 mb-1">
                                <i className="pi pi-sparkles text-lg md:text-xl" style={{ color: passwordMode === "auto" ? "#22c55e" : "#6c757d" }}></i>
                                <span className={`font-bold text-sm md:text-base ${passwordMode === "auto" ? "text-green-700" : "text-700"}`}>
                                  Génération automatique
                                </span>
                              </div>
                              <p className="text-600 text-xs md:text-sm m-0">
                                Mot de passe sécurisé généré automatiquement (S@rpi + 4 chiffres)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-12 md:col-6">
                        <div
                          onClick={() => handlePasswordModeChange("manual")}
                          className={`p-3 md:p-4 border-2 border-round cursor-pointer transition-all ${
                            passwordMode === "manual"
                              ? "border-orange-500 bg-orange-50 shadow-3"
                              : "border-300 hover:border-400 hover:bg-gray-50"
                          }`}
                          style={{ transition: "all 0.3s ease" }}
                        >
                          <div className="flex align-items-center gap-2 md:gap-3">
                            <div
                              className={`border-circle flex align-items-center justify-content-center ${
                                passwordMode === "manual" ? "bg-orange-500" : "bg-gray-300"
                              }`}
                              style={{ width: "20px", height: "20px", minWidth: "20px", transition: "all 0.3s" }}
                            >
                              {passwordMode === "manual" && (
                                <i className="pi pi-check text-white" style={{ fontSize: "0.65rem" }}></i>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex align-items-center gap-2 mb-1">
                                <i className="pi pi-pencil text-lg md:text-xl" style={{ color: passwordMode === "manual" ? "#f97316" : "#6c757d" }}></i>
                                <span className={`font-bold text-sm md:text-base ${passwordMode === "manual" ? "text-orange-700" : "text-700"}`}>
                                  Saisie manuelle
                                </span>
                              </div>
                              <p className="text-600 text-xs md:text-sm m-0">
                                Créez votre propre mot de passe personnalisé
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 md:col-6">
                  <div className="field">
                    <label htmlFor="password" className="block text-900 font-medium mb-2 text-sm md:text-base">
                      Mot de passe <span className="text-red-500">*</span>
                    </label>
                    {passwordMode === "auto" ? (
                      <InputText
                        id="password"
                        name="password"
                        value={form.password}
                        className="w-full text-sm md:text-base"
                        disabled
                      />
                    ) : (
                      <div className="flex flex-column gap-2">
                        <div className="p-inputgroup">
                          <InputText
                            id="password"
                            name="password"
                            value={form.password}
                            onChange={(e) => {
                              const rawValue = e.target.value;
                              const filteredValue = rawValue.replace(/[^A-Za-z0-9@$!%*?&]/g, '');
                              handleChange({ target: { name: "password", value: filteredValue } });

                              const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                              if (!passwordRegex.test(filteredValue)) {
                                setError("⚠️ Le mot de passe doit contenir au moins 8 caractères dont : une majuscule, une minuscule, un chiffre et un caractère spécial parmi @$!%*?&");
                              } else {
                                setError("");
                              }
                            }}
                            type={showPassword ? "text" : "password"}
                            required
                            className="w-full text-sm md:text-base"
                            placeholder="Entrez le mot de passe"
                          />
                          <Button
                            icon={showPassword ? "pi pi-eye-slash" : "pi pi-eye"}
                            className="p-button-secondary"
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            tooltip={showPassword ? "Masquer" : "Afficher"}
                          />
                        </div>
                        {error && <small className="p-error text-xs md:text-sm">{error}</small>}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-12 md:col-6">
                  <div className="field">
                    <label htmlFor="direction" className="block text-900 font-medium mb-2 text-sm md:text-base">
                      Direction <span className="text-red-500">*</span>
                    </label>
                    <Dropdown
                      id="direction"
                      value={form.direction_id}
                      options={directionOptions}
                      onChange={handleDirectionChange}
                      placeholder="Choisir une direction"
                      className="w-full text-sm md:text-base"
                      required
                      filter
                      filterPlaceholder="Rechercher..."
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="col-12 mt-3 md:mt-4">
                  <Divider />
                  <div className="flex flex-column md:flex-row justify-content-end gap-2">
                    <Button
                      type="button"
                      label="Annuler"
                      outlined
                      onClick={() => {
                        setForm({
                          firstName: "",
                          lastName: "",
                          name: "",
                          sam: "",
                          email: "",
                          logmail: "",
                          password: "",
                          direction_id: "",
                          mailbox: "",
                        });
                        setSelectedDirection(null);
                        setPasswordMode("auto");
                      }}
                      disabled={loading}
                      className="w-full md:w-auto p-button-sm md:p-button-md"
                    />
                    <Button
                      type="submit"
                      label="Créer l'utilisateur"
                      icon="pi pi-user-plus"
                      loading={loading}
                      className="w-full md:w-auto p-button-sm md:p-button-md"
                      style={{
                        background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                        border: "none",
                      }}
                    />
                  </div>
                </div>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Dialog de confirmation */}
      <Dialog
        visible={showConfirmDialog}
        onHide={() => setShowConfirmDialog(false)}
        header={
          <div className="flex align-items-center gap-2">
            <i className="pi pi-check-circle text-green-600 text-xl md:text-2xl"></i>
            <span className="text-base md:text-lg">Confirmer la création</span>
          </div>
        }
        footer={dialogFooter}
        style={{ width: "95vw", maxWidth: "480px" }}
        modal
        breakpoints={{ '960px': '90vw', '640px': '95vw' }}
      >
        <div className="text-center py-2 md:py-3">
          <div
            className="inline-flex align-items-center justify-content-center bg-green-100 border-circle mb-3 md:mb-4"
            style={{ width: "60px", height: "60px" }}
          >
            <i className="pi pi-user-plus text-3xl md:text-5xl text-green-600"></i>
          </div>

          <h3 className="text-900 text-lg md:text-xl font-bold mb-2">
            Créer un utilisateur Active Directory
          </h3>

          <p className="text-600 mb-3 text-sm md:text-base">
            Êtes-vous sûr de vouloir créer ce compte ?
          </p>

          <div className="surface-100 border-round p-3 text-left">
            <div className="flex align-items-center gap-2 mb-2">
              <i className="pi pi-user text-600 text-sm md:text-base"></i>
              <span className="text-900 font-medium text-sm md:text-base">{form.name}</span>
            </div>
            <div className="flex align-items-center gap-2 mb-2">
              <i className="pi pi-id-card text-600 text-sm md:text-base"></i>
              <span className="text-700 text-sm md:text-base">{form.sam}</span>
            </div>
            {accountType === "AD+Exchange" && (
              <div className="flex align-items-center gap-2 mb-2">
                <i className="pi pi-envelope text-600 text-sm md:text-base"></i>
                <span className="text-700 text-sm md:text-base">{form.email}</span>
              </div>
            )}
            <div className="flex align-items-center gap-2 mb-2">
              <i className="pi pi-sitemap text-600 text-sm md:text-base"></i>
              <span className="text-700 text-sm md:text-base">{selectedDirection?.nom}</span>
            </div>
            <div className="flex align-items-center gap-2">
              <i className="pi pi-lock text-600 text-sm md:text-base"></i>
              <span className="text-700 text-sm md:text-base">{form.password}</span>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Dialog de succès */}
      <Dialog
        visible={showSuccessDialog}
        onHide={() => setShowSuccessDialog(false)}
        header={
          <div className="flex align-items-center gap-2">
            <i className="pi pi-check-circle text-green-600 text-xl md:text-2xl"></i>
            <span className="text-base md:text-lg">Utilisateur créé avec succès !</span>
          </div>
        }
        footer={successDialogFooter}
        style={{ width: "95vw", maxWidth: "550px" }}
        modal
        breakpoints={{ '960px': '90vw', '640px': '95vw' }}
      >
        {createdUserDetails && (
          <div className="py-2 md:py-3">
            <div className="text-center mb-3 md:mb-4">
              <div
                className="inline-flex align-items-center justify-content-center bg-green-100 border-circle mb-3"
                style={{ width: "80px", height: "80px" }}
              >
                <i className="pi pi-check text-4xl md:text-6xl text-green-600"></i>
              </div>
              <h3 className="text-900 text-xl md:text-2xl font-bold mb-2">
                Compte créé avec succès !
              </h3>
              <p className="text-600 text-sm md:text-base">
                L'utilisateur a été ajouté à Active Directory
              </p>
            </div>

            <Divider />

            <div className="surface-50 border-round p-3 md:p-4">
              <h4 className="text-900 font-semibold mb-3 flex align-items-center gap-2 text-sm md:text-base">
                <i className="pi pi-info-circle text-primary"></i>
                Détails du compte créé
              </h4>

              <div className="grid">
                <div className="col-12">
                  <div className="flex align-items-start gap-2 md:gap-3 mb-2 md:mb-3 p-2 surface-0 border-round">
                    <i className="pi pi-id-card text-primary text-lg md:text-xl mt-1"></i>
                    <div className="flex-1">
                      <div className="text-500 text-xs md:text-sm mb-1">Nom d'utilisateur</div>
                      <div className="text-900 font-semibold text-sm md:text-base">{createdUserDetails.sam}</div>
                    </div>
                  </div>
                </div>

                {createdUserDetails.accountType === "AD+Exchange" && (
                  <div className="col-12">
                    <div className="flex align-items-start gap-2 md:gap-3 mb-2 md:mb-3 p-2 surface-0 border-round">
                      <i className="pi pi-envelope text-primary text-lg md:text-xl mt-1"></i>
                      <div className="flex-1">
                        <div className="text-500 text-xs md:text-sm mb-1">Email</div>
                        <div className="text-900 font-semibold text-sm md:text-base word-break-all">{createdUserDetails.email}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="col-12">
                  <div className="flex align-items-start gap-2 md:gap-3 mb-2 md:mb-3 p-2 surface-0 border-round">
                    <i className="pi pi-sitemap text-primary text-lg md:text-xl mt-1"></i>
                    <div className="flex-1">
                      <div className="text-500 text-xs md:text-sm mb-1">Direction</div>
                      <div className="text-900 font-semibold text-sm md:text-base">{createdUserDetails.direction}</div>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="flex align-items-start gap-2 md:gap-3 p-2 bg-yellow-50 border-round border-1 border-yellow-200">
                    <i className="pi pi-lock text-yellow-700 text-lg md:text-xl mt-1"></i>
                    <div className="flex-1">
                      <div className="text-yellow-700 text-xs md:text-sm font-semibold mb-1">
                        Mot de passe temporaire
                      </div>
                      <div className="text-900 font-bold text-base md:text-lg word-break-all">{createdUserDetails.password}</div>
                      <small className="text-yellow-700 text-xs">
                        ⚠️ Veuillez noter ce mot de passe et le communiquer à l'utilisateur
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* Dialog d'erreur */}
      <Dialog
        visible={showErrorDialog}
        onHide={() => setShowErrorDialog(false)}
        header={
          <div className="flex align-items-center gap-2">
            <i className="pi pi-times-circle text-red-600 text-xl md:text-2xl"></i>
            <span className="text-base md:text-lg">{errorTitle}</span>
          </div>
        }
        footer={errorDialogFooter}
        style={{ width: "95vw", maxWidth: "500px" }}
        modal
        breakpoints={{ '960px': '90vw', '640px': '95vw' }}
      >
        <div className="py-2 md:py-3">
          <div className="text-center mb-3 md:mb-4">
            <div
              className="inline-flex align-items-center justify-content-center bg-red-100 border-circle mb-3"
              style={{ width: "70px", height: "70px" }}
            >
              <i className="pi pi-exclamation-triangle text-4xl md:text-5xl text-red-600"></i>
            </div>
          </div>

          <div className="surface-50 border-round p-3 md:p-4 border-left-3 border-red-500">
            <div className="flex align-items-start gap-2 md:gap-3">
              <i className="pi pi-info-circle text-red-600 text-lg md:text-xl mt-1"></i>
              <div className="flex-1">
                <p className="text-900 m-0 text-sm md:text-base" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </Layout>
  );
};

export default ManageAddUser;