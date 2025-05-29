import { getVendorDetails, toPascalCase } from "./helperFunctions";

export const formatNumberAsPrice = (number) => {
  if (!number) return "0";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(number);
};

export const getTotalKms = (tripDurationHours) => {
  return {
    FF: `${(120 / 24) * tripDurationHours} KMs`, // Fixed Fare - 120 KM/Day
    MP: `${(300 / 24) * tripDurationHours} KMs`, // Monthly Plan - 300 KM/Day
    DR: "Unlimited KMs", // Daily Rental - Unlimited KM
  };
};

const findPackage = (rateBasis) => {
  if (rateBasis === "FF") return "120km/day";
  if (rateBasis === "MP") return "300km/day";
  if (rateBasis === "DR") return "Unlimited KMs";
  return "Undefined";
};

const formatDateForMyChoize = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date)) return null; // Handle invalid date input
  return `\/Date(${date.getTime()}+0530)\/`;
};

const fetchWithRetry = async (url, options, retries = 5, delay = 500) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error("MyChoize API error");
      return await response.json();
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i < retries - 1)
        await new Promise((res) => setTimeout(res, delay * (i + 1)));
    }
  }
  throw new Error("MyChoize API failed after multiple retries.");
};

const apiUrl = import.meta.env.VITE_FUNCTIONS_API_URL;
// const apiUrl = "http://127.0.0.1:5001/zymo-prod/us-central1/api";

const validateBookingTime = (pickupDate, minHrsTillBooking) => {
  if (!pickupDate || !minHrsTillBooking) {
    console.log("Missing pickup date or minHrsTillBooking:", {
      pickupDate,
      minHrsTillBooking,
    });
    return false;
  }

  const now = new Date();
  // Handle MyChoize date format "/Date(1234567890+0530)/"
  let pickupTime;
  if (typeof pickupDate === "string" && pickupDate.includes("/Date(")) {
    const timestamp = parseInt(pickupDate.match(/\d+/)[0]);
    pickupTime = new Date(timestamp);
  } else {
    pickupTime = new Date(pickupDate);
  }

  if (isNaN(pickupTime.getTime())) {
    console.log("Invalid pickup date:", pickupDate);
    return false;
  }

  const diffInHours = (pickupTime - now) / (1000 * 60 * 60);
  console.log("Time validation:", {
    now: now.toISOString(),
    pickupTime: pickupTime.toISOString(),
    diffInHours,
    minHrsTillBooking,
    isValid: diffInHours >= minHrsTillBooking,
  });
  return diffInHours >= minHrsTillBooking;
};

