import { ArrowLeft, MapPin, Calendar, IndianRupee, Car } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import ConfirmPage from "../components/ConfirmPage";
import { Helmet } from "react-helmet-async";
import {
  formatDate,
  formatFare,
  retryFunction,
  toPascalCase,
} from "../utils/helperFunctions";
import {
  fetchMyChoizeLocationList,
  findPackage,
  formatDateForMyChoize,
} from "../utils/mychoize";
import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";
import { appDB, webDB, webStorage } from "../utils/firebase";
import PickupPopup from "../components/PickupPopup";
import DropupPopup from "../components/DropupPopup";
import BookingPageFormPopup from "../components/BookingPageFormPopup";
import BookingPageUploadPopup from "../components/BookingPageUploadPopup";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import useTrackEvent from "../hooks/useTrackEvent";

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

function BookingPage({ title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { city } = useParams();
  const { startDate, endDate, userData, car } = location.state || {};

  const trackEvent = useTrackEvent();

  const startDateFormatted = formatDate(startDate);
  const endDateFormatted = formatDate(endDate);

  const [customerName, setCustomerName] = useState(userData.name);
  const [customerPhone, setCustomerPhone] = useState(userData.phone);
  const [customerEmail, setCustomerEmail] = useState(userData.email);
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = useState(false);
  const [vendorDetails, setVendorDetails] = useState(null);

  const [gst, setGst] = useState(0);
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
      const docRef = doc(appDB, "carvendors", vendor);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setVendorDetails(docSnap.data());
      } else {
        console.error("Vendor details not found for:", vendor);
      }
    };

    fetchVendorDetails();
  }, [car.source]);

  useEffect(() => {
    if (!car.fare || !vendorDetails) return;

    const rawFare = parseInt(car.fare.slice(1));
    const gstPercent = parseFloat(vendorDetails?.TaxSd) || 0;
    const discountPercent = parseFloat(vendorDetails?.DiscountSd) || 0;
    const deposit = parseInt(vendorDetails?.Securitydeposit) || 0;

    const gstValue = gstPercent !== 1 ? rawFare * gstPercent : 0;
    const discountValue = rawFare * (1 - discountPercent);

    setGst(gstValue);
    setDiscount(discountValue);

    const amount = rawFare + gstValue + deposit - discountValue;
    setPayableAmount(amount);
  }, [car.fare, vendorDetails]);

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
  }, [selectedPickupLocation, selectedDropLocation]);

  const formattedFare = formatFare(car.fare);

  const preBookingData = {
    headerDetails: {
      name: `${car.brand} ${car.name}`,
      type: car.options.slice(0, 3).join(" | "),
      range: `${findPackage(car.rateBasis)}`,
      image: car.images[0],
    },
    pickup: {
      startDate: startDateFormatted,
      endDate: endDateFormatted,
      city: city,
    },
    carDetails: {
      registration: vendorDetails?.plateColor || "N/A",
      package: findPackage(car.rateBasis),
      transmission: car.options[0],
      fuel: car.options[1],
      seats: car.options[2],
    },
    fareDetails: {
      base: formattedFare,
      fare: formattedFare,
      gst: car.source === "zoomcar" ? "Incl. in Base Fare" : formatFare(gst),
      deposit:
        car.source === "zoomcar"
          ? "₹0"
          : formatFare(vendorDetails?.Securitydeposit),
      discount: formatFare(discount),
      payable_amount: formatFare(payableAmount),
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
    if (vendor === "Mychoize") {
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
    }
  }, [selectedPickupLocation, selectedDropLocation]);

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
          const fileRef = ref(webStorage, `${folderPath}/${image.name}`);
          await uploadBytes(fileRef, image.file_object);
          return await getDownloadURL(fileRef);
        })
      );

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
      throw error;
    }
  };

  const saveSuccessfulBooking = async (paymentId, booking_id = null) => {
    try {
      const formattedPhoneNumber = customerPhone.startsWith("+91")
        ? customerPhone
        : `+91${customerPhone}`;
      const documents = await uploadDocs(uploadDocData);

      // Reference the user document in webUserProfiles
      const userDocRef = doc(webDB, "webUserProfiles", userData.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          uid: userData.uid,
          email: customerEmail,
          name: customerName,
          phone: customerPhone,
          createdAt: Date.now(),
        });
      }

      const bookingsCollectionRef = collection(userDocRef, "bookings");

      const bookingId = booking_id || bookingsCollectionRef.id;

      const bookingDataStructure = {
        Balance: 0,
        CarImage: car.images[0],
        CarName: car.name,
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
        "Package Selected": findPackage(car.rateBasis),
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
        actualPrice: parseInt(car.fare.slice(1)),
        bookingId,
        deliveryType: selectedPickupLocation?.LocationName?.includes("Doorstep")
          ? "Doorstep Delivery"
          : "Self Pickup",
        paymentId,
        price: payableAmount,
      };

      await addDoc(bookingsCollectionRef, bookingDataStructure);
      setBookingData(bookingDataStructure);
      return bookingId;
    } catch (error) {
      console.error("Error saving booking to Firestore:", error);
      throw error;
    }
  };

  const sendWhatsappNotif = async (bookingId) => {
    const formattedPhoneNumber = customerPhone.startsWith("+91")
      ? customerPhone
      : `+91${customerPhone}`;
    const data = {
      id: bookingId,
      customerName: formData?.userName || customerName,
      dateOfBirth: formData?.dob || "",
      phone: formData?.phone || formattedPhoneNumber,
      email: formData?.email || customerEmail,
      startDate: startDateFormatted,
      endDate: endDateFormatted,
      city: city,
      pickupLocation: selectedPickupLocation?.HubAddress || car.address,
      amount: formatFare(payableAmount),
      vendorName: vendor,
      vendorPhone: "+919987933348",
      vendorLocation: car.address,
      model: `${car.brand} ${car.name}`,
      transmission: car.options[0],
      package: findPackage(car.rateBasis),
      freeKMs: "",
      paymentMode: "Online (Razorpay)",
      serviceType: "",
    };

    await fetch(`${functionsUrl}/message/booking-confirmation`, {
      method: "POST",
      body: JSON.stringify({ data }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const handleMychoizeBooking = async (paymentData) => {
    try {
      const bookingId = await saveSuccessfulBooking(
        paymentData.razorpay_payment_id
      );
      await sendWhatsappNotif(bookingId);
      setIsConfirmPopupOpen(true);
    } catch (error) {
      console.error("Error handling Mychoize booking:", error);
      toast.error("Failed to process Mychoize booking", {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const handleZoomcarBooking = async (paymentData) => {
    try {
      const bookingId = await retryFunction(createBooking);
      await saveSuccessfulBooking(paymentData.razorpay_payment_id, bookingId);
      await sendWhatsappNotif(bookingId);
      setIsConfirmPopupOpen(true);
    } catch (error) {
      console.error("Error handling Zoomcar booking:", error);
      toast.error("Booking Creation Failed...", {
        position: "top-center",
        autoClose: 5000,
      });
    }
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
            search_location_id: car.location_id,
            ends: endDateEpoc,
            fuel_included: false,
            lat: car.lat,
            lng: car.lng,
            pricing_id: car.pricing_id,
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
    if (paymentUpdateData.status !== 1) {
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
    trackEvent("Car Book&Pay Section", "Rent Section Buttons", label);
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
        description: "Zymo is India's largest aggregator for self-drive car rentals.",
        image: "/images/AppLogo/Zymo_Logo_payment.png",
        order_id: orderData.id,
        handler: async function (response) {
          const data = { ...response };
          const res = await axios.post(
            `${functionsUrl}/payment/verifyPayment`,
            data
          );

          if (res.data.success) {
            if (vendor === "Mychoize") {
              await handleMychoizeBooking(data);
            } else if (vendor === "ZoomCar") {
              await handleZoomcarBooking(data);
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

      const rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", async (response) => {
        console.log("Payment failed:", response.error);
        console.log(response.error.metadata.order_id);
        console.log(response.error.metadata.payment_id);
      });

      rzp1.on("payment.error", (response) => {
        console.log("Payment error:", response.error);
      });

      rzp1.open();
    } catch (error) {
      console.error("Error during payment initiation:", error);
      toast.error("Error during payment initiation", {
        position: "top-center",
        autoClose: 1000 * 5,
      });
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
  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <>
      <Helmet>
        <title>Booking Confirmation - {city} | Zymo</title>
        <meta
          name="description"
          content={`Your self-drive car rental in ${city} is confirmed. Get ready for a seamless ride with Zymo.`}
        />
        <meta property="og:title" content={title} />
        <meta
          property="og:description"
          content="Thank you for choosing Zymo. Your self-drive car rental is confirmed!"
        />
        <link
          rel="canonical"
          href={`https://zymo.app/self-drive-car-rentals/${city}/cars/booking-details/confirmation`}
        />
      </Helmet>
      <div className="min-h-screen bg-[#212121]">
        {/* Header */}
        <div className="bg-[#eeff87] p-4 flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-black/10 rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold flex-grow text-center">
            Confirm Booking
          </h1>
        </div>

        {/* Main Content */}
        <div className="mx-auto p-6 sm:p-10 lg:p-20 space-y-5 text-white">
          {/* Header Details */}
          <div className="flex flex-wrap justify-between items-center gap-5 rounded-lg p-6 shadow-sm w-full">
            <div className="flex-1 min-w-[200px] text-xl">
              <h2 className="font-semibold mb-2">
                {preBookingData.headerDetails.name}
              </h2>
            </div>

            <div className="flex-1 flex justify-center -mt-10">
              <img
                src={preBookingData.headerDetails.image || "/placeholder.svg"}
                alt={`${preBookingData.headerDetails.name}`}
                className="w-full sm:w-96 lg:w-80 h-[200px] sm:h-[280px] lg:h-[200px] object-cover rounded-lg"
              />
            </div>

            <div className="flex-1 flex justify-end items-end gap-1 text-xl">
              <div className="flex flex-row items-center gap-2">
                <p className="text-muted-foreground whitespace-nowrap">
                  Fulfilled by:{" "}
                  <img src={car.sourceImg} alt={car.source} className="h-10" />
                </p>
              </div>
            </div>
          </div>

          {/* Pickup Details */}
          <div className="max-w-3xl mx-auto rounded-lg bg-[#303030] p-5">
            <h3 className="text-center mb-3 text-white text-3xl font-bold">
              Pickup Details
            </h3>
            <hr className="my-1 mb-5 border-gray-500" />
            <div className="space-y-2">
              {/* Start Date */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#eeff87]" />
                  <p>Start Date</p>
                </div>
                <p className="ml-auto text-white">
                  {preBookingData.pickup.startDate}
                </p>
              </div>

              {/* End Date */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#eeff87]" />
                  <p>End Date</p>
                </div>
                <p className="ml-auto text-white">
                  {preBookingData.pickup.endDate}
                </p>
              </div>
            </div>

            {car.source === "mychoize" ? (
              <>
                <div className="mt-5 mb-4">
                  <label className="block text-sm font-medium mb-1 text-[#faffa4]">
                    Pickup Location | Time | Charges
                  </label>
                  <div
                    className="bg-[#404040] text-white p-3 rounded-md cursor-pointer"
                    onClick={() => setShowPickupPopup(true)}
                  >
                    {selectedPickupLocation
                      ? `${selectedPickupLocation.LocationName} | ${selectedPickupLocation.IsPickDropChargesApplicable
                        ? `₹${selectedPickupLocation.DeliveryCharge}`
                        : "FREE"
                      }`
                      : "Select pickup location"}
                  </div>
                  <textarea
                    disabled
                    className="w-full mt-2 p-3 bg-[#404040] rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#faffa5]"
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
                      ? `${selectedDropLocation.LocationName} | ${selectedDropLocation.IsPickDropChargesApplicable
                        ? `₹${selectedDropLocation.DeliveryCharge}`
                        : "FREE"
                      }`
                      : "Select drop location"}
                  </div>
                  <textarea
                    disabled
                    className="w-full mt-2 p-3 bg-[#404040] rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#faffa5]"
                    placeholder={
                      selectedDropLocation
                        ? selectedDropLocation.HubAddress
                        : ""
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
              </>
            ) : null}
          </div>

          {/* Car Details */}
          <div className="max-w-3xl mx-auto rounded-lg bg-[#303030] p-5">
            <h3 className="text-center mb-6 text-white text-3xl font-bold">
              Car Details
            </h3>
            <hr className="my-1 mb-5 border-gray-500" />
            <div className="space-y-2">
              {/* Registration */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-[#eeff87]" />
                  <p>Registration</p>
                </div>
                <p className="ml-auto text-white">
                  {preBookingData.carDetails.registration}
                </p>
              </div>

              {/* Package */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-[#eeff87]" />
                  <p>Package</p>
                </div>
                <p className="ml-auto text-white">
                  {preBookingData.carDetails.package}
                </p>
              </div>

              {/* Transmission */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-[#eeff87]" />
                  <p>Transmission</p>
                </div>
                <p className="ml-auto text-white">
                  {preBookingData.carDetails.transmission}
                </p>
              </div>

              {/* Fuel */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-[#eeff87]" />
                  <p>Fuel Type</p>
                </div>
                <p className="ml-auto text-white">
                  {preBookingData.carDetails.fuel}
                </p>
              </div>

              {/* Seats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-[#eeff87]" />
                  <p>Seats</p>
                </div>
                <p className="ml-auto text-white">
                  {preBookingData.carDetails.seats}
                </p>
              </div>
            </div>
          </div>

          {/* Fare Details */}
          <div className="max-w-3xl mx-auto rounded-lg bg-[#303030] p-5">
            <h3 className="text-center mb-6 text-white text-3xl font-bold">
              Fare Details
            </h3>
            <hr className="my-1 mb-5 border-gray-500" />
            <div className="space-y-2">
              {/* Base Fare */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-[#eeff87]" />
                  <span>Base Fare</span>
                </div>
                <span className="ml-auto text-white">
                  {preBookingData.fareDetails.base}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-[#eeff87]" />
                  <span>
                    GST{" "}
                    {car.source !== "zoomcar"
                      ? `(${(vendorDetails?.TaxSd * 100).toFixed(0)}%)`
                      : ""}
                  </span>
                </div>
                <span className="ml-auto text-white">
                  {preBookingData.fareDetails.gst}
                </span>
              </div>

              {/* Refundable Deposit */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-[#eeff87]" />
                  <span>Security Deposit</span>
                </div>
                <span className="ml-auto text-white">
                  {preBookingData.fareDetails.deposit}
                </span>
              </div>

              {/* Discount */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-[#eeff87]" />
                  <span>
                    Discount{" "}
                    {`(${((1 - vendorDetails?.DiscountSd) * 100).toFixed(0)}%)`}
                  </span>
                </div>
                <span className="ml-auto text-white">
                  {`- ${preBookingData.fareDetails.discount}`}
                </span>
              </div>

              {deliveryCharges > 0 ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-[#eeff87]" />
                    <span>Delivery Charges</span>
                  </div>
                  <span className="ml-auto text-white">
                    {formatFare(deliveryCharges)}
                  </span>
                </div>
              ) : null}

              <hr className="my-0 border-gray-600" />

              {/* Payable Amount */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-[#eeff87]" />
                  <span>Payable Amount</span>
                </div>
                <span className="ml-auto text-[#eeff87]">
                  {preBookingData.fareDetails.payable_amount}
                </span>
              </div>
            </div>
          </div>

          {/* zoom car section */}
          {car.source === "zoomcar" && (
            <div className="max-w-3xl mx-auto rounded-lg bg-[#303030] p-1 ">
              {/* <div className="min-h-screen  flex flex-col items-center justify-center p-4 space-y-4"> */}
              {/* White card with logo and booking text */}
              <div className=" rounded-xl shadow-md p-6  text-center ">
                <div className="img-container flex justify-center p-2  ">
                  <img src={car.sourceImg} alt={car.source} className="h-14 bg-white p-3 rounded-md" />
                </div>


                <p className="text-[#fff] p-4">
                  Sign into ZoomCar using your number <br />
                  <span className="font-bold text-[#fff]"> {preBookingData.customer.mobile}</span> to view your booking.
                </p>
              </div>

              {/* yellow notice box */}
              <div className="bg-[#faffa4] text-[#212121] rounded-xl shadow-md py-6 px-3 text-center">
                <h2 className="text-lg font-semibold mb-3">Please Note</h2>
                <p className="mb-3">
                  As per ZoomCar policy you will have to upload your driving license and Aadhaar card on the ZoomCar app.
                </p>
                <p className="mb-2">
                  If you already have a ZoomCar profile use the same mobile number registered with Zoomcar.
                </p>
                <p className="text-sm italic">
                  (Creation of second profile is not allowed by Zoomcar).
                </p>
              </div>
              {/* </div>
              ff */}
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
            ) : null}
            <hr className="my-1 mb-5 border-gray-500" />
            {car.source === "zoomcar" ? (
              <div className="space-y-4">
                {/* Name Input */}
                <div className="flex flex-col">
                  <label className="text-lg text-[#eeff87]">Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="p-2 rounded-lg bg-gray-500/30 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-[#eeff87]"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Phone Input */}
                <div className="flex flex-col">
                  <label className="text-lg text-[#eeff87]">Phone</label>
                  <input
                    type="text"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="p-2 rounded-lg bg-gray-500/30 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-[#eeff87]"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Email Input */}
                <div className="flex flex-col">
                  <label className="text-lg text-[#eeff87]">Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="p-2 rounded-lg bg-gray-500/30 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-[#eeff87]"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center">
                <button
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors
                                ${!customerUploadDetails
                      ? "text-black bg-[#eeff87] hover:bg-[#e2ff5d] cursor-pointer"
                      : "text-[#eeff87] bg-transparent border-2 border-[#eeff87] cursor-not-allowed"
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
                ) : null}

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

          {/* Book Button */}
          {car.source === "zoomcar" ? (
            <div className="flex justify-center items-center">
              <button
                className="text-black bg-[#eeff87] hover:bg-[#e2ff5d] px-6 py-2 rounded-lg font-semibold transition-colors"
                onClick={handlePayment}
              >
                Book & Pay
              </button>
            </div>
          ) : (
            <div className="flex justify-center items-center">
              <button
                className="text-black bg-[#eeff87] hover:bg-[#e2ff5d] px-6 py-2 rounded-lg font-semibold transition-colors"
                onClick={handlePayment}
                disabled={!customerUploadDetails}
              >
                Book & Pay
              </button>
            </div>
          )}
        </div>

        <ConfirmPage
          isOpen={isConfirmPopupOpen}
          close={() => setIsConfirmPopupOpen(false)}
        />
      </div>
    </>
  );
}

export default BookingPage;
