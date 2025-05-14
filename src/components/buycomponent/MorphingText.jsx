import { motion, AnimatePresence } from "framer-motion";

export default function MorphingText({ text, className }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={text}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.03 } },
          exit: { transition: { staggerChildren: 0.03 } },
        }}
        className={`flex space-x-1 ${className}`}
      >
        {text.split("").map((char, i) => (
          <motion.span
            key={char + i}
            variants={{
              hidden: { opacity: 0, scaleY: 0, y: 20 },
              visible: { opacity: 1, scaleY: 1, y: 0, transition: { duration: 0.3 } },
              exit: { opacity: 0, scaleY: 0, y: -20, transition: { duration: 0.2 } },
            }}
            className="inline-block origin-bottom"
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
