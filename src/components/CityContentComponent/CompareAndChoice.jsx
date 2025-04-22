import React from "react";
import { FaHandPointer, FaCar, FaWallet } from "react-icons/fa";

const CompareAndChoice = () => {
    return (
        <>
            <h2 className="text-center text-xl font-semibold mb-6 text-white">
                Compare & Choose
            </h2>

            <div className="bg-darkGrey2 rounded-md px-4 sm:px-6 md:px-8 py-8 mx-auto max-w-[95%] sm:max-w-3xl md:max-w-4xl overflow-hidden">
               
                {/* <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-purple-100 to-white/60 opacity-50 rounded-xl"></div> */}

                <div className="relative grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-12 text-[#faffa4] text-center">
                    <div>
                        <FaHandPointer className="text-4xl md:text-3xl mx-auto mb-3" />
                        <h3 className="text-base md:text-md font-semibold">Compare and Choose</h3>
                    </div>

                    <div>
                        <FaCar className="text-4xl md:text-3xl mx-auto mb-3" />
                        <h3 className="text-base md:text-md font-semibold">Flexible Options</h3>
                    </div>

                    <div>
                        <FaWallet className="text-4xl md:text-3xl mx-auto mb-3" />
                        <h3 className="text-base md:text-md font-semibold">Easy to Use</h3>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CompareAndChoice;
