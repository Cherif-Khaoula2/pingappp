import React from 'react';
import { useForm } from '@inertiajs/react';

export default function Ping({ address, result }) {
  const { data, setData, post } = useForm({
    address: address || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('ping.execute'));
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f2f2f2',
      minHeight: '100vh',
      padding: '40px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '20px',
        width: '600px',
        margin: 'auto',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ textAlign: 'center' }}>Outil de Ping</h2>

        <form onSubmit={handleSubmit} style={{ textAlign: 'center', marginBottom: '20px' }}>
          <input
            type="text"
            name="address"
            placeholder="Entrez une adresse IP ou un domaine"
            value={data.address}
            onChange={(e) => setData('address', e.target.value)}
            style={{
              width: '80%',
              padding: '8px',
              fontSize: '16px',
              marginRight: '8px'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              fontSize: '16px',
              backgroundColor: '#007BFF',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '5px'
            }}
          >
            Ping
          </button>
        </form>

        {result && (
          <div>
            <h3>Résultat du ping :</h3>
            <textarea
              readOnly
              value={result.replace(/<br\s*\/?>/g, '\n')}
              style={{
                width: '100%',
                height: '250px',
                background: '#000',
                color: '#0f0',
                fontFamily: 'monospace',
                border: 'none',
                padding: '10px',
                resize: 'none'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
