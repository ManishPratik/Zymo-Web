import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  calculateSelfDrivePrice,
  calculateDiscountPrice,
} from "../utils/mychoize";
import { Helmet } from "react-helmet-async";
import { collection, getDocs } from "firebase/firestore";
import { appDB } from "../utils/firebase";

const BookingCard = ({ title }) => {
  const location = useLocation();
  const { startDate, endDate, car, tripDuration } = location.state || {};
  const { city } = useParams();
  const navigate = useNavigate();
  const [vendorDetails, setVendorDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const isKaryana =
    car?.brand === "Karyana" || car?.source?.toLowerCase() === "karyana";
  const isZT = car?.brand?.toLowerCase() === "zt";
  const isMyChoize = car?.source === "mychoize";
  const isZymoPartner = car?.source === "Zymo";
  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        const vendorsSnapshot = await getDocs(collection(appDB, "carvendors"));
        const vendorData = vendorsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const selectedVendor = vendorData.find(
          (vendor) =>
           ( vendor.id?.toLowerCase() === (isKaryana ? "karyana" : car?.source?.toLowerCase())) || (vendor.id?.toLowerCase() === ("zt"))
        );
        if (selectedVendor) {
          setVendorDetails(selectedVendor);
        }
      } catch (error) {
        console.error("Error fetching vendor details:", error);
      }
      setLoading(false);
    };
    fetchVendorDetails();
  }, [car, isKaryana, isZT]);

  // Helper function to find package name based on rateBasis
  const findPackage = (rateBasis) => {
    switch (rateBasis) {
      case "FF":
        return "120KM Package";
      case "MP":
        return "300KM Package";
      case "DR":
        return "Unlimited Package";
      case "hourly":
        return "Hourly Package";
      default:
        return "Standard Package";
    }
  };

  const goToDetails = (selectedCar, index = null) => {
    if (!vendorDetails && !isZymoPartner) return;

    let updatedCar;

    if (isKaryana || isZT) {
      // For Karyana cars, we use the selected variation from the cars array
      const variation = car.cars[0].variations[index];

      updatedCar = {
        ...variation,
        taxRate: vendorDetails.TaxSd,
        currentRate: vendorDetails.CurrentrateSd,
        discountRate: vendorDetails.DiscountSd,
        packageName: findPackage(variation.rateBasis || "FF"),
      };
    } else if (isMyChoize) {
      // For MyChoize cars with rateBasisFare
      const rateBasis = selectedCar;
      const baseFare = car.rateBasisFare[rateBasis];
      const pickupDate = new Date(startDate);
      const isWeekend = pickupDate.getDay() === 0 || pickupDate.getDay() === 6;

      const finalPrice = calculateSelfDrivePrice(
        baseFare,
        vendorDetails,
        isWeekend
      );
      const discountPrice = calculateDiscountPrice(
        baseFare,
        vendorDetails,
        isWeekend
      );

      updatedCar = {
        ...car,
        taxRate: vendorDetails.TaxSd,
        currentRate: vendorDetails.CurrentrateSd,
        discountRate: vendorDetails.DiscountSd,
        finalPrice,
        discountPrice,
        packageName: findPackage(rateBasis),
        rateBasis: index,
      };
    } else {
      // For Zymo Partner cars
      updatedCar = {
        ...car,
        finalPrice: car.all_fares[index],
        discountPrice: car.all_fares[index],
        packageName: findPackage(car.rateBasis || "FF"),
        selectedPackage: index,
      };
    }

    navigate(`/self-drive-car-rentals/${city}/cars/booking-details`, {
      state: {
        startDate,
        endDate,
        car: updatedCar,
        tripDuration,
      },
    });
  };

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <>
      <Helmet>
        <title>Car Packages in {city} | Zymo</title>
        <meta
          name="description"
          content={`Explore car rental packages in ${city}. Choose the best self-drive rental deals with Zymo.`}
        />
        <meta property="og:title" content={title} />
        <meta
          property="og:description"
          content="Find the right package for your self-drive rental at the best prices."
        />
        <link
          rel="canonical"
          href={`https://zymo.app/self-drive-car-rentals/${city}/cars/packages`}
        />
      </Helmet>
      <button
        onClick={() => {
          sessionStorage.setItem("fromSearch", false);
          navigate(-1);
        }}
        className="text-white m-5 cursor-pointer"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      <div className="bg-[#212121] min-h-screen px-5 py-8 flex flex-col justify-center items-center">
        {!loading && vendorDetails ? (
          <>
            {/* Render MyChoize cars */}
            {isMyChoize &&
              car?.total_km &&
              typeof car.total_km === "object" &&
              Object.entries(car.total_km).map(([rateBasis, kms], index) => (
                <div
                  key={`mychoize-${index}`}
                  className="text-white flex flex-col items-center py-4 my-4 bg-[#303030] rounded-lg shadow-lg max-w-2xl w-full mx-auto"
                >
                  <div className="flex justify-between items-center w-full px-4 py-2">
                    <div className="flex flex-col">
                      <h1 className="text-xl font-semibold flex items-center gap-2">
                        Fulfilled by
                        <span className="text-2xl text-[#E8FF81]">
                          {vendorDetails?.vendor || "MyChoize"}
                        </span>
                      </h1>
                      <ul className="text-gray-200 space-y-1 mt-4">
                        {car.options &&
                          Array.isArray(car.options) &&
                          car.options.map((option, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-2 text-md"
                            >
                              <span>• {option}</span>
                            </li>
                          ))}
                        <li className="flex items-center gap-2 text-md">
                          <span>• {`Total KMs: ${kms}`}</span>
                        </li>
                        <li className="flex items-center gap-2 text-md">
                          <span>
                            •{" "}
                            {kms === "Unlimited KMs"
                              ? `No extra KM charge`
                              : `Extra KMs charged at ${
                                  car.extrakm_charge || "₹10/km"
                                }`}
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      <div className="text-xl font-bold text-white">
                        {`₹${calculateSelfDrivePrice(
                          car.rateBasisFare && car.rateBasisFare[rateBasis]
                            ? car.rateBasisFare[rateBasis]
                            : 0,
                          vendorDetails,
                          false
                        )}`}
                      </div>
                      <div className="text-md text-[#E8FF81]">
                        {findPackage(rateBasis)}
                      </div>
                      <button
                        onClick={() => goToDetails(car, rateBasis)}
                        className="bg-[#E8FF81] text-black font-bold text-md py-2 px-5 rounded-xl hover:bg-[#d7e46d] transition duration-300 ease-in-out"
                      >
                        Go to booking
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 text-[#E8FF81] font-normal text-md py-2 px-5 border border-[#E8FF81] rounded-lg">
                    Home Delivery Available
                  </div>
                </div>
              ))}

            {/* Render Karyana cars */}
            {(isKaryana || isZT) &&
              car?.cars &&
              Array.isArray(car.cars) &&
              car.cars[0].variations.map((variation, index) => {
                return (
                  <div
                    key={`karyana-${index}`}
                    className="text-white flex flex-col items-center py-4 my-4 bg-[#303030] rounded-lg shadow-lg max-w-2xl w-full mx-auto"
                  >
                    <div className="flex justify-between items-center w-full px-4 py-2">
                      <div className="flex flex-col">
                        <h1 className="text-xl font-semibold flex items-center gap-2">
                          Fulfilled by
                          <span className="text-2xl text-[#E8FF81]">
                            {vendorDetails?.vendor || "Karyana"}
                          </span>
                        </h1>
                        <ul className="text-gray-200 space-y-1 mt-4">
                          {variation.options &&
                            Array.isArray(variation.options) &&
                            variation.options.map((option, idx) => (
                              <li
                                key={idx}
                                className="flex items-center gap-2 text-md"
                              >
                                <span>• {option}</span>
                              </li>
                            ))}
                          <li className="flex items-center gap-2 text-md">
                            <span>
                              •{" "}
                              {`Total KMs: ${
                                variation.total_km?.FF || "350 KMs"
                              }`}
                            </span>
                          </li>
                          <li className="flex items-center gap-2 text-md">
                            <span>
                              • Extra KMs charged at{" "}
                              {variation.extrakm_charge || "10"}/km
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div className="flex flex-col items-center space-y-1">
                        <div className="text-xl font-bold text-white">
                          {variation.fare}
                        </div>
                        <div className="text-md text-[#E8FF81]">
                          {variation.total_km?.FF || "350"} Package
                        </div>
                        <button
                          onClick={() => goToDetails(null, index)}
                          className="bg-[#E8FF81] text-black font-bold text-md py-2 px-5 rounded-xl hover:bg-[#d7e46d] transition duration-300 ease-in-out mt-2"
                        >
                          Go to booking
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 text-[#E8FF81] font-normal text-md py-2 px-5 border border-[#E8FF81] rounded-lg">
                      Home Delivery Available
                    </div>
                  </div>
                );
              })}
          </>
        ) : (
          !isZymoPartner && (
            <div className="text-white text-center">
              <p>Loading car options...</p>
            </div>
          )
        )}

        {isZymoPartner &&
          car?.all_fares.map((fare, index) => {
            // console.log("Car Details:", index);
            return (
              <div
                key={`zymo-${index}`}
                className="text-white flex flex-col items-center py-4 my-4 bg-[#303030] rounded-lg shadow-lg max-w-2xl w-full mx-auto"
              >
                <div className="flex justify-between items-center w-full px-4 py-2">
                  <div className="flex flex-col">
                    <h1 className="text-xl font-semibold flex items-center gap-2">
                      Fulfilled by
                      <span className="text-2xl text-[#E8FF81]">
                        {car?.brand || "Zymo"}
                      </span>
                    </h1>
                    <ul className="text-gray-200 space-y-1 mt-4">
                      
                      {car.options &&
                        Array.isArray(car.options) &&
                        car.options.map((option, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-md"
                          >
                            <span>• {option}</span>
                          </li>
                        ))}
                      <li className="flex items-center gap-2 text-md">
                        <span>• {`Total KMs : ${car.total_km[index]}`}</span>
                      </li>
                      <li className="flex items-center gap-2 text-md">
                        <span>
                          • Extra KMs charged at {car?.extrahour_charge || "10"}
                          /km
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div className="flex flex-col items-center space-y-1">
                    <div className="text-xl font-bold text-white">
                      {car.all_fares[index]}
                    </div>
                    <div className="text-md text-[#E8FF81]">
                      Standard Package
                    </div>
                    <button
                      onClick={() => goToDetails(car, index)}
                      className="bg-[#E8FF81] text-black font-bold text-md py-2 px-5 rounded-xl hover:bg-[#d7e46d] transition duration-300 ease-in-out"
                    >
                      Go to booking
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
};

export default BookingCard;
