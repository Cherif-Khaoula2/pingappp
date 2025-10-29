import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import Layout from "@/Layouts/layout/layout.jsx";

export default function Ping({ address, result, options }) {
  const { data, setData, post, processing } = useForm({
    address: address || '',
    count: options?.count || 4,
    timeout: options?.timeout || 3000,
    ip_version: options?.ip_version || '4',
    resolve: options?.resolve || false,
  });

  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!data.address.trim()) {
      setError('Veuillez entrer une adresse IP ou un domaine.');
      return;
    }

    post(route('ping.execute'), { preserveScroll: true });
  };

  const ipOptions = [
    { label: 'IPv4', value: '4' },
    { label: 'IPv6', value: '6' }
  ];
console.log(data)
  return (
    <Layout>
      <div className="grid">
        <div className="col-12">
          <Card className="shadow-2" style={{ minHeight: '700px' }}>
            <div className="flex align-items-center justify-content-between mb-5">
              <h2 className="text-900 font-bold m-0" style={{ fontSize: '2rem' }}>
                <i className="pi pi-wifi mr-3 text-primary" style={{ fontSize: '2rem' }}></i>
                Outil de Ping Avancé
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-fluid mb-5">
              {/* Champ adresse */}
              <div className="p-inputgroup mb-3">
                <span className="p-inputgroup-addon">
                  <i className="pi pi-globe" style={{ fontSize: '1.5rem' }}></i>
                </span>
                <InputText
                  placeholder="Ex : google.com ou 8.8.8.8"
                  value={data.address}
                  onChange={(e) => setData('address', e.target.value)}
                  disabled={processing}
                />
                <Button
                  type="submit"
                  label="Ping"
                  icon="pi pi-send"
                  loading={processing}
                  className="p-button-primary"
                />
              </div>

              {/* Erreur */}
              {error && (
                <Message severity="error" text={error} className="mb-3" />
              )}

              {/* Options avancées */}
              <div className="grid p-3 surface-100 border-round">
                <div className="col-12 md:col-3">
                  <label className="block text-900 font-medium mb-2">Paquets</label>
                  <InputNumber
                    value={data.count}
                    onValueChange={(e) => setData('count', e.value)}
                    min={1}
                    max={10}
                    showButtons
                    disabled={processing}
                  />
                </div>

                <div className="col-12 md:col-3">
                  <label className="block text-900 font-medium mb-2">Timeout (ms)</label>
                  <InputNumber
                    value={data.timeout}
                    onValueChange={(e) => setData('timeout', e.value)}
                    min={100}
                    max={10000}
                    step={100}
                    showButtons
                    disabled={processing}
                  />
                </div>

                <div className="col-12 md:col-3">
                  <label className="block text-900 font-medium mb-2">Version IP</label>
                  <Dropdown
                    options={ipOptions}
                    value={data.ip_version}
                    onChange={(e) => setData('ip_version', e.value)}
                    disabled={processing}
                  />
                </div>

                <div className="col-12 md:col-3 flex align-items-center">
                  <Checkbox
                    inputId="resolve"
                    checked={data.resolve}
                    onChange={(e) => setData('resolve', e.checked)}
                    disabled={processing}
                  />
                  <label htmlFor="resolve" className="ml-2">Résoudre le nom d’hôte</label>
                </div>
              </div>
            </form>

            {/* Résultat */}
            {result && (
              <div className="mt-5">
                <h3 className="text-900 font-semibold mb-3" style={{ fontSize: '1.5rem' }}>
                  <i className="pi pi-chart-line mr-2 text-green-500"></i>
                  Résultat du ping
                </h3>

                <div className="border-round overflow-hidden" style={{ border: '2px solid #dee2e6' }}>
                  <textarea
                    readOnly
                    value={result.replace(/<br\s*\/?>/g, '\n')}
                    className="w-full border-none"
                    style={{
                      height: '400px',
                      background: '#1e1e1e',
                      color: '#00ff00',
                      fontFamily: 'Consolas, Monaco, monospace',
                      padding: '1.5rem',
                      fontSize: '15px',
                      lineHeight: '1.6',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Infos complémentaires */}
                <div className="mt-4 p-4 surface-100 border-round">
                  <div className="grid">
                    <div className="col-12 md:col-4">
                      <div className="flex align-items-center">
                        <i className="pi pi-check-circle text-green-500 mr-2"></i>
                        <span className="text-600">Ping exécuté avec succès</span>
                      </div>
                    </div>
                    <div className="col-12 md:col-4">
                      <div className="flex align-items-center">
                        <i className="pi pi-server mr-2 text-blue-500"></i>
                        <span className="text-600">Cible : {data.address}</span>
                      </div>
                    </div>
                    <div className="col-12 md:col-4">
                      <div className="flex align-items-center">
                        <i className="pi pi-clock mr-2 text-orange-500"></i>
                        <span className="text-600">{new Date().toLocaleTimeString('fr-FR')}</span>
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
