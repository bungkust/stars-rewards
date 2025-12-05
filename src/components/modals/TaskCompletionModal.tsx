import React from 'react';
import { Dialog } from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaStar } from 'react-icons/fa';
import { PrimaryButton } from '../design-system/PrimaryButton';

interface TaskCompletionModalProps {
  isOpen: boolean;
  taskName: string;
  rewardValue: number;
  onClose: () => void;
}

const TaskCompletionModal: React.FC<TaskCompletionModalProps> = ({ isOpen, taskName, rewardValue, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          static
          open={true}
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative z-50"
          onClose={onClose}
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Dialog.Panel
                as={motion.div}
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: 0,
                  transition: { type: 'spring', damping: 15, stiffness: 200 }
                }}
                className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-8 text-center align-middle shadow-2xl"
              >
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                      className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center"
                    >
                      <FaStar className="w-12 h-12 text-warning" />
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: 'spring' }}
                      className="absolute -bottom-2 -right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full"
                    >
                      +{rewardValue}
                    </motion.div>
                  </div>
                </div>

                <Dialog.Title as="h2" className="text-2xl font-bold text-gray-800 mb-2">
                  Good Job!
                </Dialog.Title>
                <p className="text-gray-500 mb-6">
                  You finished <span className="font-bold text-primary">"{taskName}"</span>.
                  <br />
                  Ask your parent to approve it to get your stars!
                </p>

                <PrimaryButton onClick={onClose} className="rounded-xl text-lg">
                  Okay, Got it!
                </PrimaryButton>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default TaskCompletionModal;

