import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
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
  });

  const [directions, setDirections] = useState(initialDirections);
  const [selectedDirection, setSelectedDirection] = useState(null);
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
  const [passwordStrength, setPasswordStrength] = useState({ level: 0, text: "", color: "" });
const [samManuallyEdited, setSamManuallyEdited] = useState(false);
  const calculatePasswordStrength = (password) => {
    if (!password) return { level: 0, text: "", color: "" };
    
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    };
    
    strength += checks.length ? 20 : 0;
    strength += checks.lowercase ? 20 : 0;
    strength += checks.uppercase ? 20 : 0;
    strength += checks.number ? 20 : 0;
    strength += checks.special ? 20 : 0;
    
    if (password.length >= 12) strength += 10;
    
    if (strength < 40) {
      return { level: 1, text: "Faible", color: "#ef4444" };
    } else if (strength < 80) {
      return { level: 2, text: "Moyen", color: "#f59e0b" };
    } else {
      return { level: 3, text: "Fort", color: "#22c55e" };
    }
  };

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
    loadMailboxes();
  }, []);

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

  const handleDirectionChange = (e) => {
    const direction = directions.find(d => d.id === e.value);
    setSelectedDirection(direction);
    setForm((prev) => ({
      ...prev,
      direction_id: e.value
    }));
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
 setForm((prev) => {
  const newSam = name === "sam" ? newValue : prev.sam;
  return {
    ...prev,
    [name]: newValue,
    logmail: `${newSam}@sarpi-dz.sg`,   // logmail toujours basé sur sam
    email: `${newSam}@sarpi-dz.com`,    // email basé sur sam
  };
});


     };

  const handlePasswordChange = (value) => {
  // 🔹 Filtrer les caractères autorisés
  const filteredValue = value.replace(/[^A-Za-z0-9@$!%*?&]/g, '');
  handleChange({ target: { name: "password", value: filteredValue } });

  // 🔹 Calcul de la force du mot de passe
  const strength = calculatePasswordStrength(filteredValue);
  setPasswordStrength(strength);

  // 🔹 Validation du mot de passe
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (filteredValue && !passwordRegex.test(filteredValue)) {
    setError("⚠️ Le mot de passe doit contenir au moins 8 caractères dont : une majuscule, une minuscule, un chiffre et un caractère spécial parmi @$!%*?&");
  } else {
    setError(""); // Pas d'erreur si le mot de passe est valide
  }
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

    // Mise à jour automatique de sam seulement si l'utilisateur n'a pas modifié manuellement
    if (!samManuallyEdited) {
      const generatedSam = `${newForm.firstName.toLowerCase()}.${newForm.lastName.toLowerCase()}`.replace(/\s+/g, '');
      newForm.sam = generatedSam;
      newForm.logmail = `${generatedSam}@sarpi-dz.sg`;
      newForm.email = `${generatedSam}@sarpi-dz.com`;
    }

    return newForm;
  });
};

