import React from "react";
// import background from "../../../assets/Background/bg-1.png";
import { FaRegSquareCheck, FaMapLocationDot, FaTruckPickup  } from "react-icons/fa6";

const CityBenefits = () => {
  return (
    <div className="bg-darkGrey2 rounded-lg px-4 sm:px-6 md:px-8 pt-6 pb-2 mx-auto max-w-[95%] sm:max-w-3xl md:max-w-4xl overflow-hidden my-6">
      <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 text-center text-[#faffa4]">
        
        <div>
          {/* <img
            src="/images/self-pickup.png"
            alt="Self Pickup"
            className="mx-auto mb-4 w-20 md:w-24"
          /> */}
          <FaTruckPickup className="text-3xl sm:text-4xl md:text-5xl mx-auto mb-4 opacity-90" />
          <h3 className="text-base md:text-lg font-semibold opacity-90">
            Self PickUp Or Get it Delivered
          </h3>
        </div>

        <div>
          <FaMapLocationDot className="text-3xl sm:text-4xl md:text-5xl mx-auto mb-4 opacity-90" />
          <h3 className="text-base md:text-lg font-semibold opacity-90">
            2000+ Locations in 59 Cities
          </h3>
        </div>

        <div>
          <FaRegSquareCheck className="text-3xl sm:text-4xl md:text-5xl mx-auto mb-4 opacity-90" />
          <h3 className="text-base md:text-lg font-semibold opacity-90">
            Select from Limited Or Unlimited Kms Packages
          </h3>
        </div>
        
      </div>
    </div>
  );
};

export default CityBenefits;
