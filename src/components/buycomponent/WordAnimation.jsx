import { motion } from "framer-motion";

export default function WordAnimation({ text, className = "" }) {
  return (
    <motion.div
      key={text}
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={{
        visible: { transition: { staggerChildren: 0.04 } },
        hidden: { transition: { staggerChildren: 0.02 } },
      }}
      className={`flex flex-wrap ${className}`}
    >
      {text.split(" ").map((word, i) => (
        <motion.span
          key={word + i}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.3, ease: "easeOut" },
            },
          }}
          className="mr-2 md:mr-3 inline-block"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}
