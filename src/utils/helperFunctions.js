import { toast } from "react-toastify";
import { appDB } from "./firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { formatNumberAsPrice } from './mychoize';

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
  if (!str || typeof str !== "string") return "";
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
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true,
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
      await new Promise((resolve) => setTimeout(resolve, delay * 2 ** retry));
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
  if (!vendorName) {
    console.error('Vendor name is required');
    return null;
  }

  const allVendors = await fetchAllVendors();
  const vendorData = allVendors.find(
    (vendor) => {
      if (!vendor || !vendor.vendor) return false;
      return vendor.vendor.toLowerCase() === vendorName.toLowerCase();
    }
  );
  return vendorData || null;
};

const readyFare = (fare, vendor) => {
  // Return formatted zero if no fare provided
  if (!fare) {
    return '₹0';
  }
  
  // Extract base fare from string if needed (removing ₹ symbol)
  const baseFare = typeof fare === 'string' ? parseInt(fare.replace(/[^0-9]/g, "")) : fare;
  
  // Use vendor rate if available, otherwise use 1
  const rate = vendor?.CurrentrateSd || 1;
  
  // Calculate final price and format it
  const finalAmount = Math.round(baseFare * rate);
  return `₹${formatNumberAsPrice(finalAmount)}`;
}

export {
  formatDate,
  toPascalCase,
  formatFare,
  formatTo12,
  retryFunction,
  getVendorDetails,
  readyFare
};
