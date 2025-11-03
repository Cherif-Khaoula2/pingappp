import React, { useState } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import Layout from "@/Layouts/layout/layout.jsx";

export default function ManageAddUser() {
  const [form, setForm] = useState({
    name: "",
    sam: "",
    email: "",
    password: "",
    ou_path: "OU=OuTempUsers,DC=sarpi-dz,DC=sg",
  });

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
      const res = await axios.post("/ad/create-user", form);
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

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
        <Card
          title="Créer un nouvel utilisateur Active Directory"
          className="w-full md:w-2/3 lg:w-1/2 shadow-2xl border-t-4 border-blue-600"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Nom complet
              </label>
              <InputText
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full"
                placeholder="Ex: Mohamed Bensalem"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Nom d’utilisateur (SamAccountName)
              </label>
              <InputText
                name="sam"
                value={form.sam}
                onChange={handleChange}
                className="w-full"
                placeholder="Ex: mbensalem"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Email
              </label>
              <InputText
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full"
                placeholder="Ex: mbensalem@sarpi-dz.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Mot de passe
              </label>
              <InputText
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full"
                placeholder="Ex: S@rpi2026"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Chemin OU (Organizational Unit)
              </label>
              <InputText
                name="ou_path"
                value={form.ou_path}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              label={loading ? "Création en cours..." : "Créer l’utilisateur"}
              icon={loading ? "pi pi-spin pi-spinner" : "pi pi-user-plus"}
              className="w-full p-button-primary"
              disabled={loading}
            />

            {message && (
              <Message
                severity="success"
                text={message}
                className="mt-3 text-center"
              />
            )}

            {error && (
              <Message
                severity="error"
                text={error}
                className="mt-3 text-center"
              />
            )}
          </form>
        </Card>
      </div>
    </Layout>
  );
}
