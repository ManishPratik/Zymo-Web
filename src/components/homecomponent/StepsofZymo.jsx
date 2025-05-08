import React from 'react';

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
]

export default function StepsofZymo() {
  return (
    <div>
      <div className="bg-[#212121] text-white p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center">
            A quick guide to ZYMO
          </h2>
          <p className="text-gray-400 mb-8 text-center">
            Here's how the Zymo works, step by step:
          </p>

          <div className="relative flex flex-col items-center mt-16">
            <div className="w-1 bg-gray-300 absolute top-0 bottom-0 sm:left-1/2  left-0 transform -translate-x-1/2 "></div>
            {
              steps.map((step, index) => {
              const isEven = index % 2 === 0;

                return (
                  <div key={index} className="w-full relative mb-12">

                    <div className="absolute left-0 sm:left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full border-2 border-[#212121]"></div>

                    <div className="hidden sm:flex items-center justify-between w-full">
                      {isEven ? (
                        <>
                          
                          <div className="w-1/2 pr-10 text-right pb-10">
                            <h3 className="font-semibold text-lg">{step.title}</h3>
                            <p className="text-gray-300">{step.text}</p>
                          </div>
                          
                          <div className="w-1/2 pl-10">
                            <img
                              src={step.image}
                              alt={step.title}
                              className="w-full max-w-[250px] h-auto rounded object-contain"
                              style={{ maxHeight: '200px' }}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-1/2 pr-10 flex justify-end">
                            <img
                              src={step.image}
                              alt={step.title}
                              className="w-full max-w-[250px] h-auto rounded object-contain"
                              style={{ maxHeight: '200px' }}
                            />
                          </div>
                          
                          <div className="w-1/2 pl-10 text-left pb-10">
                            <h3 className="font-semibold text-lg">{step.title}</h3>
                            <p className="text-gray-300">{step.text}</p>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="flex sm:hidden relative">
                      
                      <div className="flex flex-col items-center mr-4">
                      </div>
                      
                      <div className="flex flex-col bg-[#2a2a2a] p-8 mx-5 rounded-xl w-full">
                        <img
                          src={step.image}
                          alt={step.title}
                          className="w-full h-auto rounded mb-2 object-contain"
                          style={{ maxHeight: '200px' }}
                        />
                        <h3 className="font-semibold text-lg my-2 text-center">{step.title}</h3>
                        <p className="text-gray-300 text-sm text-center">{step.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

          </div>
        </div>
      </div>
    </div>
  );
}
