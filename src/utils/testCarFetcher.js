import { collection, getDocs } from "firebase/firestore";
import { appDB } from "./firebase";
import { toPascalCase } from "./helperFunctions";
import { getVendorDetails } from "./helperFunctions";

export const fetchAllTestCollections = async function (
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

    // Calculate prices based on vendor rates - matching Dart implementation exactly
    const perHourRate =
      car.perHourRate || car.baseHourlyPrice / tripDurationHours;

    // Match Dart implementation:
    // finalDiscount = perHourRate * tripDurationInHours * vendor.currentRate
    const finalDiscount = perHourRate * tripDurationHours * vendorRate;

    const finalPrice =
      perHourRate * tripDurationHours * vendorRate * discountRate;

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
      yearOfRegistration:
        car.yearOfRegistration || new Date().getFullYear() - 2,
      ratingData: {
        text: vendorDetails?.rating?.text || "Good",
        rating: parseFloat(vendorDetails?.rating?.value) || 4.2,
      },
      trips: vendorDetails?.trips || "20+",
      source: vendorDetails?.id || "Karyana",
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
    // Only proceed if the current city is Delhi or Gwalior
    if (!["delhi", "gwalior"].includes(currentCity.toLowerCase())) {
      return [];
    }

    // Get vendor details first to check PU status
    const vendorDetails = await getVendorDetails("Karyana");
    if (!vendorDetails) {
      console.log("Vendor details not found for testKaaryana");
      return [];
    }

    // Check if API is enabled
    if (!vendorDetails?.Api?.PU) {
      console.log("testKaaryana API is currently disabled");
      return [];
    }

    let allTestCars = [];

    // Collection structure 2: City-based collections
    const cityCollections = ["testKaaryana"];

    // Only search for the current city
    const cityVariations = [toPascalCase(currentCity)];

    // Try each collection
    let foundCars = false;
    for (const collectionName of cityCollections) {
      // We want to check all cities for testKaaryana, so don't skip even if we found cars
      if (foundCars && collectionName !== "testKaaryana") continue;

      try {
        // Process each city separately
        for (const city of cityVariations) {
          try {
            // Get cars directly from the correct collection based on trip duration
            const carCollections =
              tripDurationHours < 24 ? ["CarsBelow24", "Cars"] : ["Cars"];

            for (const carCollection of carCollections) {
              try {
                const cityRef = collection(
                  appDB,
                  collectionName,
                  city,
                  carCollection
                );
                const cityDoc = await getDocs(cityRef);

                // Log raw data from Firebase for debugging
                if (!cityDoc.empty) {
                  console.log("Raw car data sample:", cityDoc.docs[0].data());
                }

                if (cityDoc.empty) {
                  console.log(
                    `No data found in collection ${collectionName}/${city}/${carCollection}`
                  );
                  continue;
                }

                // Process the cars directlyconsole.log(`Found ${cityDoc.docs.length} cars in the collection`);
                const cars = cityDoc.docs.map((doc) => {
                  const carData = doc.data();
                  const carName =
                    carData["Car Name"] || carData.carName || "Unknown";
 
                  // Skip sold-out cars
                  if (carData.isSoldOut) {
                    console.log(`Skipping sold out car: ${carName}`);
                    return null;
                  }

                  const isAbove24Hours = tripDurationHours >= 24;
                  const basePrice = parseInt(carData.price) || 0;
                  const below24Rate = parseInt(carData.below24HourRate) || 0;

                  const perHourRate = isAbove24Hours
                    ? basePrice / 24
                    : below24Rate;

                  const freeKms = isAbove24Hours
                    ? Math.round(
                        (parseInt(carData.freeKms || 350) / 24) *
                          tripDurationHours
                      )
                    : 6 * tripDurationHours;

                  // Get brand from car name or fallback to default
                  const carBrand =
                    carData["Car Brand"] ||
                    (carData["Car Name"]
                      ? carData["Car Name"].split(" ")[0]
                      : null) ||
                    "Zymo";
                  // vendor.currentRate and vendor.discountRate will be applied later in the formatting step
                  const baseHourlyPrice = perHourRate * tripDurationHours;

                  return {
                    id: doc.id,
                    collectionSource: collectionName,
                    citySource: city,
                    collectionType: carCollection,
                    name:
                      carData["Car Name"] || carData.carName || "Unknown Car",
                    carBrand: carBrand,
                    actualPrice: basePrice,
                    perHourRate: perHourRate,
                    baseHourlyPrice: baseHourlyPrice, // Store the base calculation before vendor rates
                    pickupLocation:
                      carData["Pick-up location"] ||
                      carData.pickupLocation ||
                      "",
                    transmission:
                      carData["Transmission"] ||
                      carData.transmission ||
                      "Manual",
                    fuelType:
                      carData["Fuel Type"] || carData.fuelType || "Petrol",
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
                    kmLimit: freeKms,
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
                        deliveryCharge: parseInt(
                          carData["Home Delivery Charges"]
                        ),
                      },
                    ],
                    seats:
                      parseInt(carData["No of Seats"]) ||
                      parseInt(carData.seats) ||
                      5,
                    below24HourRate: parseInt(carData.below24HourRate) || 92,
                    carType: carData["Type"] || carData.type || "Hatchback",
                  };
                });
                // Filter out null values and add valid cars
                const validCars = cars.filter((car) => car !== null);
                allTestCars = [...allTestCars, ...validCars];
                foundCars = validCars.length > 0;
              } catch (error) {
                console.error(
                  `Error processing ${carCollection} in ${city}:`,
                  error
                );
              }
            }
          } catch (error) {
            console.error(
              `Error processing city ${city} in collection ${collectionName}:`,
              error
            );
          }
        }
      } catch (error) {
        console.error(`Error processing collection ${collectionName}:`, error);
      }
    } // If no cars found in any collection, show a clear message
    if (allTestCars.length === 0) {
      console.log(`⚠️ No test cars found for ${currentCity} in any collection`);
      return [];
    }

    // Group cars by name to handle multiple packages
    const carsByName = {};
    allTestCars.forEach((car) => {
      if (!car) return; // Skip any null values that might have slipped through
      const name = car["Car Name"] || car.carName || "Unknown Car";
      if (!carsByName[name]) {
        carsByName[name] = [];
      }
      carsByName[name].push(car);
    });

    const formattedTestCars = [];

    // Process each car group (cars with the same name)
    for (const [carName, carGroup] of Object.entries(carsByName)) {
      if (tripDurationHours < 24) {
        // For short trips, use car with lowest hourly rate
        const selectedCar = carGroup[0];
        const kmLimit = selectedCar.kmLimit || 6 * tripDurationHours;

        // Create total_km and rateBasisFare objects for hourly packages too
        const rateBasis = "hourly";
        const dailyPrice =
          parseInt(selectedCar.below24HourRate) ||
          parseInt(selectedCar.price) ||
          0;

        // Format the total_km properly - important to match the expected format in UI
        const total_km = {
          [rateBasis]: `${kmLimit}`, // Format with "KMs" suffix as expected by BookingCard
        };
        const rateBasisFare = { [rateBasis]: dailyPrice };

        formattedTestCars.push({
          ...makeCarObject(selectedCar, vendorDetails),
          kmLimit,
          extraKm: kmLimit,
          freeKm: kmLimit,
          packageName: "Hourly Package",
          rateBasis,
          total_km,
          rateBasisFare,
        });
      } else {

        // Process each car in the group as a separate package
        carGroup.forEach((carVariation) => {
          // For daily rates, use the price value directly (not hourly)
          const dailyPrice = parseInt(carVariation.price) || 0;

          // Match Dart implementation: perHourRate = data['price'] / 24
          const perHourRate = dailyPrice / 24;

          // Match Dart implementation: finalDiscount = perHourRate * tripDurationInHours * vendor.currentRate
          carVariation.baseHourlyPrice = perHourRate * tripDurationHours;

          // Determine package type based on kmLimit
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

          // Create total_km and rateBasisFare objects
          const kmLimit =
            rateBasis === "DR" ? "Unlimited" : carVariation.kmLimit || 0;

          const total_km = {
            [rateBasis]:
              rateBasis === "DR"
                ? "Unlimited KMs"
                : `${carVariation.kmLimit || 0} KMs`,
          };
          const rateBasisFare = { [rateBasis]: dailyPrice };

          // Calculate free km based on trip duration
          const freeKm = carVariation.freeKms
            ? (parseInt(carVariation.freeKms) / 24) * tripDurationHours
            : (350 / 24) * tripDurationHours;

          // Add the formatted car with its package details
          formattedTestCars.push({
            ...makeCarObject(carVariation, vendorDetails),
            kmLimit: kmLimit === "Unlimited" ? "Unlimited" : freeKm,
            extraKm: kmLimit === "Unlimited" ? 0 : freeKm,
            freeKm,
            packageName,
            rateBasis,
            rateBasisFare,
            total_km,
          });
        });
      }
    }

    let groupCars = [];
    // sort formattedTestCars by fare with cars brand name
    formattedTestCars.sort((a, b) => {
      const fareA = parseInt(a.fare.replace(/[^0-9]/g, ""));
      const fareB = parseInt(b.fare.replace(/[^0-9]/g, ""));
      return fareA - fareB;
    });
    // sort formattedTestCars by brand name
    formattedTestCars.sort((a, b) => {
      const brandA = a.brand.toLowerCase();
      const brandB = b.brand.toLowerCase();
      if (brandA < brandB) return -1;
      if (brandA > brandB) return 1;
      return 0;
    });
    groupCars = groupTheCarsByName(formattedTestCars)

    return groupCars;
  } catch (error) {
    console.error("Error fetching test collections:", error);
    return [];
  }
};

const groupTheCarsByName = (formattedTestCars) => {
  const groupedCars = {};

  formattedTestCars.map((car) => {
    const carName = car.name;
    if (!groupedCars[carName]) {
      groupedCars[carName] = {
        ...car,
        all_fares: [],
        total_km: [],
        variations: [],
      };
    }
    groupedCars[carName].all_fares.push(car.fare.slice(1))
    groupedCars[carName].total_km.push(car.total_km)
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
}

export default fetchAllTestCollections;
