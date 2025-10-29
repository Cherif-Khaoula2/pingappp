import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { Dialog } from 'primereact/dialog';
import Layout from "@/Layouts/layout/layout.jsx";

export default function Ping({ address, result, options }) {
  const { data, setData, post, processing } = useForm({
    address: address || '',
    resolve: options?.resolve || false,
  });

  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);
  const [pingResult, setPingResult] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!data.address.trim()) {
      setError('Veuillez entrer une adresse IP ou un domaine.');
      return;
    }

    // Simulation du ping avec Inertia (adapter selon ton backend)
    post(route('ping.execute'), {
      preserveScroll: true,
      onSuccess: (page) => {
        // Récupère le résultat envoyé par le backend
        setPingResult(page.props.result);
        setVisible(true); // Ouvre le dialog
      },
      onError: () => setError('Erreur lors de l’exécution du ping.'),
    });
  };

  const footerContent = (
    <div className="flex justify-content-end">
      <Button
        label="Fermer"
        onClick={() => setVisible(false)}
        autoFocus
      />
    </div>
  );

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

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="p-fluid mb-5">
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

              {error && <Message severity="error" text={error} className="mb-3" />}
            </form>

            {/* Infos affichées si un résultat existe */}
            {result && (
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
            )}
          </Card>
        </div>
      </div>

      {/* Dialog pour afficher le résultat du ping */}
      <Dialog
        header="Résultat du Ping"
        visible={visible}
        style={{ width: '60vw', maxWidth: '800px' }}
        modal
        className="p-fluid"
        onHide={() => setVisible(false)}
        footer={footerContent}
      >
        <div
          style={{
            backgroundColor: '#f9f9f9',
            color: '#333',
            padding: '1.5rem',
            borderRadius: '8px',
            maxHeight: '60vh',
            overflowY: 'auto',
            fontFamily: 'Roboto, sans-serif',
            lineHeight: '1.6',
            fontSize: '15px',
          }}
        >
          {pingResult
            ? pingResult.replace(/<br\s*\/?>/g, '\n')
            : 'Aucun résultat disponible.'}
        </div>
      </Dialog>
    </Layout>
  );
}
