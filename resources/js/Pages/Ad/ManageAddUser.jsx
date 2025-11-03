import React, { useState } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import Layout from "@/Layouts/layout/layout.jsx";

export default function ManageAddUser() {
  const [form, setForm] = useState({
    name: "",
    sam: "",
    email: "",
    password: "",
    ou_path: "OU=OuTempUsers,DC=sarpi-dz,DC=sg", // Valeur par défaut
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await axios.post("/ad/create-user", form);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur lors de la création.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex justify-center p-6">
        <Card title="Créer un nouvel utilisateur AD" className="w-full md:w-1/2 shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label>Nom complet</label>
              <InputText
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full"
                placeholder="Ex: Mohamed Bensalem"
              />
            </div>
            <div>
              <label>Nom d’utilisateur (SamAccountName)</label>
              <InputText
                name="sam"
                value={form.sam}
                onChange={handleChange}
                className="w-full"
                placeholder="Ex: mbensalem"
              />
            </div>
            <div>
              <label>Email</label>
              <InputText
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full"
                placeholder="Ex: mbensalem@sarpi-dz.com"
              />
            </div>
            <div>
              <label>Mot de passe</label>
              <InputText
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full"
                placeholder="Ex: S@rpi2026"
              />
            </div>
            <div>
              <label>Chemin OU (Organizational Unit)</label>
              <InputText
                name="ou_path"
                value={form.ou_path}
                onChange={handleChange}
                className="w-full"
                placeholder="Ex: OU=OuTempUsers,DC=sarpi-dz,DC=sg"
              />
            </div>

            <Button type="submit" label={loading ? "Création..." : "Créer"} loading={loading} />
            {message && (
              <p className="mt-3 text-center text-sm text-green-600">{message}</p>
            )}
          </form>
        </Card>
      </div>
    </Layout>
  );
}