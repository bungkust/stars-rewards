import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useAppStore } from '../../store/useAppStore';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminPinModal = ({ isOpen, onClose }: AdminPinModalProps) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const { verifyPin } = useAppStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyPin(pin)) {
      setPin('');
      setError(false);
      onClose();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 text-center"
                >
                  Enter Admin PIN
                </Dialog.Title>
                <div className="mt-4">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className={`input input-bordered w-full text-center text-2xl tracking-widest ${error ? 'input-error' : 'input-primary'}`}
                      placeholder="• • • •"
                      autoFocus
                    />
                    {error && (
                      <p className="text-error text-sm text-center">Incorrect PIN. Try again.</p>
                    )}
                    <div className="mt-4 flex justify-center gap-2">
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={onClose}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={pin.length < 4}
                      >
                        Verify
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AdminPinModal;

