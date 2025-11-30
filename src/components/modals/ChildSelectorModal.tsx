import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useAppStore } from '../../store/useAppStore';

interface ChildSelectorModalProps {
  isOpen: boolean;
  onSelect: (childId: string) => void;
}

const ChildSelectorModal = ({ isOpen, onSelect }: ChildSelectorModalProps) => {
  const { children } = useAppStore();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-base-200/95 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold leading-6 text-primary text-center mb-8"
                >
                  Who is playing?
                </Dialog.Title>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => onSelect(child.id)}
                      className="flex flex-col items-center p-6 rounded-xl border-2 border-transparent hover:border-primary hover:bg-base-100 transition-all group"
                    >
                      <div className="avatar mb-4">
                        <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 group-hover:scale-110 transition-transform">
                          <img src={child.avatar} alt={child.name} />
                        </div>
                      </div>
                      <span className="text-xl font-bold text-gray-700 group-hover:text-primary">
                        {child.name}
                      </span>
                      <span className="text-sm text-gray-500 mt-1">
                        {child.balance} Stars
                      </span>
                    </button>
                  ))}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ChildSelectorModal;

