import {
  ArrowLeft,
  Calendar,
  IndianRupee,
  Car,
  MapPinIcon,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import ConfirmPage from "../components/ConfirmPage";
import NavBar from "../components/NavBar";
import {
  formatDate,
  formatFare,
  retryFunction,
} from "../utils/helperFunctions";
import {
  fetchMyChoizeLocationList,
  findPackage,
  formatDateForMyChoize,
  formatNumberAsPrice,
} from "../utils/mychoize";
import { currencyToInteger } from "../utils/currencyHelper";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { appDB, appStorage } from "../utils/firebase";
import PickupPopup from "../components/PickupPopup";
import DropupPopup from "../components/DropupPopup";
import BookingPageFormPopup from "../components/BookingPageFormPopup";
import BookingPageUploadPopup from "../components/BookingPageUploadPopup";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import useTrackEvent from "../hooks/useTrackEvent";
import BookingPageLoading from "../components/BookingPageLoading";
import CarImageSlider from "./ImageSlider";

// Function to dynamically load Razorpay script
function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { city } = useParams();
  const { startDate, endDate, userData, car, tripDuration } =
    location.state || {};

  const trackEvent = useTrackEvent();
  const startDateFormatted = formatDate(startDate);
  const endDateFormatted = formatDate(endDate);

  const [customerName, setCustomerName] = useState(userData.name);
  const [customerPhone, setCustomerPhone] = useState(userData.phone);
  const [customerEmail, setCustomerEmail] = useState(userData.email);
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = useState(false);
  const [vendorDetails, setVendorDetails] = useState(null);

  const [discount, setDiscount] = useState(0);
  const [payableAmount, setPayableAmount] = useState(0);
  const [deliveryCharges, setDeliveryCharges] = useState(0);

  const [showPickupPopup, setShowPickupPopup] = useState(false);
  const [showDropupPopup, setShowDropupPopup] = useState(false);
  const [selectedPickupLocation, setSelectedPickupLocation] = useState(null);
  const [selectedDropLocation, setSelectedDropLocation] = useState(null);
  const [mychoizePickupLocations, setMychoizePickupLocations] = useState({});
  const [mychoizeDropupLocations, setMychoizeDropupLocations] = useState({});

  const [showFormPopup, setShowFormPopup] = useState(false);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [formData, setFormData] = useState(null);
  const [uploadDocData, setUploadDocData] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [fareAmount, setFareAmount] = useState(null);
  const [gstAmount, setGstAmount] = useState(null);
  const [securityDeposit, setSecurityDeposit] = useState(null);
  const [packageSelected, setPackageSelected] = useState(null);

  const [couponCode, setCouponCode] = useState("ZYMOWEB");

  const [loading, setLoading] = useState(false);

  const customerUploadDetails = formData && uploadDocData;

  const functionsUrl = import.meta.env.VITE_FUNCTIONS_API_URL;

  const vendor =
    car.source === "zoomcar"
      ? "ZoomCar"
      : car.source === "mychoize"
      ? "Mychoize"
      : car.source;

  useEffect(() => {
    const fetchVendorDetails = async () => {
      if (car.source === "Zymo") {
        setVendorDetails({
          vendor: "Zymo",
          CurrentrateSd: 1,
          TaxSd: 0,
          Securitydeposit: car?.securityDeposit || 0,
          DiscountSd: 1,

          // Add any other relevant details here
        });
        return;
      }
      const docRef = doc(appDB, "carvendors", vendor);
      const docSnap = await getDoc(docRef);
      setVendorDetails(docSnap.data());
    };
    fetchVendorDetails();
  }, [car.source]);

  useEffect(() => {
    if (!car.fare || !vendorDetails) return;

    // set security Deposit as per vendor details
    if (car.source === "zoomcar") {
      setSecurityDeposit(0);
    } else if (car.source === "ZT") {
      setSecurityDeposit(car?.securityDeposit);
    } else {
      setSecurityDeposit(vendorDetails?.Securitydeposit);
    }

    if (car.source === "Zymo") {
      setPackageSelected(car.total_km[car.selectedPackage]);
    }
    if (car.source === "ZT") {
      setPackageSelected(car?.total_km?.FF);
    } else {
      setPackageSelected(findPackage(car.rateBasis));
    }

    // Get the base fare from car data
    let baseFare = car.actualPrice || currencyToInteger(car.fare);
    if (car.source === "Karyana" || car.source === "ZT") {
      baseFare = currencyToInteger(car.inflated_fare);
    } else if (car.source === "mychoize") {
      baseFare = car.rateBasisFare[car.rateBasis];
    }

    // 1. Calculate base price: baseFare * currentRate
    const currentRate = parseFloat(vendorDetails?.CurrentrateSd || 1);
    const basePrice = baseFare * currentRate;
    setFareAmount(Math.round(basePrice));

    if (car.source === "Karyana" || car.source === "ZT") {
      setFareAmount(Math.round(baseFare));
    }

    // 2. Add GST to the base price
    const taxRate = parseFloat(vendorDetails?.TaxSd || 0);

    // Special case for Karyana or vendors where TaxSd is 1
    // When TaxSd is 1, GST is already included in the base fare
    // For other values, it represents the GST tax rate to be applied
    let withGST = 0;
    if (vendorDetails?.vendor === "ZoomCar") {
      withGST = 0; // ZoomCar has GST included in base fare
    } else if (taxRate === 1) {
      withGST = 0; // When TaxSd is 1, GST is already included
    } else {
      withGST = basePrice * taxRate; // Normal GST calculation
    }
    setGstAmount(Math.round(withGST));

    // 3. Calculate discount and final amount
    const discountRate = parseFloat(vendorDetails?.DiscountSd || 1);
    let finalAmount; // This will be the amount *if* vendor discount is applied
    let calculatedVendorDiscountValue = 0; // Stores the discount calculated from vendor rules

    if (car.source === "Karyana" || car.source === "ZT") {
      // For Karyana cars:
      // - baseFare is the inflated price
      // - We need to calculate the discounted fare using the discount rate
      const discountedFare = Math.round(baseFare * discountRate);
      calculatedVendorDiscountValue = baseFare - discountedFare;
      finalAmount = discountedFare;
    } else if (car.source === "zoomcar") {
      // For ZoomCar:
      // - baseFare is already the discounted price
      // - Calculate inflated price using currentRate
      // - Discount is the difference
      const inflatedPrice = Math.round(baseFare * currentRate);
      calculatedVendorDiscountValue = inflatedPrice - baseFare;

      // For ZoomCar, use the base fare as the final amount
      finalAmount = Math.round(baseFare);
    } else {
      const tempDiscountAmount = (basePrice + withGST) * (1 - discountRate);
      calculatedVendorDiscountValue = Math.round(tempDiscountAmount); // Store calculated discount

      finalAmount = Math.round(
        parseInt(baseFare) + withGST - calculatedVendorDiscountValue
      );
    }

    if (couponCode === "ZYMOWEB") {
      setDiscount(calculatedVendorDiscountValue);
      setPayableAmount(parseInt(finalAmount) + parseInt(securityDeposit));
    } else {
      setDiscount(0);
      let noDiscountAmount = 0;
      
      if (car.source === "ZT") {
        // For ZT cars:
        // - Use baseFare directly (inflated_fare) without applying currentRate
        // - Add GST if applicable
        // - Add security deposit at the end
        noDiscountAmount = Math.round(parseInt(baseFare) + withGST);
        setPayableAmount(noDiscountAmount + parseInt(securityDeposit));
      } else {
        noDiscountAmount = Math.round(parseInt(basePrice) + withGST + parseInt(securityDeposit));
        setPayableAmount(noDiscountAmount);
      }
      finalAmount = noDiscountAmount;
    }

  }, [
    car, // Include the whole car object
    vendorDetails,
    couponCode,
    securityDeposit // Add securityDeposit as it's used in calculations
  ]);

  useEffect(() => {
    if (selectedPickupLocation && selectedDropLocation) {
      const newDeliveryCharges =
        parseInt(selectedPickupLocation.DeliveryCharge) +
        parseInt(selectedDropLocation.DeliveryCharge);
      setPayableAmount((prevAmount) => {
        return prevAmount - deliveryCharges + newDeliveryCharges;
      });
      setDeliveryCharges(newDeliveryCharges);
    }
  }, [selectedPickupLocation, selectedDropLocation, deliveryCharges]);

  const preBookingData = {
    headerDetails: {
      name: `${car.brand} ${car.name}`,
      type: car.options.slice(0, 3).join(" | "),
      range:
        car.source === "Zymo"
          ? `${car.total_km[car.selectedPackage]} KMs`
          : `${findPackage(car.rateBasis)}`,
      image: car.images,
      rating: car?.ratingData?.rating,
    },
    pickup: {
      startDate: startDateFormatted,
      endDate: endDateFormatted,
      city: city,
      tripDuration: tripDuration,
    },
    carDetails: {
      registration: vendorDetails?.plateColor || "N/A",
      package: packageSelected,
      transmission: car.options[0],
      fuel: car.options[1],
      seats: car.options[2],
    },
    fareDetails: {
      // Base price with current rate only
      base: vendorDetails
        ? gstAmount === "ZoomCar"
          ? `₹${car?.actualPrice * (vendorDetails?.CurrentrateSd || 1)}`
          : `₹${fareAmount}`
        : "₹0",
      // GST calculated on base price
      gst:
        gstAmount === 0
          ? "Incl. in Base Fare"
          : `₹${formatNumberAsPrice(fareAmount * (vendorDetails?.TaxSd || 0))}`,
      // Security deposit unchanged
      deposit: `₹${formatNumberAsPrice(securityDeposit)}`,
      // Discount on base price
      discount: discount > 0 ? `₹${formatNumberAsPrice(discount)}` : "₹0",
      // Final payable amount
      payable_amount: `₹${formatNumberAsPrice(payableAmount)}`,
    },
    customer: {
      name: customerName || "N/A",
      mobile: customerPhone || "N/A",
      email: customerEmail || "N/A",
    },
  };

  const filterLocationLists = (locationList) => {
    const filteredLocationList = locationList.filter(
      (location) => !location.LocationName.includes("Monthly")
    );

    const hubLocations = filteredLocationList.filter(
      (location) => !location.IsPickDropChargesApplicable
    );
    const doorstepDeliveryLocations = filteredLocationList
      .filter((location) => location.LocationName.includes("Doorstep"))
      .filter((location) => location.IsPickDropChargesApplicable);
    const airportLocations = filteredLocationList.filter((location) =>
      location.LocationName.includes("Airport")
    );

    const filteredLocations = new Set([
      ...hubLocations,
      ...doorstepDeliveryLocations,
      ...airportLocations,
    ]);
    const nearbyLocations = filteredLocationList.filter(
      (location) => !filteredLocations.has(location)
    );

    return {
      hubs: hubLocations,
      doorstep_delivery: doorstepDeliveryLocations,
      airport_locations: airportLocations,
      nearby_locations: nearbyLocations,
    };
  };

  useEffect(() => {
    const mychoizeFormattedPickDate = formatDateForMyChoize(startDate);
    const mychoizeFormattedDropDate = formatDateForMyChoize(endDate);

    const fetchLocationList = () =>
      fetchMyChoizeLocationList(
        city,
        mychoizeFormattedDropDate,
        mychoizeFormattedPickDate
      ).then((data) => {
        const pickupLocations = filterLocationLists(
          data.BranchesPickupLocationList
        );
        const dropupLocations = filterLocationLists(
          data.BranchesDropupLocationList
        );

        setMychoizePickupLocations(pickupLocations);
        setMychoizeDropupLocations(dropupLocations);
      });
    fetchLocationList();
  }, [city, startDate, endDate, fetchMyChoizeLocationList]); // Corrected dependencies

  const uploadDocs = async (images) => {
    try {
      if (!images) {
        return {
          LicenseBack: null,
          LicenseFront: null,
          aadhaarBack: null,
          aadhaarFront: null,
        };
      }

      const timestamp = Date.now();
      const folderPath = `userImages/${formData.email}_${timestamp}`;

      const imageUrls = await Promise.all(
        images.map(async (image) => {
          const fileRef = ref(appStorage, `${folderPath}/${image.name}`);
          await uploadBytes(fileRef, image.file_object);
          return await getDownloadURL(fileRef);
        })
      );

      // URLs of uploaded images
      const [aadharFrontUrl, aadharBackUrl, licenseFrontUrl, licenseBackUrl] =
        imageUrls;

      const documents = {
        LicenseBack: licenseBackUrl,
        LicenseFront: licenseFrontUrl,
        aadhaarBack: aadharBackUrl,
        aadhaarFront: aadharFrontUrl,
      };

      return documents;
    } catch (error) {
      console.error("Error uploading documents to Firebase:", error);
    }
  };

  const saveSuccessfulBooking = async (paymentId, booking_id = null) => {
    const phone = customerPhone || formData.phone;
    const formattedPhoneNumber = phone.startsWith("+91")
      ? phone
      : `+91${phone}`;

    const bookingId = booking_id || "Z" + new Date().getTime().toString();
    const documents = await uploadDocs(uploadDocData);

    const bookingDataStructure = {
      Balance: 0,
      CarImage: car.images[0],
      CarName: `${car.brand} ${car.name}`,
      City: city,
      DateOfBirth: formData?.dob || "",
      DateOfBooking: Date.now(),
      Documents: documents,
      Drive: "",
      Email: formData?.email || customerEmail,
      EndDate: endDateFormatted,
      EndTime: "",
      FirstName: formData?.userName || customerName,
      MapLocation: car.address,
      "Package Selected":
        car.source === "Zymo"
          ? `${car.total_km[car.selectedPackage]} KMs`
          : findPackage(car.rateBasis),
      PhoneNumber: formData?.phone || formattedPhoneNumber,
      "Pickup Location": selectedPickupLocation?.LocationName || car.address,
      "Promo Code Used": "",
      SecurityDeposit: vendorDetails?.Securitydeposit,
      StartDate: startDateFormatted,
      StartTime: "",
      Street1: "",
      Street2: "",
      TimeStamp: formatDate(Date.now()),
      Transmission: car.options[0],
      UserId: userData.uid,
      Vendor: vendor,
      Zipcode: "",
      actualPrice: parseInt(car.inflated_fare.slice(1)),
      bookingId,
      deliveryType: selectedPickupLocation?.LocationName?.includes("Doorstep")
        ? "Doorstep Delivery"
        : "Self Pickup",
      paymentId,
      price: payableAmount,
    };
    setBookingData(bookingDataStructure);

    await addDoc(
      collection(appDB, "CarsPaymentSuccessDetails"),
      bookingDataStructure
    );

    return bookingId;
  };

  // Sends whatsapp notif to both user and zymo(other vendor )
  const sendWhatsappNotifMychoizeBooking = async (bookingId) => {
    const formattedPhoneNumber = formData.phone.startsWith("+91")
      ? formData.phone
      : `+91${formData.phone}`;
    const data = {
      id: bookingId,
      customerName: formData?.userName || customerName,
      dateOfBirth: formData?.dob || "Not Provided",
      phone: formData?.phone || formattedPhoneNumber,
      email: formData?.email || customerEmail,
      startDate: startDateFormatted,
      endDate: endDateFormatted,
      city: city,
      pickupLocation: selectedPickupLocation?.HubAddress || car.address,
      amount: formatFare(payableAmount),
      vendorName: vendor,
      vendorLocation: car.address,
      model: `${car.brand} ${car.name}`,
      transmission: car.options[0],
      package: findPackage(car.rateBasis),
      // freeKMs: "limited",
      paymentMode: "Online (Razorpay)",
      serviceType: "Online",
    };

    await fetch(`${functionsUrl}/message/booking-confirmation-other-vendor`, {
      method: "POST",
      body: JSON.stringify({
        data,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  // Sends whatsapp notif to both user and zymo(vendor is zoomCar)
  const sendWhatsappNotifZoomcarBooking = async (bookingId) => {
    const formattedPhoneNumber = customerPhone.startsWith("+91")
      ? customerPhone
      : `+91${customerPhone}`;
    const data = {
      id: bookingId,
      customerName: formData?.userName || customerName,
      phone: formData?.phone || formattedPhoneNumber,
      email: formData?.email || customerEmail,
      startDate: startDateFormatted,
      endDate: endDateFormatted,
      city: city,
      pickupLocation: selectedPickupLocation?.HubAddress || car.address,
      model: `${car.brand} ${car.name}`,
      transmission: car.options[0],
      freeKMs: "Unlimited",
    };

    await fetch(`${functionsUrl}/message/booking-confirmation-zoomcar-vendor`, {
      method: "POST",
      body: JSON.stringify({
        data,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  // Booking handling
  const handleMychoizeBooking = async (paymentData) => {
    setLoading(true);
    saveSuccessfulBooking(paymentData.razorpay_payment_id)
      .then((bookingId) => {
        setLoading(false);
        sendWhatsappNotifMychoizeBooking(bookingId);
        setIsConfirmPopupOpen(true);
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
        toast.error("Booking creation failed...", {
          position: "top-center",
          autoClose: 5000,
        });
      });
  };

  const handleZoomcarBooking = async (paymentData) => {
    try {
      const bookingId = await retryFunction(createBooking);
      saveSuccessfulBooking(paymentData.razorpay_payment_id, bookingId);
      sendWhatsappNotifZoomcarBooking(bookingId);
      setIsConfirmPopupOpen(true);
    } catch (error) {
      console.error(error.message);
      toast.error("Booking Creation Failed...", {
        position: "top-center",
        autoClose: 5000,
      });
    }
    // initiateRefund(data.razorpay_payment_id).then(
    //     (refundResponse) => {
    //         if (refundResponse.status === "processed") {
    //             navigate("/");
    //             toast.success(
    //                 "A refund has been processed, please check your mail for more details",
    //                 {
    //                     position: "top-center",
    //                     autoClose: 1000 * 10,
    //                 }
    //             );
    //         }
    //     }
    // );
  };

  const createBooking = async () => {
    const startDateEpoc = Date.parse(startDate);
    const endDateEpoc = Date.parse(endDate);

    const response = await fetch(
      `${functionsUrl}/zoomcar/bookings/create-booking`,
      {
        method: "POST",
        body: JSON.stringify({
          customer: {
            uid: userData.uid,
            name: customerName,
            phone: customerPhone,
            email: customerEmail,
          },
          booking_params: {
            type: "normal",
            cargroup_id: car.cargroup_id,
            car_id: car.id,
            city: city,
            ends: endDateEpoc,
            fuel_included: false,
            lat: car.lat,
            lng: car.lng,
            pricing_id: car.pricing_id,
            search_location_id: car.location_id,
            starts: startDateEpoc,
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== 1) {
      const msg = data.msg || "Something went wrong...";
      toast.error(msg, {
        position: "top-center",
        autoClose: 1000 * 5,
      });
      return;
    }

    toast.info("Booking process started...", {
      position: "top-center",
      autoClose: 1000 * 5,
    });

    const bookingId = data.booking.confirmation_key;
    const amount = data.booking.fare.total_amount;

    const paymentUpdateData = await retryFunction(updateBookingPayment, [
      bookingId,
      amount,
    ]);
    if (paymentUpdateData.status != 1) {
      toast.error(paymentUpdateData.msg || "Error while payment update", {
        position: "top-center",
        autoClose: 1000 * 5,
      });
    }
    return bookingId;
  };

  const updateBookingPayment = async (bookingId, amount) => {
    const response = await fetch(`${functionsUrl}/zoomcar/payments`, {
      method: "POST",
      body: JSON.stringify({
        customer: {
          uid: userData.uid,
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
        },
        city,
        bookingData: {
          booking_id: bookingId,
          amount: amount,
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`${response.status} (${response.statusText})`);
    }

    const data = await response.json();
    return data;
  };

  //Create order
  const createOrder = async (amount, currency) => {
    try {
      const response = await axios.post(
        `${functionsUrl}/payment/create-order`,
        {
          amount,
          currency,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Error creating payment", {
        position: "top-center",
        autoClose: 1000 * 5,
      });
      throw error;
    }
  };

  const initiateRefund = async (payment_id) => {
    try {
      const response = await axios.post(`${functionsUrl}/payment/refund`, {
        payment_id,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error refunding order:", error);
      toast.error(`Error initiating refund: ${error.message}`, {
        position: "top-center",
        autoClose: 1000 * 5,
      });
    }
  };

  const handleCustomerDetails = () => {
    if (!customerName || !customerEmail || !customerPhone) {
      toast.warn("Please fill the customer details....", {
        position: "top-center",
        autoClose: 1000 * 3,
      });
      return false;
    }

    if (customerPhone.length !== 10 || isNaN(customerPhone)) {
      toast.warn("Invalid phone number", {
        position: "top-center",
        autoClose: 1000 * 3,
      });
      return false;
    }
    return true;
  };

  const handleBooknpay = (label) => {
    trackEvent("Car Book&Pay Section", "Clicked book&pay car!", label);
  };

  const handlePayment = async () => {
    handleBooknpay("Book & Pay");
    if (car.source != "mychoize" && !handleCustomerDetails()) {
      return;
    }

    await delay(1000);
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      console.error("Razorpay SDK failed to load!");
      toast.error("Could not load razorpay, Please try again later...", {
        position: "top-center",
        autoClose: 1000 * 5,
      });
      return;
    }

    try {
      const amount = parseInt(payableAmount);
      const orderData = await createOrder(amount, "INR");
      const options = {
        key: import.meta.env.VITE_RAZORPAY_PROD_KEY,
        amount: orderData.amount,
        currency: "INR",
        name: "Zymo",
        description:
          "Zymo is India's largest aggregator for self-drive car rentals.",
        image: "/images/AppLogo/Zymo_Logo_payment.png",
        order_id: orderData.id,
        handler: async function (response) {
          const data = {
            ...response,
          };
          const res = await axios.post(
            `${functionsUrl}/payment/verifyPayment`,
            data
          );

          // Payment successful
          if (res.data.success) {
            if (vendor === "Mychoize") {
              handleMychoizeBooking(data);
            } else if (vendor === "ZoomCar") {
              handleZoomcarBooking(data);
            }
          } else {
            toast.error("Payment error, Please try again...", {
              position: "top-center",
              autoClose: 1000 * 5,
            });
          }
        },
        theme: {
          color: "#edff8d",
          backdrop_color: "#212121",
        },
        prefill: {
          name: userData.name,
          email: userData.email,
          contact: userData.phone,
        },
      };

      var rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", async function (response) {
        console.log("Payment failed:", response.error);
        console.log(response.error.metadata.order_id);
        console.log(response.error.metadata.payment_id);
      });

      rzp1.on("payment.error", function (response) {
        console.log("Payment error:", response.error);
      });

      rzp1.open();
    } catch (error) {
      console.error("Error during payment initiation:", error);
    }
  };

  const handleUploadDocuments = () => {
    if (!selectedPickupLocation || !selectedDropLocation) {
      toast.warn("Please choose the pickup and drop locations", {
        position: "top-center",
        autoClose: 1000 * 3,
      });
      return;
    }

    setShowFormPopup(true);
  };

  const parseNumericRupee = (value) => {
    if (!value || typeof value !== "string") return 0;
    const cleaned = value.replace(/[^0-9.]/g, "");
    const num = Number(cleaned);
    return isNaN(num) ? 0 : num;
  };

  return (
    <div className="min-h-screen bg-[#212121]">
      <BookingPageLoading isOpen={loading} />

      {/* Header */}
      <NavBar />

      <div className="bg-black flex lg:pl-20 pl-5 pt-2 gap-10 items-center">
        <button
          className="cursor-pointer text-white"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft />
        </button>
        <div>
          <span className="text-sm text-white/75 block text-center">
            Location
          </span>
          <div className="bg-[#212121] w-fit px-4 py-2 rounded-xl flex items-center gap-4 text-white">
            <MapPinIcon className="w-4" />
            <span>{preBookingData.pickup.city}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative flex flex-col-reverse lg:items-start items-center xl:gap-16 gap-10 lg:flex-row-reverse lg:justify-between mx-auto p-5 lg:px-20 text-white bg-black">
        <div className="lg:w-1/4 flex flex-col gap-10 h-fit sticky top-10 min-w-[275px] w-full">
          {/* Fare Details  */}
          <div className="bg-[#212121] rounded-md p-10">
            <h2 className="text-2xl font-bold mb-2">Fare Summary</h2>

            <div className="my-2 flex items-center justify-between">
              <div className="flex items-center gap-2 cursor-pointer">
                <img
                  src="/images/Booking/plus.png"
                  alt="plus-icon"
                  className="w-3 h-3"
                />
                <span>Base Fare</span>
              </div>
              <span>{preBookingData.fareDetails.base}</span>
            </div>
            <hr className="border-white/25" />

            {parseNumericRupee(preBookingData.fareDetails.gst) > 0 && (
              <>
                <div className="my-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 cursor-pointer">
                    <img
                      src="/images/Booking/plus.png"
                      alt="plus-icon"
                      className="w-3 h-3"
                    />
                    <span>GST</span>
                  </div>
                  <span>{preBookingData.fareDetails.gst}</span>
                </div>
                <hr className="border-white/25" />
              </>
            )}

            {parseNumericRupee(preBookingData.fareDetails.deposit) > 0 && (
              <>
                <div className="my-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 cursor-pointer">
                    <img
                      src="/images/Booking/plus.png"
                      alt="plus-icon"
                      className="w-3 h-3"
                    />
                    <span>Security Deposit</span>
                  </div>
                  <span>{preBookingData.fareDetails.deposit}</span>
                </div>
                <hr className="border-white/25" />
              </>
            )}

            {parseNumericRupee(preBookingData.fareDetails.discount) > 0 && (
              <>
                <div className="my-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 cursor-pointer">
                    <img
                      src="/images/Booking/plus.png"
                      alt="plus-icon"
                      className="w-3 h-3"
                    />
                    <span>Discount</span>
                  </div>
                  <span>- {preBookingData.fareDetails.discount}</span>
                </div>
                <hr className="border-white/25" />
              </>
            )}

            {parseNumericRupee(deliveryCharges) > 0 && (
              <>
                <div className="my-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 cursor-pointer">
                    <img
                      src="/images/Booking/plus.png"
                      alt="plus-icon"
                      className="w-3 h-3"
                    />
                    <span>Delivery Charges</span>
                  </div>
                  <span>{deliveryCharges}</span>
                </div>
                <hr className="border-white/25" />
              </>
            )}
            <hr className="border-white/75" />

            <div className="my-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-appColor">Total Fare</span>
              </div>
              <span className="text-appColor">
                {preBookingData.fareDetails.payable_amount}
              </span>
            </div>
          </div>

          {/* Coupons and Offers */}
          <div className="bg-[#212121] rounded-md overflow-hidden mx-auto">
            <div className="px-10 py-4 bg-appColor">
              <h2 className="text-darkGrey font-bold text-xl">
                Coupons and Offers
              </h2>
            </div>
            <div className="px-10 py-5">
              <input
                className="bg-darkGrey2 w-full p-2 pl-4 rounded-md"
                placeholder="Enter Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-center cursor-pointer">
              <span className="py-4 text-sm text-appColor">
                VIEW ALL OFFERS{" "}
              </span>
              <img
                src="/images/Booking/arrow-down.png"
                alt="arrow-down"
                className="w-4 h-[6px] pl-2"
              />
            </div>
          </div>

          {/* Book Button */}
          {car.source === "zoomcar" ? (
            <div className="flex justify-center items-center">
              <button
                className="text-black border-2 border-appColor bg-appColor hover:bg-transparent hover:border-appColor hover:border-2 hover:text-appColor px-6 py-2 rounded-lg font-semibold transition-colors duration-300 cursor-pointer"
                onClick={handlePayment}
              >
                Book & Pay
              </button>
            </div>
          ) : (
            <div className="flex justify-center items-center">
              <button
                className="text-black border-2 border-appColor bg-appColor hover:bg-transparent hover:border-appColor hover:border-2 hover:text-appColor px-6 py-2 rounded-lg font-semibold transition-colors duration-300 cursor-pointer"
                onClick={handlePayment}
                disabled={!customerUploadDetails}
              >
                Book & Pay
              </button>
            </div>
          )}
        </div>

        {/* <button 
          className="absolute top-7 md:left-16 left-6 cursor-pointer"
          onClick={() => navigate(-1)}
          >
          <ArrowLeft />
        </button>    
        <div className="absolute top-7 md:left-44 left-[50%] translate-x-[-50%] bg-[#212121] px-4 py-2 rounded-xl flex items-center gap-4">
          <span className="absolute -top-6 left-[50%] translate-x-[-50%] text-sm text-white/50">Location</span>
          <MapPinIcon  className="w-4"/>
          <span>{preBookingData.pickup.city}</span>
        </div> */}

        <div className="lg:w-3/4 sm:py-10 sm:px-5 p-2 bg-[#212121] rounded-md w-full">
          <div className="flex flex-col sm:flex-row items-center flex-wrap justify-evenly gap-2 mb-10 w-full">
            {/* Car Image */}
            <CarImageSlider preBookingData={preBookingData} />

            <div className="flex flex-col gap-3 xl:items-start items-center mt-5 xl:mt-0">
              <div className="flex-1 min-w-[200px] text-xl text-center lg:text-left">
                <h2 className="font-bold text-2xl mb-1">
                  {preBookingData.headerDetails.name}
                </h2>
              </div>
              <div className="flex-1 flex justify-center lg:justify-start items-center sm:gap-10 gap-5 text-base">
                <p className="text-muted-foreground whitespace-nowrap">
                  Fulfilled by:
                </p>
                <img
                  src={car.sourceImg}
                  alt={car.source}
                  className="h-10 bg-white p-2 rounded-md"
                />
              </div>

              {/* Rating */}
              <div className="flex items-center bg-[#faffa3] w-fit sm:px-3 px-2 sm:py-1 py-[2px] rounded-md">
                <span className="text-[#212121] font-bold">
                  {preBookingData.headerDetails.rating} ★
                </span>
              </div>

              {/* Labels */}
              <div>
                <div className="flex items-center sm:gap-5 gap-3">
                  <div className="flex items-center sm:gap-2 gap-1">
                    <img
                      src="/images/Booking/gear wheel.png"
                      alt="gear-wheel"
                      className="w-4 h-4"
                    />
                    <span>{preBookingData.carDetails.transmission}</span>
                  </div>
                  <div className="flex items-center sm:gap-2 gap-1">
                    <img
                      src="/images/Booking/gas.png"
                      alt="gas-pipe"
                      className="w-4 h-4"
                    />
                    <span>{preBookingData.carDetails.fuel}</span>
                  </div>
                  <div className="flex items-center sm:gap-2 gap-1">
                    <img
                      src="/images/Booking/seat.png"
                      alt="seat-icon"
                      className="w-4 h-4"
                    />
                    <span>{preBookingData.carDetails.seats}</span>
                  </div>
                </div>
                <div className="flex items-center xl:justify-start justify-center mt-2">
                  <p>
                    Package: <span>{preBookingData.carDetails.package}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative w-full sm:my-20 my-32 flex flex-col sm:flex-row sm:items-end gap-4 justify-between xl:px-16">
            <div className="max-w-[150px] flex flex-col text-center sm:static absolute top-[-5rem] left-16">
              <span className="text-white/50 sm:block mb-2 text-sm hidden">
                Start Date
              </span>
              <p className="flex gap-2 sm:flex-row-reverse flex-row items-center">
                <Calendar className="text-appColor sm:self-end xl:w-8 xl:h-8 sm:w-6 sm:h-6 w-4 h-4" />
                <span className="font-bold xl:text-base text-sm">
                  {preBookingData.pickup.startDate}
                </span>
              </p>
            </div>

            <div className="flex items-center justify-center sm:static absolute top-2 left-[0.4rem] gap-2 sm:mb-3 sm:rotate-0 rotate-90 sm:w-full w-32">
              {/* <span className="border-2 border-appColor sm:w-4 xl:h-3 w-10 h-2 rounded-full "></span> */}
              <div className="w-full">
                <img
                  src="/images/Booking/dotted line.png"
                  alt="dotted-lines"
                  className="w-full"
                />
                <span className="absolute sm:top-[-3rem] top-[-5.5rem] left-[50%] sm:w-full w-36 translate-x-[-50%] text-center text-sm sm:rotate-0 rotate-[-90deg] text-white/50">
                  {preBookingData.pickup.tripDuration}
                </span>
              </div>
              {/* <span className="border-2 border-appColor sm:w-4 xl:h-3 w-10 h-2 rounded-full "></span> */}
            </div>

            <div className="max-w-[150px] flex flex-col text-center sm:static absolute bottom-[-6rem] left-16">
              <span className="text-white/50 sm:block mb-2 text-sm hidden">
                End Date
              </span>
              <p className="flex gap-2 items-center">
                <Calendar className="text-appColor sm:self-end xl:w-8 xl:h-8 sm:w-6 sm:h-6 w-4 h-4" />
                <span className="font-bold xl:text-base text-sm">
                  {preBookingData.pickup.endDate}
                </span>
              </p>
            </div>
          </div>

          {/* Pickup Details */}

          {car.source === "mychoize" && (
            <div className="max-w-3xl mx-auto rounded-lg bg-[#303030] p-5">
              <div className="mt-5 mb-4">
                <label className="block text-sm font-medium mb-1 text-[#faffa4]">
                  Pickup Location | Time | Charges
                </label>
                <div
                  className="bg-[#404040] text-white p-3 rounded-md cursor-pointer"
                  onClick={() => setShowPickupPopup(true)}
                >
                  {selectedPickupLocation
                    ? `${selectedPickupLocation.LocationName} | ${
                        selectedPickupLocation.IsPickDropChargesApplicable
                          ? `₹${selectedPickupLocation.DeliveryCharge}`
                          : "FREE"
                      }`
                    : "Select pickup location"}
                </div>
                <textarea
                  disabled
                  className="w-full mt-2 p-3 bg-[#404040] rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#faffa4]"
                  placeholder={
                    selectedPickupLocation
                      ? selectedPickupLocation.HubAddress
                      : ""
                  }
                  rows="3"
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-[#faffa4]">
                  Drop Location | Time | Charges
                </label>
                <div
                  className="bg-[#404040] text-white p-3 rounded-md cursor-pointer"
                  onClick={() => setShowDropupPopup(true)}
                >
                  {selectedDropLocation
                    ? `${selectedDropLocation.LocationName} | ${
                        selectedDropLocation.IsPickDropChargesApplicable
                          ? `₹${selectedDropLocation.DeliveryCharge}`
                          : "FREE"
                      }`
                    : "Select drop location"}
                </div>
                <textarea
                  disabled
                  className="w-full mt-2 p-3 bg-[#404040] rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#faffa4]"
                  placeholder={
                    selectedDropLocation ? selectedDropLocation.HubAddress : ""
                  }
                  rows="3"
                ></textarea>
              </div>

              {showPickupPopup && (
                <PickupPopup
                  setIsOpen={setShowPickupPopup}
                  pickupLocations={mychoizePickupLocations}
                  setSelectedPickupLocation={setSelectedPickupLocation}
                />
              )}
              {showDropupPopup && (
                <DropupPopup
                  setIsOpen={setShowDropupPopup}
                  dropupLocations={mychoizeDropupLocations}
                  setSelectedDropLocation={setSelectedDropLocation}
                />
              )}
            </div>
          )}

          {/* zoom car section */}
          {car.source === "zoomcar" && (
            <div className="max-w-3xl mx-auto rounded-lg bg-[#303030] p-1 ">
              {/* <div className="min-h-screen  flex flex-col items-center justify-center p-4 space-y-4"> */}
              {/* White card with logo and booking text */}
              <div className=" rounded-xl shadow-md p-6  text-center ">
                <div className="img-container flex justify-center p-2  ">
                  <img
                    src={car.sourceImg}
                    alt={car.source}
                    className="h-14 bg-white p-3 rounded-md"
                  />
                </div>

                <p className="text-[#fff] p-4">
                  Sign into ZoomCar using your number <br />
                  <span className="font-bold text-[#fff]">
                    {" "}
                    {preBookingData.customer.mobile}
                  </span>{" "}
                  to view your booking.
                </p>
              </div>

              {/* yellow notice box */}
              <div className="bg-[#faffa4] text-[#212121] rounded-xl shadow-md py-6 px-3 text-center">
                <h2 className="text-lg font-semibold mb-3">Please Note</h2>
                <p className="mb-3">
                  As per ZoomCar policy you will have to upload your driving
                  license and Aadhaar card on the ZoomCar app.
                </p>
                <p className="mb-2">
                  If you already have a ZoomCar profile use the same mobile
                  number registered with Zoomcar.
                </p>
                <p className="text-sm italic">
                  (Creation of second profile is not allowed by Zoomcar).
                </p>
              </div>
            </div>
          )}

          {/* Customer Input Fields */}
          <div className="max-w-3xl mx-auto rounded-lg bg-[#303030] p-5">
            <h3 className="text-center mb-1 text-white text-3xl font-bold">
              Customer Details
            </h3>
            {car.source !== "zoomcar" ? (
              <p className="text-center text-gray-400 text-sm mb-4">
                (You must add your details and documents to continue)
              </p>
            ) : (
              ""
            )}
            <hr className="my-1 mb-5 border-gray-500" />
            {car.source === "zoomcar" ? (
              <div className="space-y-4">
                {/* Name Input */}
                <div className="flex flex-col">
                  <label className="text-lg text-appColor">Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="p-2 rounded-lg bg-gray-500/30 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-appColor"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Phone Input */}
                <div className="flex flex-col">
                  <label className="text-lg text-appColor">Phone</label>
                  <input
                    type="text"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="p-2 rounded-lg bg-gray-500/30 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-appColor"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Email Input */}
                <div className="flex flex-col">
                  <label className="text-lg text-appColor">Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="p-2 rounded-lg bg-gray-500/30 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-appColor"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center">
                <button
                  className={`px-6 py-2 rounded-lg font-semibold  transition-colors
                                ${
                                  !customerUploadDetails
                                    ? "text-black bg-appColor hover:bg-[#e2ff5d] cursor-pointer"
                                    : "text-appColor bg-transparent border-2 border-appColor cursor-not-allowed"
                                }`}
                  onClick={handleUploadDocuments}
                  disabled={customerUploadDetails}
                >
                  Upload Documents
                </button>
                {customerUploadDetails ? (
                  <p className="mt-4 text-green-400 text-sm">
                    Details and Documents uploaded successfully
                  </p>
                ) : (
                  ""
                )}

                {showFormPopup && (
                  <BookingPageFormPopup
                    isOpen={showFormPopup}
                    setIsOpen={setShowFormPopup}
                    setUserFormData={setFormData}
                    showUploadPopup={setShowUploadPopup}
                  />
                )}
                {showUploadPopup && (
                  <BookingPageUploadPopup
                    isOpen={showUploadPopup}
                    setIsOpen={setShowUploadPopup}
                    setUserUploadData={setUploadDocData}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmPage
        isOpen={isConfirmPopupOpen}
        close={() => setIsConfirmPopupOpen(false)}
      />
    </div>
  );
}

export default BookingPage;
