import { useRef, useState } from 'react';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import SecondaryButton from '@/Components/SecondaryButton';
import { useForm } from '@inertiajs/react';
import { Dialog } from 'primereact/dialog';
import { InputText } from "primereact/inputtext";

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        reset();
    };

    const DialogHeaderContent = (
        <h2 className="text-lg font-medium text-gray-900 pl-4 pt-2 mb-0">
            Êtes-vous sûr de vouloir supprimer votre compte ?
        </h2>
    );

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Supprimer le compte</h2>

                <p className="mt-1 text-sm text-gray-600">
                    Une fois votre compte supprimé, toutes ses ressources et données seront définitivement supprimées. Avant de supprimer votre compte, veuillez télécharger toutes les données ou informations que vous souhaitez conserver.
                </p>
            </header>

            <DangerButton onClick={confirmUserDeletion} className="mt-2">Supprimer le compte</DangerButton>

            <Dialog
                className="px-6"
                header={DialogHeaderContent}
                visible={confirmingUserDeletion}
                style={{ width: '50vw' }}
                onHide={() => setConfirmingUserDeletion(false)}
            >
                <form onSubmit={deleteUser} className="px-4">
                    <p className="mt-1 text-sm text-gray-600">
                        Une fois votre compte supprimé, toutes ses ressources et données seront définitivement supprimées. Veuillez entrer votre mot de passe pour confirmer que vous souhaitez supprimer définitivement votre compte.
                    </p>

                    <div className="mt-4">
                        <InputLabel htmlFor="password" value="Mot de passe" className="sr-only" />

                        <InputText
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="mt-1 block w-3/4"
                            isFocused
                            placeholder="Mot de passe"
                        />

                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>Annuler</SecondaryButton>

                        <DangerButton className="ml-3" disabled={processing}>
                            Supprimer le compte
                        </DangerButton>
                    </div>
                </form>
            </Dialog>
        </section>
    );
}
