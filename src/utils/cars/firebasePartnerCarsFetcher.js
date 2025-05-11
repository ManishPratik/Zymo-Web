import { collection, getDocs } from "firebase/firestore";
import { appDB } from "../firebase";
import fetchAllTestCollections from "../testCarFetcher";
import { formatFare, toPascalCase } from "../helperFunctions";

export const fetchFirebaseCars = async (city, tripDurationHours) => {
  try {
    // Step 1: Get partners from partnerWebApp collection that serve the requested city
    const partnersSnapshot = await getDocs(collection(appDB, "partnerWebApp"));

    // Step 2: Filter partners by city and get their details
    const partnersInCity = partnersSnapshot.docs
      .filter((doc) => {
        const partner = doc.data();
        return (
          partner.cities &&
          Array.isArray(partner.cities) &&
          partner.cities.some(
            (c) => c && city && c.toLowerCase() === city.toLowerCase()
          )
        );
      })
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          accountType: data.accountType || "company",
          bankAccount: data.bankAccount || "",
          bankAccountName: data.bankAccountName || "",
          brandName: data.brandName || "",
          carsRange: data.carsRange || "",
          cities: data.cities || [],
          createdAt: data.createdAt,
          email: data.email || "",
          fullName: data.fullName || "Unknown",
          gstNumber: data.gstNumber || "",
          ifscCode: data.ifscCode || "",
          isApproved: data.isApproved || false,
          logo: data.logo || null,
          phone: data.phone || "",
          updatedAt: data.updatedAt,
          upiId: data.upiId || null,
          username: data.username || "",
          // Fields used in UI
          brandLogo: data.logo || null,
          ...data,
        };
      });

    // Step 3: Now fetch cars for each partner
    let allCars = [];

    for (const partner of partnersInCity) {
      try {
        // Get the uploadedCars subcollection for this partner
        const carsSnapshot = await getDocs(
          collection(appDB, "partnerWebApp", partner.id, "uploadedCars")
        );

        if (!carsSnapshot.empty) {
          // Process partner cars but currently not using them
          // This code is kept for potential future use

          const partnerCars = carsSnapshot.docs.map((doc) => {
            const carData = doc.data();

            // minimum booking duration for car

            const minBookingDuration = carData.minBookingDuration;

            if (minBookingDuration === 1 && tripDurationHours < 24) {
              return null;
            } else if (minBookingDuration > tripDurationHours) {
              return null;
            }

            for (const city of partner.cities) {
              if (city && city.toLowerCase() === city.toLowerCase()) {
                break;
              } else {
                return null;
              }
            }            // create packages
            const all_fares = [];
            const total_km = [];
            const hourlyRates = [];
            if (carData.packages) {
              for (const key in carData.packages) {
                const packageHourlyRate = carData.packages[key].hourlyRate || 0;
                const kmPerHour = carData.packages[key].kmPerHour || 0;
                const fairPrice = packageHourlyRate * tripDurationHours;
                const fare = formatFare(fairPrice);
                all_fares.push(fare);
                total_km.push(kmPerHour * tripDurationHours);
                hourlyRates.push(packageHourlyRate);
              }
            }
            return {
              id: doc.id,
              partnerId: partner.id,
              partnerName: partner.fullName,
              partnerBrandName: partner.brandName || "Zymo",
              all_fares: all_fares,
              total_km: total_km,
              hourlyRates: hourlyRates,
              extrahour_charge: carData.extraHourRate || 0,
              extrakm_charge: carData.extraKmRate || 0,
              fare: all_fares[0],
              inflated_fare: all_fares[0],
              partnerLogo: partner.logo,
              partnerPhone: partner.phone,
              partnerEmail: partner.email,
              carName: carData.carName || carData.name,
              carType: carData.carType || carData.type,
              carBrand: carData.carBrand || carData.brand,
              transmissionType: carData.transmissionType,
              fuelType: carData.fuelType,
              noOfSeats: carData.noOfSeats || 5,
              images: carData.images || ["/images/Cars/default-car.png"],
              securityDeposit: carData.securityDeposit || 0,
              deliveryCharges: carData.deliveryCharges || false,
              source: "Zymo",
              sourceImg: partner.logo || "/images/ServiceProvider/zymo.png",
              location_est: city,
              ...carData,
            };
          });
          allCars = [...allCars, ...partnerCars];

        }
      } catch (err) {
        console.error(`Error fetching cars for partner ${partner.id}:`, err);
      }
    }

    // Step 4: Fetch cars from all test collections
    const testCollections = await fetchAllTestCollections(
      appDB,
      formatFare,
      city,
      tripDurationHours
    );

    if (testCollections && testCollections.length > 0) {
      allCars = [...allCars, ...testCollections];
    } 

    // Step 5: Map car data to the expected format
    const filterdData = allCars
      .filter((car) => {
        // Skip cars with no data or undefined required fields
        if (!car || !car.id) {
          return false;
        }
        return true;
      })
      .map((car) => {
        return {
          id: car.carId || car.id,
          brand: car.partnerBrandName || "Zymo",
          name: car.carName || car.name || car.model || car.type || "Car",
          type: car.carType || car.type || "",
          options: [
            car.transmissionType || car.options?.[0] || "N/A",
            car.fuelType || car.options?.[1] || "N/A",
            car.noOfSeats
              ? `${car.noOfSeats} Seats`
              : car.options?.[2] || "5 Seats",
          ],
          address:
            car.pickupLocations?.[toPascalCase(city)] || car.address || "",
          images: car.images ||
            car.image_urls || ["/images/Cars/default-car.png"],
          fare: car.fare,
          inflated_fare: car.inflated_fare,
          extrakm_charge: car.extrakm_charge || "0",
          extrahour_charge: car.extrahour_charge || 0,
          slabRates: car.slabRates || [],
          securityDeposit: car.securityDeposit || 0,
          deliveryCharges: car.deliveryCharges || false,
          yearOfRegistration: car.yearOfRegistration || "N/A",
          ratingData: car.ratingData || {
            text: "No ratings available",
            rating: 4.0,
          },
          trips: car.trips || "N/A",
          source: car.source || "Zymo",
          sourceImg:
            car.sourceImg ||
            car.partnerLogo ||
            "/images/ServiceProvider/zymo.png",
          location_est: car.location_est || city,
          total_km: car.total_km,
          all_fares: car.all_fares || [],
          hourlyRates: car.hourlyRates || [],
          rateBasis:
            car.rateBasis || (tripDurationHours >= 24 ? "MP" : "hourly"),
          variations: car.variations || [],
        };
      });

    return filterdData;
    // return [];
  } catch (error) {
    console.error("Error fetching Firebase cars:", error);
    return [];
  }
};
