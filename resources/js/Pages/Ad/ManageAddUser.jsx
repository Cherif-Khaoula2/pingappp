import React, { useState } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { Dropdown } from "primereact/dropdown";
import { Divider } from "primereact/divider";
import { FloatLabel } from "primereact/floatlabel";
import Layout from "@/Layouts/layout/layout.jsx";

export default function ManageAddUser() {
  const [form, setForm] = useState({
    name: "",
    sam: "",
    email: "",
    password: "",
    ou_path: "OU=OuTempUsers,DC=sarpi-dz,DC=sg",
  });

  const [accountType, setAccountType] = useState("AD");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    }
  };

  const accountOptions = [
    { label: "Compte Active Directory (AD)", value: "AD" },
    { label: "Compte AD + Exchange", value: "AD+Exchange" },
  ];

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
        <Card
          title={
            <div className="text-center pt-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mb-4 shadow-xl transform hover:scale-105 transition-transform duration-300">
                <i className="pi pi-user-plus text-white text-3xl"></i>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-1 tracking-tight">
                Créer un nouvel utilisateur
              </h2>
              <p className="text-gray-500 text-sm font-medium">
                Active Directory / Exchange
              </p>
            </div>
          }
          className="w-full max-w-2xl shadow-2xl border-0 rounded-3xl bg-white p-6 sm:p-8 lg:p-10 overflow-hidden backdrop-blur-sm hover:shadow-3xl transition-shadow duration-300"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6">
            {/* Type de compte */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-700 text-sm uppercase tracking-wide flex items-center gap-2">
                <i className="pi pi-tag text-indigo-600"></i>
                Type de compte
              </label>
              <Dropdown
                value={accountType}
                options={accountOptions}
                onChange={(e) => setAccountType(e.value)}
                className="w-full border-2 border-gray-200 hover:border-indigo-400 focus:border-indigo-600 rounded-lg px-3 py-2 transition-all duration-300"
              />
            </div>

            <Divider className="my-3">
              <span className="px-4 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full">
                INFORMATIONS UTILISATEUR
              </span>
            </Divider>

            {/* Champs du formulaire */}
            <div className="flex flex-col gap-4">
              <FloatLabel>
                <InputText
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 hover:border-indigo-400 focus:border-indigo-600 rounded-lg px-4 py-3 transition-all duration-300 shadow-sm focus:shadow-md"
                  required
                />
                <label htmlFor="name" className="text-gray-600 font-medium flex items-center gap-2">
                  <i className="pi pi-user mr-1 text-indigo-600"></i>
                  Nom complet
                </label>
              </FloatLabel>

              <FloatLabel>
                <InputText
                  id="sam"
                  name="sam"
                  value={form.sam}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 hover:border-indigo-400 focus:border-indigo-600 rounded-lg px-4 py-3 transition-all duration-300 shadow-sm focus:shadow-md"
                  required
                />
                <label htmlFor="sam" className="text-gray-600 font-medium flex items-center gap-2">
                  <i className="pi pi-id-card mr-1 text-indigo-600"></i>
                  Nom d'utilisateur (SamAccountName)
                </label>
              </FloatLabel>

              {accountType === "AD+Exchange" && (
                <FloatLabel>
                  <InputText
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 hover:border-indigo-400 focus:border-indigo-600 rounded-lg px-4 py-3 transition-all duration-300 shadow-sm focus:shadow-md"
                    required
                  />
                  <label htmlFor="email" className="text-gray-600 font-medium flex items-center gap-2">
                    <i className="pi pi-envelope mr-1 text-indigo-600"></i>
                    Email
                  </label>
                </FloatLabel>
              )}

              <FloatLabel>
                <InputText
                  id="password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 hover:border-indigo-400 focus:border-indigo-600 rounded-lg px-4 py-3 transition-all duration-300 shadow-sm focus:shadow-md"
                  required
                />
                <label htmlFor="password" className="text-gray-600 font-medium flex items-center gap-2">
                  <i className="pi pi-lock mr-1 text-indigo-600"></i>
                  Mot de passe
                </label>
              </FloatLabel>

              <FloatLabel>
                <InputText
                  id="ou_path"
                  name="ou_path"
                  value={form.ou_path}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 hover:border-indigo-400 focus:border-indigo-600 rounded-lg px-4 py-3 transition-all duration-300 shadow-sm focus:shadow-md"
                  required
                />
                <label htmlFor="ou_path" className="text-gray-600 font-medium flex items-center gap-2">
                  <i className="pi pi-sitemap mr-1 text-indigo-600"></i>
                  Chemin OU
                </label>
              </FloatLabel>
            </div>

            {/* Bouton */}
            <Button
              type="submit"
              label={loading ? "Création en cours..." : "Créer l'utilisateur"}
              icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-none text-white py-4 text-base font-semibold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 mt-4"
              disabled={loading}
            />

            {/* Messages */}
            {message && (
              <Message
                severity="success"
                text={message}
                className="w-full rounded-lg border-l-4 border-green-500 bg-green-50 px-3 py-2 mt-3 shadow-sm"
              />
            )}
            {error && (
              <Message
                severity="error"
                text={error}
                className="w-full rounded-lg border-l-4 border-red-500 bg-red-50 px-3 py-2 mt-3 shadow-sm"
              />
            )}
          </form>
        </Card>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }
      `}</style>
    </Layout>
  );
}