// Gestion du champ SAM
const handleSamChange = (e) => {
  const { value } = e.target;
  setSamManuallyEdited(true); // l'utilisateur a modifié manuellement
  handleChange({ target: { name: "sam", value } });
};
  useEffect(() => {
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
    
    if (passwordMode === "manual" && form.password !== form.confirmPassword) {
      showError("Erreur de validation", "Les mots de passe ne correspondent pas !");
      return;
    }
    
    
    
    setShowConfirmDialog(true);
  };

  const confirmCreate = async () => {
    setLoading(true);
    try {


      const payload = { 
        ...form, 
        accountType: "AD+Exchange",
      };
     console.log(payload)
      const res = await axios.post("/ad/create-user", payload);

      setCreatedUserDetails({
        firstName: form.firstName,
        lastName: form.lastName,
        name: form.name,
        sam: form.sam,
        email: form.email,
        password: form.password,
        direction: selectedDirection?.nom || '',
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
        confirmPassword: "",
      });
      setSelectedDirection(null);
      setPasswordMode("auto");
      setPasswordStrength({ level: 0, text: "", color: "" });
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
      <Head title="Créer un utilisateur AD Exchange" />
      
      <div className="grid">
        <div className="col-12">


          <Card className="shadow-3 border-round-xl">
            <form onSubmit={handleSubmit}>
              <div className="grid">

                {/* Section infos utilisateur */}
                <div className="col-12">
                            <div className="flex align-items-center gap-3 mb-3 md:mb-4">
          
            <div className="flex-1">
              <h1 className="text-900 text-xl md:text-3xl font-bold m-0 mb-1">
                Créer un utilisateur AD / Exchange
              </h1>
              <p className="text-600 text-sm md:text-base m-0">
                Configuration complète du compte Active Directory avec boîte mail Exchange
              </p>
            </div>
          </div>
                  <div className="surface-50 border-round-lg p-3 md:p-4 mb-4 border-1 border-200">
                    <div className="flex align-items-center gap-2 mb-3 pb-2 border-bottom-1 border-300">
                      <i className="pi pi-id-card text-primary text-xl md:text-2xl"></i>
                      <h2 className="text-900 text-base md:text-xl font-semibold m-0">Informations personnelles</h2>
                    </div>
                    
                    <div className="grid">
                      <div className="col-12 md:col-6">
                        <div className="field">
                          <label htmlFor="firstName" className="block text-900 font-semibold mb-2 text-sm md:text-base">
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
                          <label htmlFor="lastName" className="block text-900 font-semibold mb-2 text-sm md:text-base">
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
                          <label htmlFor="direction" className="block text-900 font-semibold mb-2 text-sm md:text-base">
                            Direction <span className="text-red-500">*</span>
                          </label>
                          <Dropdown
                            id="direction"
                            value={form.direction_id}
                            options={directionOptions}
                            onChange={handleDirectionChange}
                            placeholder="Sélectionner une direction"
                            className="w-full text-sm md:text-base"
                            required
                            filter
                            filterPlaceholder="Rechercher..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section compte */}
                <div className="col-12">
                  <div className="surface-50 border-round-lg p-3 md:p-4 mb-4 border-1 border-200">
                    <div className="flex align-items-center gap-2 mb-3 pb-2 border-bottom-1 border-300">
                      <i className="pi pi-envelope text-primary text-xl md:text-2xl"></i>
                      <h2 className="text-900 text-base md:text-xl font-semibold m-0">Compte Exchange</h2>
                    </div>
                    
                    <div className="grid">
                      <div className="col-12 md:col-6">
                        <div className="field">
                          <label htmlFor="sam" className="block text-900 font-semibold mb-2 text-sm md:text-base">
                            Nom d'utilisateur <span className="text-red-500">*</span>
                          </label>
                          <InputText
  id="sam"
  name="sam"
  value={form.sam}
  onChange={handleSamChange} // utilise le handleSamChange
  className="w-full text-sm md:text-base"
  maxLength={25}
  placeholder="Ex: BENALI.Mohamed"
  required
/>

                          {samError && <small className="p-error text-xs md:text-sm mt-1 block">{samError}</small>}
                        </div>
                      </div>

                      <div className="col-12 md:col-6">
                        <div className="field">
                          <label htmlFor="email" className="block text-900 font-semibold mb-2 text-sm md:text-base">
                            Adresse email <span className="text-red-500">*</span>
                          </label>
                          <InputText
                            id="email"
                            name="email"
                            value={form.email}
                            className="w-full text-sm md:text-base bg-gray-100"
                            disabled
                          />
                        </div>
                      </div>

                     
                    </div>
                  </div>
                </div>

                {/* Section Sécurité */}
                <div className="col-12">
                  <div className="surface-50 border-round-lg p-3 md:p-4 border-1 border-200">
                    <div className="flex align-items-center gap-2 mb-3 pb-2 border-bottom-1 border-300">
                      <i className="pi pi-lock text-primary text-xl md:text-2xl"></i>
                      <h2 className="text-900 text-base md:text-xl font-semibold m-0">Sécurité</h2>
                    </div>

                    {/* Mode de mot de passe */}
                    <div className="field mb-3">
                      <label className="block text-900 font-semibold mb-3 text-sm md:text-base">
                        Mode de génération <span className="text-red-500">*</span>
                      </label>
                      <div className="grid">
                        <div className="col-12 md:col-6">
                          <div
                            onClick={() => handlePasswordModeChange("auto")}
                            className={`p-3 border-2 border-round-lg cursor-pointer transition-all ${
                              passwordMode === "auto"
                                ? "border-green-500 bg-green-50 shadow-2"
                                : "border-300 hover:border-400 hover:bg-gray-50"
                            }`}
                            style={{ transition: "all 0.2s ease" }}
                          >
                            <div className="flex align-items-center gap-3">
                              <div
                                className={`border-circle flex align-items-center justify-content-center ${
                                  passwordMode === "auto" ? "bg-green-500" : "bg-gray-300"
                                }`}
                                style={{ width: "22px", height: "22px", minWidth: "22px" }}
                              >
                                {passwordMode === "auto" && (
                                  <i className="pi pi-check text-white" style={{ fontSize: "0.7rem" }}></i>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex align-items-center gap-2 mb-1">
                                  <i className="pi pi-sparkles text-lg" style={{ color: passwordMode === "auto" ? "#22c55e" : "#6c757d" }}></i>
                                  <span className={`font-bold text-sm ${passwordMode === "auto" ? "text-green-700" : "text-700"}`}>
                                    Saisie Automatique
                                  </span>
                                </div>
                                <p className="text-600 text-xs m-0">
                                  Génération sécurisée (S@rpi + 4 chiffres)
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-12 md:col-6">
                          <div
                            onClick={() => handlePasswordModeChange("manual")}
                            className={`p-3 border-2 border-round-lg cursor-pointer transition-all ${
                              passwordMode === "manual"
                                ? "border-orange-500 bg-orange-50 shadow-2"
                                : "border-300 hover:border-400 hover:bg-gray-50"
                            }`}
                            style={{ transition: "all 0.2s ease" }}
                          >
                            <div className="flex align-items-center gap-3">
                              <div
                                className={`border-circle flex align-items-center justify-content-center ${
                                  passwordMode === "manual" ? "bg-orange-500" : "bg-gray-300"
                                }`}
                                style={{ width: "22px", height: "22px", minWidth: "22px" }}
                              >
                                {passwordMode === "manual" && (
                                  <i className="pi pi-check text-white" style={{ fontSize: "0.7rem" }}></i>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex align-items-center gap-2 mb-1">
                                  <i className="pi pi-pencil text-lg" style={{ color: passwordMode === "manual" ? "#f97316" : "#6c757d" }}></i>
                                  <span className={`font-bold text-sm ${passwordMode === "manual" ? "text-orange-700" : "text-700"}`}>
                                    Saisie manuelle
                                  </span>
                                </div>
                                <p className="text-600 text-xs m-0">
                                  Créez un mot de passe
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid">
                      <div className="col-12 md:col-6">
                        <div className="field">
                          <label htmlFor="password" className="block text-900 font-semibold mb-2 text-sm md:text-base">
                            Mot de passe <span className="text-red-500">*</span>
                          </label>
                          {passwordMode === "auto" ? (
                            <InputText
                              id="password"
                              name="password"
                              value={form.password}
                              className="w-full text-sm md:text-base bg-gray-100"
                              disabled
                            />
                          ) : (
                            <div className="flex flex-column gap-2">
                              <div className="p-inputgroup">
                                <InputText
                                  id="password"
                                  name="password"
                                  value={form.password}
                                  onChange={(e) => handlePasswordChange(e.target.value)}
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
                                />
                              </div>
                              
                              {form.password && (
                                <div className="flex flex-column gap-2">
                                  <div className="flex align-items-center gap-2">
                                    <div className="flex-1 bg-gray-200 border-round" style={{ height: "6px" }}>
                                      <div 
                                        className="border-round transition-all"
                                        style={{ 
                                          width: `${passwordStrength.level * 33.33}%`, 
                                          height: "100%",
                                          backgroundColor: passwordStrength.color,
                                          transition: "all 0.3s ease"
                                        }}
                                      ></div>
                                    </div>
                                    <span 
                                      className="text-xs font-semibold"
                                      style={{ color: passwordStrength.color, minWidth: "50px" }}
                                    >
                                      {passwordStrength.text}
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              {error && <small className="p-error text-xs md:text-sm">{error}</small>}
                            </div>
                          )}
                        </div>
                      </div>

                      {passwordMode === "manual" && (
                        <div className="col-12 md:col-6">
                          <div className="field">
                            <label htmlFor="confirmPassword" className="block text-900 font-semibold mb-2 text-sm md:text-base">
                              Confirmer le mot de passe <span className="text-red-500">*</span>
                            </label>
                            <div className="p-inputgroup">
                              <InputText
                                id="confirmPassword"
                                name="confirmPassword"
                                value={form.confirmPassword || ""}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^A-Za-z0-9@$!%*?&]/g, '');
                                  setForm(prev => ({ ...prev, confirmPassword: value }));
                                }}
                                type={showPassword ? "text" : "password"}
                                required
                                className={`w-full text-sm md:text-base ${
                                  form.confirmPassword && form.password !== form.confirmPassword ? 'p-invalid' : ''
                                }`}
                                placeholder="Confirmez le mot de passe"
                              />
                              <Button
                                icon={showPassword ? "pi pi-eye-slash" : "pi pi-eye"}
                                className="p-button-secondary"
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                              />
                            </div>
                            {form.confirmPassword && form.password !== form.confirmPassword && (
                              <small className="p-error text-xs md:text-sm">⚠️ Les mots de passe ne correspondent pas</small>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-12 mt-4">
                  <Divider />
                  <div className="flex flex-column md:flex-row justify-content-end gap-2">
                    <Button
                      type="button"
                      label="Réinitialiser"
                      icon="pi pi-refresh"
                      outlined
                      onClick={() => {
                        setForm({
                          firstName: "",
                          lastName: "",
                          name: "",
                          sam: "",
                          email: "",
                          password: "",
                          direction_id: "",
                          confirmPassword: "",
                        });
                        setSelectedDirection(null);
                        setPasswordMode("auto");
                        setPasswordStrength({ level: 0, text: "", color: "" });
                      }}
                      disabled={loading}
                      className="w-full md:w-auto p-button-sm md:p-button-md"
                    />
                    <Button
                      type="submit"
                      label="Créer le compte"
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
            <span className="text-base md:text-lg font-semibold">Confirmer la création</span>
          </div>
        }
        footer={dialogFooter}
        style={{ width: "95vw", maxWidth: "520px" }}
        modal
        breakpoints={{ '960px': '90vw', '640px': '95vw' }}
      >
        <div className="text-center py-3">
          <div
            className="inline-flex align-items-center justify-content-center bg-green-100 border-circle mb-3"
            style={{ width: "70px", height: "70px" }}
          >
            <i className="pi pi-user-plus text-4xl text-green-600"></i>
          </div>

          <h3 className="text-900 text-lg md:text-xl font-bold mb-2">
            Nouveau compte AD / Exchange
          </h3>

          <p className="text-600 mb-3 text-sm md:text-base">
            Confirmez-vous la création de ce compte ?
          </p>

          <div className="surface-100 border-round-lg p-3 text-left">
            <div className="flex align-items-start gap-3 mb-2">
              <i className="pi pi-user text-primary text-lg mt-1"></i>
              <div className="flex-1">
                <small className="text-600 block mb-1">Utilisateur</small>
                <span className="text-900 font-semibold">{form.name}</span>
              </div>
            </div>
            <div className="flex align-items-start gap-3 mb-2">
              <i className="pi pi-id-card text-primary text-lg mt-1"></i>
              <div className="flex-1">
                <small className="text-600 block mb-1">Identifiant</small>
                <span className="text-700 font-medium">{form.sam}</span>
              </div>
            </div>
            <div className="flex align-items-start gap-3 mb-2">
              <i className="pi pi-envelope text-primary text-lg mt-1"></i>
              <div className="flex-1">
                <small className="text-600 block mb-1">Email</small>
                <span className="text-700 font-medium word-break-all">{form.email}</span>
              </div>
            </div>
            <div className="flex align-items-start gap-3 mb-2">
              <i className="pi pi-sitemap text-primary text-lg mt-1"></i>
              <div className="flex-1">
                <small className="text-600 block mb-1">Direction</small>
                <span className="text-700 font-medium">{selectedDirection?.nom}</span>
              </div>
            </div>
            <div className="flex align-items-start gap-3">
              <i className="pi pi-lock text-primary text-lg mt-1"></i>
              <div className="flex-1">
                <small className="text-600 block mb-1">Mot de passe</small>
                <span className="text-700 font-medium">{form.password}</span>
              </div>
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
            <span className="text-base md:text-lg font-semibold">Compte créé avec succès</span>
          </div>
        }
        footer={successDialogFooter}
        style={{ width: "95vw", maxWidth: "600px" }}
        modal
        breakpoints={{ '960px': '90vw', '640px': '95vw' }}
      >
        {createdUserDetails && (
          <div className="py-3">
            <div className="text-center mb-4">
              <div
                className="inline-flex align-items-center justify-content-center bg-green-100 border-circle mb-3"
                style={{ width: "80px", height: "80px" }}
              >
                <i className="pi pi-check text-5xl text-green-600"></i>
              </div>
              <h3 className="text-900 text-xl md:text-2xl font-bold mb-2">
                Compte créé !
              </h3>
              <p className="text-600 text-sm md:text-base">
                L'utilisateur a été ajouté à Active Directory et Exchange
              </p>
            </div>

            <Divider />

            <div className="surface-50 border-round-lg p-4">
              <h4 className="text-900 font-semibold mb-3 flex align-items-center gap-2 text-sm md:text-base">
                <i className="pi pi-info-circle text-primary"></i>
                Détails du compte
              </h4>

              <div className="grid">
                <div className="col-12">
                  <div className="flex align-items-start gap-3 mb-3 p-3 surface-0 border-round-lg">
                    <i className="pi pi-id-card text-primary text-xl mt-1"></i>
                    <div className="flex-1">
                      <div className="text-500 text-xs md:text-sm mb-1">Nom d'utilisateur</div>
                      <div className="text-900 font-bold text-base">{createdUserDetails.sam}</div>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="flex align-items-start gap-3 mb-3 p-3 surface-0 border-round-lg">
                    <i className="pi pi-envelope text-primary text-xl mt-1"></i>
                    <div className="flex-1">
                      <div className="text-500 text-xs md:text-sm mb-1">Adresse email</div>
                      <div className="text-900 font-bold text-base word-break-all">{createdUserDetails.email}</div>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="flex align-items-start gap-3 mb-3 p-3 surface-0 border-round-lg">
                    <i className="pi pi-sitemap text-primary text-xl mt-1"></i>
                    <div className="flex-1">
                      <div className="text-500 text-xs md:text-sm mb-1">Direction</div>
                      <div className="text-900 font-bold text-base">{createdUserDetails.direction}</div>
                    </div>
                  </div>
                </div>

              

                <div className="col-12">
                  <div className="flex align-items-start gap-3 p-3 bg-yellow-50 border-round-lg border-1 border-yellow-300">
                    <i className="pi pi-lock text-yellow-700 text-xl mt-1"></i>
                    <div className="flex-1">
                      <div className="text-yellow-700 text-xs md:text-sm font-bold mb-1">
                        🔐 Mot de passe temporaire
                      </div>
                      <div className="text-900 font-bold text-lg word-break-all mb-2">{createdUserDetails.password}</div>
                      <small className="text-yellow-800 text-xs">
                        ⚠️ Veuillez noter ce mot de passe et le communiquer de manière sécurisée à l'utilisateur
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
            <span className="text-base md:text-lg font-semibold">{errorTitle}</span>
          </div>
        }
        footer={errorDialogFooter}
        style={{ width: "95vw", maxWidth: "500px" }}
        modal
        breakpoints={{ '960px': '90vw', '640px': '95vw' }}
      >
        <div className="py-3">
          <div className="text-center mb-4">
            <div
              className="inline-flex align-items-center justify-content-center bg-red-100 border-circle mb-3"
              style={{ width: "70px", height: "70px" }}
            >
              <i className="pi pi-exclamation-triangle text-4xl text-red-600"></i>
            </div>
          </div>

          <div className="surface-50 border-round-lg p-3 md:p-4 border-left-3 border-red-500">
            <div className="flex align-items-start gap-3">
              <i className="pi pi-info-circle text-red-600 text-lg mt-1"></i>
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