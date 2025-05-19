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
  const [stepPairIndex, setStepPairIndex] = useState(0);
  const [showSecondStep, setShowSecondStep] = useState(false);
  const [cycle, setCycle] = useState(0);
  const isFinalStep = stepPairIndex >= steps.length - 1;

  useEffect(() => {
    const timer1 = setTimeout(() => {
      if (!isFinalStep) {
        setShowSecondStep(true);
      }
    }, 2000); 

    const timer2 = setTimeout(() => {
      setShowSecondStep(false);
      if (stepPairIndex + 2 >= steps.length) {
        setStepPairIndex(0);
        setCycle(cycle => cycle + 1);
      } else {
        setStepPairIndex(stepPairIndex + 2);
      }
    }, 4000);
    

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [stepPairIndex]);

  const current = steps[stepPairIndex];
  const next = steps[stepPairIndex + 1];

  return (
    <div className="relative h-screen w-full bg-[#212121] text-white px-10 sm:px-20 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${cycle} - ${stepPairIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
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
              {/* Mobile layout */}
              <div className="flex flex-col items-center w-full md:hidden">
                <motion.div layout className="flex flex-col items-center">
                  <span className="text-base text-white self-start">0{stepPairIndex + 1}</span>
                  <WordAnimation
                    text={current.title}
                    className="text-[2rem] font-bold mb-5 leading-9 self-start"
                  />
                  <WordAnimation
                    text={current.desc}
                    className="text-base max-w-md self-start"
                  />
                </motion.div>
                <AnimatePresence>
                  {showSecondStep && next && (
                    <motion.div
                      layout
                      key={stepPairIndex + 1}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 30 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="flex flex-col items-center mt-10"
                    >
                      <span className="text-base text-white self-start">0{stepPairIndex + 2}</span>
                      <WordAnimation
                        text={next.title}
                        className="text-[2rem] font-bold mb-5 leading-9 self-start"
                      />
                      <WordAnimation
                        text={next.desc}
                        className="text-base max-w-md self-start"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Desktop layout using Grid */}
              <motion.div
                layout
                className="hidden md:grid grid-cols-2 gap-x-10 w-full max-w-6xl mx-auto"
              >
                {/* Left */}
                <motion.div layout className="flex flex-col justify-start">
                  <span className="lg:text-lg text-white">0{stepPairIndex + 1}</span>
                  <WordAnimation
                    text={current.title}
                    className="lg:text-6xl text-[2rem] font-bold lg:mb-10 mb-5 leading-9"
                  />
                  <WordAnimation
                    text={current.desc}
                    className="lg:text-xl text-base max-w-md"
                  />
                </motion.div>

                {/* Right */}
                <motion.div
                  layout
                  animate={{ marginTop: showSecondStep ? 128 : 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="flex flex-col"
                >

                  {showSecondStep && next && (
                    <>
                      <span className="lg:text-lg text-white">0{stepPairIndex + 2}</span>
                      <WordAnimation
                        text={next.title}
                        className="lg:text-6xl text-[2rem] font-bold lg:mb-10 mb-5 leading-9"
                      />
                      <WordAnimation
                        text={next.desc}
                        className="lg:text-xl text-base max-w-md"
                      />
                    </>
                  )}
                </motion.div>
              </motion.div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
