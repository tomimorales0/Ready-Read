import { AnimatePresence, motion } from "framer-motion";

interface TutorialOverlayProps {
  isActive: boolean;
}

export function TutorialOverlay({ isActive }: TutorialOverlayProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-40 pointer-events-auto bg-black/60 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden="true"
        />
      )}
    </AnimatePresence>
  );
}
