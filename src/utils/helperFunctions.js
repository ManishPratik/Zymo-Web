import { toast } from "react-toastify";
import { appDB } from "./firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

// Date Formatting
const formatDate = (date) => {
    return new Date(date)
        .toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour12: true,
            hour: "2-digit",
            minute: "2-digit",
        })
        .replace(" at", "");
};

// 24hr to 12hr format
const formatTo12 = (time) => {
    let [hour, minutes] = time.split(":").map(Number);
    let period = hour >= 12 ? "pm" : "am";
    hour = hour % 12 || 12;
    return `${hour}${period}`;
};

// String Formatting
const toPascalCase = (str) => {
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

// Format fare/prices
const formatFare = (fare) => {
    if (!fare) {
        return;
    }

    if (fare[0] === "₹") {
        fare = fare.slice(1);
    }

    const formatter = new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return `₹${formatter.format(fare)}`;
};

// Retry functions
const retryFunction = async (fn, args = [], maxRetries = 3, delay = 100) => {
    let retry = 0;

    while (retry <= maxRetries) {
        try {
            return await fn(...args);
        } catch (error) {
            console.error(`Attempt ${retry + 1} failed: ${error.message}`);
            retry++;

            if (retry > maxRetries) {
                throw new Error(
                    `Max retry attempts reached. Last error: ${error.message}`
                );
            }

            // exponential backoff (100ms, 200ms, 400ms, ...)
            await new Promise((resolve) =>
                setTimeout(resolve, delay * 2 ** retry)
            );
        }
    }
};

// Vendor details function
const fetchAllVendors = async () => {
    const querySnapshot = await getDocs(collection(appDB, "carvendors"));
    const vendors = [];

    querySnapshot.forEach((doc) => {
      vendors.push({ id: doc.id, ...doc.data() });
    });

    return vendors;
  };

const getVendorDetails = async (vendorName) => {
    const allVendors = await fetchAllVendors();
    const vendorData = allVendors.find(
        (vendor) => vendor.vendor.toLowerCase() === vendorName.toLowerCase()
    );
    return vendorData;
};

export { formatDate, toPascalCase, formatFare, formatTo12, retryFunction, getVendorDetails };