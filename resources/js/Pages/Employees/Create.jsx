import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function Create() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    department: ''
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    router.post('/employees', form);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Créer un nouvel employé</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" 
          name="first_name" 
          placeholder="Prénom" 
          value={form.first_name} 
          onChange={handleChange} 
          className="w-full p-2 border rounded" 
          required
        />
        <input 
          type="text" 
          name="last_name" 
          placeholder="Nom" 
          value={form.last_name} 
          onChange={handleChange} 
          className="w-full p-2 border rounded" 
          required
        />
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          value={form.email} 
          onChange={handleChange} 
          className="w-full p-2 border rounded" 
          required
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Mot de passe temporaire" 
          value={form.password} 
          onChange={handleChange} 
          className="w-full p-2 border rounded" 
          required
        />
        <input 
          type="text" 
          name="department" 
          placeholder="Direction" 
          value={form.department} 
          onChange={handleChange} 
          className="w-full p-2 border rounded" 
          required
        />
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Créer
        </button>
      </form>
    </div>
  );
}