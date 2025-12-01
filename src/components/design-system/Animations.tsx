import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

// 1. Page Transition Wrapper
export const PageTransition = ({ children, className = '' }: { children: ReactNode, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

// 2. Staggered Container (for lists)
export const StaggerContainer = ({ children, className = '' }: { children: ReactNode, className?: string }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.08
        }
      }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// 3. Stagger Item (child of StaggerContainer)
export const StaggerItem = ({ children, className = '' }: { children: ReactNode, className?: string }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 15 },
      visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// 4. Scale on Tap Button
export const ScaleButton = ({ children, onClick, className = '', disabled = false, type = 'button' }: any) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
    onClick={onClick}
    disabled={disabled}
    type={type}
    className={className}
  >
    {children}
  </motion.button>
);

