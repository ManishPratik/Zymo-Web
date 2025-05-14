import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MorphingText from "./MorphingText";
import WordAnimation from "./WordAnimation";

const steps = [
  {
    title: "Rent an EV",
    desc: "Start your EV journey by renting a vehicle for a few days. Experience the feel, features, and form factor without any commitment.",
  },
  {
    title: "Live with it",
    desc: "Drive it like you own it - daily commutes, grocery runs, weekend plans. See how seamlessly an EV fits into your lifestyle.",
  },
  {
    title: "Drive it",
    desc: "Test the EV on real roads, not just test tracks. Assess acceleration, handling, ride comfort, and cabin tech on your terms.",
  },
  {
    title: "Charge it",
    desc: "Experience firsthand how and where to charge. Understand charging times, range planning, and the actual ease of living electric.",
  },
  {
    title: "Get performance data",
    desc: "Receive personalized insights based on your driving habits — efficiency, battery usage, costs saved, and carbon footprint reduced.",
  },
  {
    title: "Apply rental credits",
    desc: "Loved it? Redeem a portion of your rental fees as credits towards your EV purchase. Zymo rewards real-world trials.",
  },
  {
    title: "Purchase EV",
    desc: "Buy with full confidence. You've driven, lived, and tested it — now make it yours, knowing exactly what you're getting into.",
  },
];

export default function TestOwnership() {
  const [index, setIndex] = useState(0);
  const isFinalStep = index >= steps.length - 1;

  useEffect(() => {
    const delay = isFinalStep ? 6000 : 4000;
    const timer = setTimeout(() => {
      const nextIndex = isFinalStep ? 0 : index + 2;
      setIndex(nextIndex);
    }, delay);
    return () => clearTimeout(timer);
  }, [index, isFinalStep]);

  const current = steps[index];
  const next = steps[index + 1];

  return (
    <div className="relative h-screen w-full bg-[#212121] text-white px-10 sm:px-20 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className={`w-full max-w-[1200px] ${
            isFinalStep
              ? "flex flex-col items-center justify-center text-center gap-6"
              : "flex flex-col items-center gap-10 -mt-20"
          }`}
        >
          {isFinalStep ? (
            (() => {
              const final = steps[steps.length - 1];
              return (
                <div className="flex flex-col items-center justify-center text-center -mt-32">
                  <span className="lg:text-2xl tracking-widest text-appColor font-semibold">07</span>
                  <MorphingText
                    text={final.title}
                    className="text-4xl lg:text-7xl font-extrabold bg-gradient-to-r from-appColor to-yellow-500 bg-clip-text text-transparent"
                  />
                  <WordAnimation
                    text={final.desc}
                    className="text-base lg:text-xl max-w-2xl mt-4 text-white justify-center"
                  />
                </div>
              );
            })()
          ) : (
            <>
              <div className="flex flex-col lg:absolute top-16 left-52">
                <span className="lg:text-lg text-white">0{index + 1}</span>
                <WordAnimation text={current.title} className="lg:text-6xl text-[2rem] font-bold lg:mb-10 mb-5 leading-9" />
                <WordAnimation text={current.desc} className="lg:text-xl text-base max-w-md" />
              </div>
              {next && (
                <div className="flex flex-col lg:absolute bottom-44 right-60">
                  <span className="lg:text-lg text-white">0{index + 2}</span>
                  <WordAnimation text={next.title} className="lg:text-6xl text-[2rem] font-bold lg:mb-10 mb-5 leading-9" />
                  <WordAnimation text={next.desc} className="lg:text-xl text-base max-w-md" />
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
