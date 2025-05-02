import { collection, getDocs } from "firebase/firestore";
import { appDB } from "./firebase";
import { toPascalCase } from "./helperFunctions";
import { getVendorDetails } from "./helperFunctions";

/**
 * Fetch cars from test collections
 * @description Named and default export for maximum compatibility
 */
export const fetchAllTestCollections = async function(
  _appDB,
  formatFare,
  currentCity = "Mumbai",
  tripDurationHours = 24
) {
  try {
    // Only proceed if the current city is Delhi or Gwalior
    if (!["delhi", "gwalior"].includes(currentCity.toLowerCase())) {
      console.log(`Skipping test cars for ${currentCity} - only available for Delhi and Gwalior`);
      return [];
    }

    // Get vendor details first to check PU status
    const vendorDetails = await getVendorDetails("Karyana");
    console.log("Vendor details:", vendorDetails);
    if (!vendorDetails) {
      console.log('Vendor details not found for testKaaryana');
      return [];
    }
    
    // Check if API is enabled
    if (vendorDetails?.Api?.PU === true) {
      console.log('testKaaryana API is currently disabled');
      return [];
    }

    // Validate Firebase configurations
    console.log(`Validating Firebase configurations for city: ${currentCity}...`);
    
    let allTestCars = [];

    // Collection structure 2: City-based collections
    const cityCollections = [
      "testKaaryana"  // Then try testKaaryana
    ]; 

    // Only search for the current city
    const cityVariations = [toPascalCase(currentCity)];

    // Try each collection
    let foundCars = false;
    for (const collectionName of cityCollections) {
      // We want to check all cities for testKaaryana, so don't skip even if we found cars
      if (foundCars && collectionName !== "testKaaryana") continue;
      
      try {
        console.log(`Checking collection: ${collectionName}`);
        
        // Process each city separately
        for (const city of cityVariations) {
          try {
            // Get cars directly from the Cars collection for each city
            const carCollections = tripDurationHours < 24 
              ? ["Cars", "Cars24"] 
              : ["Cars"];
            
            for (const carCollection of carCollections) {
              try {
                const cityRef = collection(appDB, collectionName, city, carCollection);
                const cityDoc = await getDocs(cityRef);
                
                console.log(`Checking ${city} in ${collectionName}/${carCollection}`);
                
                if (cityDoc.empty) {
                  console.log(`No data found in collection ${collectionName}/${city}/${carCollection}`);
                  continue;
                }

                // Process the cars directly
                const cars = cityDoc.docs.map((doc) => {
                  const carData = doc.data();
                  console.log(
                    `Found car: ${carData["Car Name"] || carData.carName || doc.id} in ${city} (${carCollection})`
                  );

                  return {
                    id: doc.id,
                    collectionSource: collectionName,
                    citySource: city,
                    collectionType: carCollection,
                    name: carData["Car Name"] || carData.carName,
                    price: carData["Price (Package1)"] || carData.price,
                    pickupLocation: carData["Pick-Up location"] || carData.pickupLocation,
                    transmission: carData["Transmission"] || carData.transmission,
                    fuelType: carData["Fuel Type"] || carData.fuelType,
                    securityDeposit: carData["Security Deposit"] || carData.securityDeposit,
                    extraKmRate: carData["Extra Km Rate"] || carData.extraKmRate,
                    extraHourRate: carData["Extra Hr Rate"] || carData.extraHourRate,
                    kmLimit: carData["KM Limit"] || carData.kmLimit,
                    imageUrls: carData["imageUrl"] ? [carData["imageUrl"]] : carData.imageUrls || ["/images/Cars/default-car.png"],
                    isSoldOut: carData["isSoldOut"] || false,
                    deliveryCharges: carData["Home Delivery Charges"] || carData.deliveryCharges || false,
                    carBrand: carData["Car Brand"] || carData.carBrand,
                    seats: carData["No of Seats"] || carData.seats || 5,
                  };
                });

                allTestCars = [...allTestCars, ...cars];
                foundCars = true;
                console.log(`Added ${cars.length} cars from ${city} (${carCollection})`);
              } catch (error) {
                console.error(`Error processing ${carCollection} in ${city}:`, error);
              }
            }
          } catch (error) {
            console.error(`Error processing city ${city} in collection ${collectionName}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error processing collection ${collectionName}:`, error);
      }
    }

    // If no cars found in any collection, show a clear message
    if (allTestCars.length === 0) {
      console.log(`⚠️ No test cars found for ${currentCity} in any collection`);
    }

    // Map all test cars to a consistent format
    const formattedTestCars = allTestCars.map((car) => {
      console.log("Formatting car:", car);
      return {
        id: car.id || `testCar-${Math.random().toString(36).substring(2, 9)}`,
        brand: car.carBrand || car.brand || car.collectionSource || "Zymo Test",
        name: car.name || car.carName || car.model || "Test Car",
        type: car.carType || car.type || "",
        options: [
          car.transmission || car.transmissionType || "N/A",
          car.fuelType || car.fuel || "N/A",
          `${car.noOfSeats || car.seats || "5"} Seats`,
        ],
        address:
          car.pickupLocation || car["Pick-Up location"] || car.address || "",
        images: car.imageUrls || car.images || ["/images/Cars/default-car.png"],
        fare: formatFare(
          car["Price (Package1)"] ||
            car.price ||
            car.fare ||
            car.hourlyRental?.limited?.packages?.[0]?.hourlyRate *
              tripDurationHours ||
            1000
        ),
        inflated_fare: formatFare((car["Price (Package1)"] || car.price || car.fare || 1000) * 1.2),
        hourly_amount:
          car.hourlyRental?.limited?.packages?.[0]?.hourlyRate ||
          car.hourlyRate ||
          100,
        extrakm_charge:
          car["Extra Km Rate"] ||
          car.extraKmRate ||
          car.extraKmCharge ||
          car.hourlyRental?.limited?.extraKmRate ||
          10,
        extrahour_charge:
          car["Extra Hr Rate"] ||
          car.extraHourRate ||
          car.extraHourCharge ||
          car.hourlyRental?.limited?.extraHourRate ||
          150,
        securityDeposit: car["Security Deposit"] || car.securityDeposit || 0,
        deliveryCharges: car["Home Delivery Charges"] || car.deliveryCharges || false,
        yearOfRegistration: car.yearOfRegistration || car.regYear || "N/A",
        ratingData: {
          text: car.rating?.text || "No ratings available",
          rating: car.rating?.value || 4.0,
        },
        trips: car.trips || "N/A",
        source: car.collectionSource || "Zymo Test",
        sourceImg: vendorDetails?.Imageurl || "/images/ServiceProvider/zymo.png",
        location_est: currentCity,
      };
    });
    
    if (formattedTestCars.length > 0) {
      console.log(
        `🚗 Found ${formattedTestCars.length} total test cars for ${currentCity}`
      );
      const brandCounts = formattedTestCars.reduce((acc, car) => {
        acc[car.brand] = (acc[car.brand] || 0) + 1;
        return acc;
      }, {});
      console.log("Car brands found:", brandCounts);
    } else {
      console.log(`⚠️ No test cars found for ${currentCity}`);
    }

    return formattedTestCars;
  } catch (error) {
    console.error("Error in fetchAllTestCollections:", error);
    return [];
  }
};

// Add default export for backward compatibility
export default fetchAllTestCollections;
