import { useRef } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { InputText } from "primereact/inputtext";

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Mettre à jour le mot de passe</h2>

                <p className="mt-1 text-sm text-gray-600">
                    Assurez-vous que votre compte utilise un mot de passe long et aléatoire pour rester sécurisé.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-4 space-y-6">
                <div className="mb-3">
                    <label htmlFor="current_password" className="block text-900 font-medium mb-2">Mot de passe actuel</label>
                    <InputText
                        id="current_password"
                        type="password"
                        placeholder="Mot de passe actuel"
                        className="w-full"
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                    />
                    <InputError message={errors.current_password}/>
                </div>

                <div className="mb-3">
                    <InputLabel htmlFor="password" value="Nouveau mot de passe" />
                    <InputText
                        id="password"
                        ref={passwordInput}
                        type="password"
                        placeholder="Mot de passe"
                        className="w-full"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password}/>
                </div>

                <div className="mb-3">
                    <InputLabel htmlFor="password_confirmation" value="Confirmer le mot de passe" />

                    <InputText
                        id="password_confirmation"
                        type="password"
                        placeholder="Confirmer le mot de passe"
                        className="w-full"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                    />

                    <InputError message={errors.password_confirmation}/>
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Enregistrer</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">Enregistré.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
