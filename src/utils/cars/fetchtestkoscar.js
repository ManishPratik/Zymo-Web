import { collection, getDocs } from "firebase/firestore";
import { appDB } from "../firebase";
import { toPascalCase } from "../helperFunctions";
import { getVendorDetails } from "../helperFunctions";

export const fetchAllTestKosCollections = async function (
  _appDB,
  formatFare,
  currentCity = "Mumbai",
  tripDurationHours = 24
) {
  // Helper function to create car object with price calculations
  const makeCarObject = (car, vendorDetails) => {
    const vendorRate = parseFloat(vendorDetails?.CurrentrateSd) || 1;
    const discountRate = parseFloat(vendorDetails?.DiscountSd) || 1;
    const taxRate = parseFloat(vendorDetails?.TaxSd) || 0;

    // Calculate prices based on vendor rates
    const perHourRate = car.perHourRate || car.basePrice / tripDurationHours;
    const finalDiscount = perHourRate * tripDurationHours * vendorRate;
    const finalPrice = perHourRate * tripDurationHours * vendorRate * discountRate;

    return {
      id: car.id,
      brand: car.carBrand,
      name: car.name,
      type: car.carType,
      partnerBrandName: vendorDetails?.vendor,
      options: [car.transmission, car.fuelType, `${car.seats} Seats`],
      address: car.pickupLocation,
      images: car.imageUrls,
      fare: formatFare(Math.round(finalPrice)),
      inflated_fare: formatFare(Math.round(finalDiscount)),
      actualPrice: finalDiscount,
      hourly_amount: car.perHourRate,
      extrakm_charge: car.extraKmRate,
      extrahour_charge: car.extraHourRate,
      securityDeposit: car.securityDeposit,
      pickups: car.deliveryCharges,
      deliveryCharges:
        car.deliveryCharges.find((d) => d.pickupAddress === "Delivery & Pickup")
          ?.deliveryCharge || 800,
      yearOfRegistration: car.yearOfRegistration || new Date().getFullYear() - 2,
      ratingData: {
        text: vendorDetails?.rating?.text || "Good",
        rating: parseFloat(vendorDetails?.rating?.value) || 4.2,
      },
      trips: vendorDetails?.trips || "20+",
      source: vendorDetails?.id || "Kos",
      sourceImg: vendorDetails?.Imageurl || "/images/ServiceProvider/zymo.png",
      location_est: currentCity,
      isSoldOut: car.isSoldOut,
      taxRate,
      currentRate: vendorRate,
      discountRate,
      plateColor: vendorDetails?.plateColor || "White",
      minHrsTillBooking: vendorDetails?.minHrsTillBooking?.sd || 3,
    };
  };

  try {
    // Only proceed if the current city is Delhi
    if (currentCity.toLowerCase() !== "delhi") {
      return [];
    }

    // Get vendor details first to check PU status
    const vendorDetails = await getVendorDetails("Kos");
    if (!vendorDetails) {
      console.log("Vendor details not found for Kos");
      return [];
    }

    // Check if API is enabled
    if (!vendorDetails?.Api?.PU) {
      console.log("Kos API is currently disabled");
      return [];
    }

    let allTestCars = [];
    const collectionName = "testkos";
    const city = toPascalCase(currentCity);

    try {
      const carsRef = collection(appDB, collectionName, city, "Cars");
      const carsSnapshot = await getDocs(carsRef);

      if (!carsSnapshot.empty) {
        console.log("Raw car data sample:", carsSnapshot.docs[0].data());
      }

      if (carsSnapshot.empty) {
        console.log(`No data found in collection ${collectionName}/${city}/Cars`);
        return [];
      }

      // Process the cars
      console.log(`Found ${carsSnapshot.docs.length} cars in the collection`);
      const cars = carsSnapshot.docs.map((doc) => {
        const carData = doc.data();
        const carName = carData["Car Name"] || carData.carName || "Unknown";

        // Skip sold-out cars
        if (carData.isSoldOut) {
          console.log(`Skipping sold out car: ${carName}`);
          return null;
        }

        const basePrice = parseInt(carData.price) || 0;
        const perHourRate = basePrice / 24;

        // Get brand from car name or fallback to default
        const carBrand =
          carData["Car Brand"] ||
          (carData["Car Name"] ? carData["Car Name"].split(" ")[0] : null) ||
          "Zymo";

        return {
          id: doc.id,
          collectionSource: collectionName,
          citySource: city,
          name: carData["Car Name"] || carData.carName || "Unknown Car",
          carBrand: carBrand,
          basePrice: basePrice,
          perHourRate: perHourRate,
          pickupLocation:
            carData["Pick-up location"] || carData.pickupLocation || "",
          transmission: carData["Transmission"] || carData.transmission || "Manual",
          fuelType: carData["Fuel Type"] || carData.fuelType || "Petrol",
          securityDeposit:
            parseInt(carData["Security Desposit"]) ||
            parseInt(carData.securityDeposit) ||
            vendorDetails?.Securitydeposit ||
            3000,
          extraKmRate:
            parseInt(carData["Extra Km Rate"]) ||
            parseInt(carData.extraKmRate) ||
            7,
          extraHourRate:
            parseInt(carData["Extra Hr Rate"]) ||
            parseInt(carData.extraHourRate) ||
            120,
          freeKms: parseInt(carData.freeKms) || 350,
          imageUrls: carData["imageUrl"]
            ? [carData["imageUrl"]]
            : carData.imageUrls || ["/images/Cars/default-car.png"],
          isSoldOut: Boolean(carData["isSoldOut"]) || false,
          deliveryCharges: [
            {
              pickupAddress: carData["Pick-up location"] || "",
              deliveryCharge: 0,
            },
            {
              pickupAddress: "Delivery & Pickup",
              deliveryCharge: parseInt(carData["Home Delivery Charges"]),
            },
          ],
          seats: parseInt(carData["No of Seats"]) || parseInt(carData.seats) || 5,
          carType: carData["Type"] || carData.type || "Hatchback",
        };
      });

      // Filter out null values
      allTestCars = cars.filter((car) => car !== null);
    } catch (error) {
      console.error(`Error processing collection ${collectionName}:`, error);
      return [];
    }

    if (allTestCars.length === 0) {
      console.log(`⚠️ No cars found for ${currentCity} in Kos collection`);
      return [];
    }

    // Group cars by name to handle multiple packages
    const carsByName = {};
    allTestCars.forEach((car) => {
      const name = car.name;
      if (!carsByName[name]) {
        carsByName[name] = [];
      }
      carsByName[name].push(car);
    });

    const formattedTestCars = [];

    // Process each car group (cars with the same name)
    for (const [carName, carGroup] of Object.entries(carsByName)) {
      carGroup.forEach((carVariation) => {
        const basePrice = parseInt(carVariation.basePrice) || 0;
        const perHourRate = basePrice / 24;
        carVariation.baseHourlyPrice = perHourRate * tripDurationHours;

        // Determine package type based on freeKms
        let rateBasis, packageName;
        const kmPerDay = (parseInt(carVariation.freeKms) || 350) / 24;

        if (kmPerDay <= 120) {
          rateBasis = "FF";
          packageName = "120KM Package";
        } else if (kmPerDay <= 300) {
          rateBasis = "MP";
          packageName = "300KM Package";
        } else {
          rateBasis = "DR";
          packageName = "Unlimited Package";
        }

        // Calculate free km based on trip duration
        const freeKm = Math.round((carVariation.freeKms / 24) * tripDurationHours);
        const kmLimit = rateBasis === "DR" ? "Unlimited" : freeKm;

        const total_km = {
          [rateBasis]: rateBasis === "DR" ? "Unlimited KMs" : `${freeKm} KMs`,
        };
        const rateBasisFare = { [rateBasis]: basePrice };

        formattedTestCars.push({
          ...makeCarObject(carVariation, vendorDetails),
          kmLimit,
          extraKm: kmLimit === "Unlimited" ? 0 : freeKm,
          freeKm,
          packageName,
          rateBasis,
          rateBasisFare,
          total_km,
        });
      });
    }

    // Sort and group cars
    formattedTestCars.sort((a, b) => {
      const fareA = parseInt(a.fare.replace(/[^0-9]/g, ""));
      const fareB = parseInt(b.fare.replace(/[^0-9]/g, ""));
      return fareA - fareB;
    });

    formattedTestCars.sort((a, b) => {
      const brandA = a.brand.toLowerCase();
      const brandB = b.brand.toLowerCase();
      if (brandA < brandB) return -1;
      if (brandA > brandB) return 1;
      return 0;
    });
    //console.log("Fetched cars:", JSON.parse(JSON.stringify(groupedCars)));
    return groupTheCarsByName(formattedTestCars);
  } catch (error) {
    console.error("Error fetching Kos collections:", error);
    return [];
  }
};

// Reuse the same groupTheCarsByName function
const groupTheCarsByName = (formattedTestCars) => {
  const groupedCars = {};

  formattedTestCars.forEach((car) => {
    const carName = car.name;
    if (!groupedCars[carName]) {
      groupedCars[carName] = {
        ...car,
        all_fares: [],
        total_km: [],
        variations: [],
      };
    }
    groupedCars[carName].all_fares.push(car.fare.slice(1));
    groupedCars[carName].total_km.push(car.total_km);
    groupedCars[carName].variations.push(car);
  });

  return Object.values(groupedCars).map((car) => {
    const { variations, ...rest } = car;
    return {
      ...rest,
      variations: variations.map((variation) => ({
        ...variation,
        name: variation.packageName,
        packageName: variation.packageName,
        rateBasis: variation.rateBasis,
        total_km: variation.total_km,
        rateBasisFare: variation.rateBasisFare,
      })),
    };
  });
};

export default fetchAllTestKosCollections;