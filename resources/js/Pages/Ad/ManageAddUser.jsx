import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Card } from "primereact/card";

export default function ManageAddUser() {
  const [form, setForm] = useState({
    name: "",
    sam: "",
    email: "",
    password: "",
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
    <div className="flex justify-center p-6">
      <Card title="Créer un nouvel utilisateur AD" className="w-full md:w-1/2 shadow-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label>Nom complet</label>
            <InputText name="name" value={form.name} onChange={handleChange} className="w-full" />
          </div>
          <div>
            <label>Nom d’utilisateur (SamAccountName)</label>
            <InputText name="sam" value={form.sam} onChange={handleChange} className="w-full" />
          </div>
          <div>
            <label>Email</label>
            <InputText name="email" value={form.email} onChange={handleChange} className="w-full" />
          </div>
          <div>
            <label>Mot de passe</label>
            <InputText type="password" name="password" value={form.password} onChange={handleChange} className="w-full" />
          </div>

          <Button type="submit" label={loading ? "Création..." : "Créer"} loading={loading} />
          {message && <p className="mt-3 text-center text-sm text-green-600">{message}</p>}
        </form>
      </Card>
    </div>
  );
}
