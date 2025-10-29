import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import Layout from "@/Layouts/layout/layout.jsx";

export default function Ping({ address, result }) {
  const { data, setData, post, processing } = useForm({
    address: address || '',
  });

  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!data.address.trim()) {
      setError('Veuillez entrer une adresse IP ou un domaine');
      return;
    }
    
    post(route('ping.execute'));
  };

  return (
    <Layout>
      <div className="grid">
        <div className="col-12">
          <Card className="shadow-2" style={{ minHeight: '600px' }}>
            <div className="flex align-items-center justify-content-between mb-5">
              <h2 className="text-900 font-bold m-0" style={{ fontSize: '2rem' }}>
                <i className="pi pi-wifi mr-3 text-primary" style={{ fontSize: '2rem' }}></i>
                Outil de Ping
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="mb-5">
              <div className="p-inputgroup" style={{ height: '60px' }}>
                <span className="p-inputgroup-addon">
                  <i className="pi pi-globe" style={{ fontSize: '1.5rem' }}></i>
                </span>
                <InputText
                  type="text"
                  name="address"
                  placeholder="Entrez une adresse IP ou un domaine (ex: google.com ou 8.8.8.8)"
                  value={data.address}
                  onChange={(e) => setData('address', e.target.value)}
                  className="w-full"
                  style={{ fontSize: '1.1rem', padding: '1.2rem' }}
                  disabled={processing}
                />
                <Button
                  type="submit"
                  label="Ping"
                  icon="pi pi-send"
                  loading={processing}
                  className="p-button-primary"
                  style={{ fontSize: '1.1rem', padding: '1.2rem 2rem' }}
                />
              </div>

              {error && (
                <Message severity="error" text={error} className="mt-3 w-full" style={{ fontSize: '1rem' }} />
              )}
            </form>

            {result && (
              <div className="mt-5">
                <div className="flex align-items-center justify-content-between mb-4">
                  <h3 className="text-900 font-semibold m-0" style={{ fontSize: '1.5rem' }}>
                    <i className="pi pi-chart-line mr-2 text-green-500" style={{ fontSize: '1.5rem' }}></i>
                    Résultat du ping
                  </h3>
                 
                </div>

                <div className="border-round overflow-hidden" style={{ border: '2px solid #dee2e6' }}>
                  <textarea
                    readOnly
                    value={result.replace(/<br\s*\/?>/g, '\n')}
                    className="w-full border-none"
                    style={{
                      height: '500px',
                      background: '#1e1e1e',
                      color: '#00ff00',
                      fontFamily: 'Consolas, Monaco, monospace',
                      padding: '2rem',
                      fontSize: '15px',
                      lineHeight: '1.8',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div className="mt-4 p-4 surface-100 border-round">
                  <div className="grid">
                    <div className="col-12 md:col-4">
                      <div className="flex align-items-center">
                        <i className="pi pi-check-circle text-green-500 mr-2" style={{ fontSize: '1.3rem' }}></i>
                        <span className="text-600" style={{ fontSize: '1rem' }}>Ping exécuté avec succès</span>
                      </div>
                    </div>
                    <div className="col-12 md:col-4">
                      <div className="flex align-items-center">
                        <i className="pi pi-server mr-2 text-blue-500" style={{ fontSize: '1.3rem' }}></i>
                        <span className="text-600" style={{ fontSize: '1rem' }}>Cible: {data.address}</span>
                      </div>
                    </div>
                    <div className="col-12 md:col-4">
                      <div className="flex align-items-center">
                        <i className="pi pi-clock mr-2 text-orange-500" style={{ fontSize: '1.3rem' }}></i>
                        <span className="text-600" style={{ fontSize: '1rem' }}>
                          {new Date().toLocaleTimeString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}