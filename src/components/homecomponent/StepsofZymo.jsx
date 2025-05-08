import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const steps = [
  {
    title: "Getting Started",
    text: "The user logs into Zymo, enters source, and time. Zymo shows a list of rental cars, enabling easy comparison by price, type, and features.",
    image: "/images/Steps/image1.png",
  },
  {
    title: "Choosing & Confirming Booking",
    text: "The user selects the best-fit car after comparing options. Key details are shown before confirming the booking.",
    image: "/images/Steps/image2.png",
  },
  {
    title: "Payment & Confirmation",
    text: "Payment is completed securely. Booking confirmation is sent instantly via email and WhatsApp.",
    image: "/images/Steps/image3.png",
  },
  {
    title: "Car Usage & Return",
    text: "The user picks up the car, uses it during the booked time, and returns it hassle-free.",
    image: "/images/Steps/image4.png",
  },
  {
    title: "Providing Feedback",
    text: "After the trip, the user rates the service and shares feedback, helping others choose better.",
    image: "/images/Steps/image5.png",
  },
];

export default function StepsofZymo() {
  const timelineRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start center', 'end end'],
  });

  const trackerY = useTransform(scrollYProgress, [0, 1], ['0%', '90%']);
  const trackerHeight = useTransform(scrollYProgress, [0, 1], ['0%', '90%']);

  return (
    <div className="bg-[#212121] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center">A quick guide to ZYMO</h2>
        <p className="text-gray-400 text-center mb-12">Here's how the Zymo works, step by step:</p>

        <div className="relative" ref={timelineRef}>
          {/* Timeline Line (background) */}
          <div className="absolute top-0 sm:bottom-[7.5rem] bottom-[11rem] w-1 bg-[#424242] 
              left-0 sm:left-1/2 transform sm:-translate-x-1/2 z-0" />

          {/* Trail behind the moving circle */}
          <motion.div
            className="absolute w-1 bg-[#faffa4] left-0 sm:left-1/2 transform sm:-translate-x-1/2 origin-top rounded z-0"
            style={{ height: trackerHeight }}
          />

          {/* Moving circle */}
          <motion.div
            className="w-4 h-4 bg-[#faffa4] rounded-full border-2 border-[#212121] absolute
              left-0 -translate-x-[6px] sm:left-1/2 sm:-translate-x-1/2 z-10"
            style={{ top: trackerY }}
          />

          <div className="flex flex-col sm:gap-5 gap-12">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={index}
                  className="relative flex flex-col sm:flex-row items-center sm:items-start"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  viewport={{ once: true }}
                >
                  {isEven ? (
                    <>
                      {/* Text left */}
                      <div className="max-w-72 sm:max-w-full sm:w-1/2 sm:pr-10 order-2 sm:order-1 sm:text-left sm:pt-10 pt-5">
                        <h3 className="text-xl font-bold mb-2 sm:text-right text-center text-[#fffef5]">{step.title}</h3>
                        <p className="sm:text-right text-center text-[#bdbdc8]">{step.text}</p>
                      </div>

                      {/* Image right */}
                      <motion.div
                        className="w-full sm:w-1/2 sm:pl-10 order-1 sm:order-2 flex justify-center sm:justify-start"
                        initial={{ scale: 0.95 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.4 }}
                        viewport={{ once: true }}
                      >
                        <img
                          src={step.image}
                          alt={step.title}
                          className="w-full sm:max-w-[300px] max-w-[250px] h-[200px] sm:h-[250px] rounded object-contain"
                        />
                      </motion.div>
                    </>
                  ) : (
                    <>
                      {/* Image left */}
                      <motion.div
                        className="w-full sm:w-1/2 sm:pr-10 flex justify-center sm:justify-end"
                        initial={{ scale: 0.95 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.4 }}
                        viewport={{ once: true }}
                      >
                        <img
                          src={step.image}
                          alt={step.title}
                          className="w-full sm:max-w-[300px] max-w-[200px] sm:h-[250px] rounded object-contain"
                        />
                      </motion.div>

                      {/* Text right */}
                      <div className="max-w-72 sm:max-w-full sm:w-1/2 sm:pl-10 sm:pt-10 pt-5">
                        <h3 className="text-xl font-bold mb-2 sm:text-left text-center text-[#fffef5]">{step.title}</h3>
                        <p className="text-[#bdbdc8] sm:text-left text-center">{step.text}</p>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