const fetchSubscriptionCars = async (
  CityName,
  formattedPickDate,
  formattedDropDate
) => {
  try {
    const response = await fetch(`${apiUrl}/mychoize/search-cars`, {
      method: "POST",
      body: JSON.stringify({
        data: {
          CityName,
          PickDate: formattedPickDate,
          DropDate: formattedDropDate,
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("MyChoize API error");

    const mychoizeData = await response.json();

    if (!mychoizeData.SearchBookingModel) {
      console.error("MyChoize API response missing expected data.");
      return [];
    }

    const vendorData = await getVendorDetails("mychoize");

    // Filter cars where RateBasis is "MLK"
    const subscriptionCars = mychoizeData.SearchBookingModel.filter(
      (car) =>
        (car.RateBasis === "MLK" || car.RateBasis === "EVM") && car.BrandName
    ).map((car) => {
      const baseFare = car.TotalExpCharge;
      const appliedRate = parseFloat(vendorData?.Currentratesubscription);
      const appliedDiscount = parseFloat(vendorData?.Discountsubscription);
      const appliedTax = parseFloat(vendorData?.Taxsubscription);

      // Calculate subscription fare with rate, discount and tax
      const fareAfterRateAndDiscount = baseFare * appliedRate * appliedDiscount;
      const gstAmount = fareAfterRateAndDiscount * appliedTax;
      const calculatedFare = fareAfterRateAndDiscount + gstAmount;

      return {
        id: car.TariffKey,
        brand: toPascalCase(car.BrandName.split(" ")[0]),
        name: toPascalCase(car.BrandName.split(" ")[1]),
        options: [
          car.TransMissionType,
          car.FuelType,
          `${car.SeatingCapacity} Seats`,
        ],
        address: car.LocationName,
        locationkey: car.LocationKey,
        hourly_amount: car.PerUnitCharges,
        images: [car.VehicleBrandImageName],
        ratingData: { text: "No ratings available" },
        extrakm_charge: `₹${car.ExKMRate}/km`,
        trips: car.TotalBookinCount,
        source: "mychoize",
        sourceImg: vendorData?.Imageurl,
        fare: `₹${Math.round(baseFare)}`, // Base fare
        inflated_fare: `₹${Math.round(calculatedFare)}`, // Final fare with all factors
        rateBasis: car.rateBasis,
        securityDeposit: vendorData?.subSecurityDeposit,
        rating: vendorData?.rating,
        plateColor: vendorData?.plateColor,
        vendorOffer: vendorData?.Offer,
      };
    });

    return subscriptionCars;
  } catch (error) {
    console.error("MyChoize API failed:", error);
    return [];
  }
};

const calculateSelfDrivePrice = (baseFare, vendor) => {
  // Parse the base fare from string or number
  const numericFare =
    typeof baseFare === "string"
      ? parseInt(baseFare.replace(/[^0-9]/g, ""))
      : // If it's already a number, use it directly
        baseFare;

  // Return 0 if we couldn't parse a valid number
  if (!numericFare || isNaN(numericFare)) {
    console.warn("Invalid base fare:", baseFare);
    return 0;
  }

  if (vendor?.vendor === "ZoomCar") {
    // For ZoomCar, just return the base fare as is
    return Math.round(numericFare);
  }
  const finalPrice =
    numericFare *
    (1 + parseFloat(vendor.TaxSd)) *
    parseFloat(vendor.CurrentrateSd) *
    parseFloat(vendor.DiscountSd);
  return Math.round(finalPrice);
};

const calculateDiscountPrice = (baseFare, vendor) => {
  // Parse the base fare if it's a string with ₹ symbol
  const numericFare =
    typeof baseFare === "string" ? parseInt(baseFare) : baseFare;

  if (!numericFare || isNaN(numericFare)) return 0;

  if (vendor?.vendor === "ZoomCar") {
    const finalPrice = numericFare * parseFloat(vendor.CurrentrateSd);
    return Math.round(finalPrice);
  }
  const finalPrice =
    baseFare *
    (1 + parseFloat(vendor.TaxSd)) *
    parseFloat(vendor.CurrentrateSd);

  return Math.round(finalPrice);
};

const fetchMyChoizeCars = async (
  CityName,
  formattedPickDate,
  formattedDropDate,
  tripDurationHours
) => {
  try {
    // Get vendor details first
    const vendorData = await getVendorDetails("mychoize");
    console.log("Vendor Data:", vendorData);
    // Check if API is enabled
    if (!vendorData?.Api?.PU) {
      console.log("Mychoize API is currently disabled");
      return [];
    }

    // Check if booking time meets minimum hours requirement
    console.log(vendorData?.minHrsTillBooking?.sd);
    if (
      !validateBookingTime(
        formattedPickDate,
        vendorData?.minHrsTillBooking?.sd || 0
      )
    ) {
      console.log("Pickup time does not meet minimum hours requirement");
      return [];
    }

    const mychoizeData = await fetchWithRetry(
      `${apiUrl}/mychoize/search-cars`,
      {
        method: "POST",
        body: JSON.stringify({
          data: {
            CityName,
            PickDate: formattedPickDate,
            DropDate: formattedDropDate,
          },
        }),
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!mychoizeData.SearchBookingModel) {
      console.error("MyChoize API response missing expected data.");
      return [];
    }

    const groupedCars = {};
    mychoizeData.SearchBookingModel.filter(
      (car) => car.RateBasis !== "MLK" && car.BrandName
    ).forEach((car) => {
      const key = car.GroupKey;

      if (car?.RateBasisDesc.split(" ")[0] === "MONTHLY") {
        // Skip monthly plans
        return;
      }

      if (!groupedCars[key]) {
        groupedCars[key] = {
          id: car.TariffKey,
          brand: toPascalCase(car.BrandName.split(" ")[0]),
          name: toPascalCase(car.BrandName.split(" ")[1]),
          options: [
            car.TransMissionType,
            car.FuelType,
            `${car.SeatingCapacity} Seats`,
          ],
          address: car.LocationName,
          location_id: car.LocationKey,
          hourly_amount: [],
          images: [car.VehicleBrandImageName],
          ratingData: { text: "No ratings available" },
          total_km: getTotalKms(tripDurationHours),
          extrakm_charge: `₹${car.ExKMRate}/km`,
          trips: car.TotalBookinCount,
          source: "mychoize",
          sourceImg: "/images/ServiceProvider/mychoize.png",
          rateBasisFare: {},
          all_fares: [],
          brandGroundLength: car.BrandGroundLength,
          brandKey: car.BrandKey,
          brandLength: car.BrandLength,
          fuelType: car.FuelType,
          groupKey: car.GroupKey,
          locationKey: car.LocationKey,
          luggageCapacity: car.LuggageCapacity,
          rftEngineCapacity: car.RFTEngineCapacity,
          seatingCapacity: car.SeatingCapacity,
          tariffKey: car.TariffKey,
          transmissionType: car.TransmissionType,
          vtrHybridFlag: car.VTRHybridFlag,
          vtrSUVFlag: car.VTRSUVFlag,
        };
      }

      groupedCars[key].rateBasisFare[car.RateBasis] = car.TotalExpCharge;
      Object.values(groupedCars[key].rateBasisFare).forEach((fare) => {
        if (!groupedCars[key].all_fares.includes(fare)) {
          groupedCars[key].all_fares.push(fare);
        }
      });

      groupedCars[key].hourly_amount[car.RateBasis] = parseInt(
        car.PerUnitCharges / tripDurationHours
      );
    });

    // const vendorData = await getVendorDetails("mychoize");

    return Object.values(groupedCars).map((car) => {
      const baseFare = Math.min(...car.all_fares);

      const pickupDate = new Date(formattedPickDate);
      const isWeekend = pickupDate.getDay() === 0 || pickupDate.getDay() === 6;

      const discountPrice = calculateDiscountPrice(
        baseFare,
        vendorData,
        isWeekend
      );
      const finalPrice = calculateSelfDrivePrice(
        baseFare,
        vendorData,
        isWeekend
      );

      return {
        ...car,
        fare: `₹${finalPrice}`, // Final price with discount
        inflated_fare: `₹${discountPrice}`, // Price without discount
        actualPrice: baseFare, // Store original price
        securityDeposit: vendorData?.Securitydeposit,
        rating: vendorData?.rating,
        plateColor: vendorData?.plateColor,
        minHrsTillBooking: vendorData?.minHrsTillBooking?.sd,
        vendorOffer: vendorData?.Offer,
        vendorLogo: vendorData?.Imageurl,
        isWeekend: isWeekend,
        taxRate: vendorData?.TaxSd,
        currentRate: vendorData?.CurrentrateSd,
        discountRate: vendorData?.DiscountSd,
      };
    });
  } catch (error) {
    console.error(error.message);
    return [];
  }
};

const fetchMyChoizeLocationList = async (
  city,
  formattedDropDate,
  formattedPickDate
) => {
  try {
    const response = await fetch(`${apiUrl}/mychoize/location-list`, {
      method: "POST",
      body: JSON.stringify({
        data: {
          CityName: city,
          PickDate: formattedPickDate,
          DropDate: formattedDropDate,
        },
      }),
      headers: { "Content-Type": "application/json" },
    });
    return response.json();
  } catch (error) {
    console.error(error.message);
  }
};

export {
  findPackage,
  fetchMyChoizeCars,
  fetchMyChoizeLocationList,
  formatDateForMyChoize,
  fetchSubscriptionCars,
  calculateSelfDrivePrice,
  calculateDiscountPrice,
};
