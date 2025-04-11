import { useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Webcam from "react-webcam";
import axios from "axios";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import ExtendedTestDriveConfirmPage from "../../components/buycomponent/ExtendedTestDriveConfirmPage";
import UploadSection from "../../components/buycomponent/UploadSection";
import { useEffect } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { webDB, webStorage } from "../../utils/firebase";

import useTrackEvent from "../../hooks/useTrackEvent";

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

const dataURLtoFile = (dataURL, filename) => {
  const arr = dataURL.split(","),
    mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

const ExtendedTestDriveUploadDocuments = ({ title }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [aadharFrontImage, setAadharFrontImage] = useState(null);
  const [aadharBackImage, setAadharBackImage] = useState(null);
  const [drivingFrontImage, setDrivingFrontImage] = useState(null);
  const [drivingBackImage, setDrivingBackImage] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [currentDocType, setCurrentDocType] = useState("aadhar");
  const [currentPage, setCurrentPage] = useState("front");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const trackEvent = useTrackEvent();
  const { car, startDate, endDate, userData } = location.state || {};

  // console.log("car:",car);
  // console.log("StartDate:",startDate);
  // console.log("EndDate:",endDate);
  // console.log("UserData:",userData);
  useEffect(() => {
    document.title = title;
  }, [title]);

  const functionsUrl = import.meta.env.VITE_FUNCTIONS_API_URL;
  const allImagesUploaded =
    drivingFrontImage &&
    drivingBackImage &&
    aadharFrontImage &&
    aadharBackImage;

  const resetAllState = () => {
    setAadharFrontImage(null);
    setAadharBackImage(null);
    setDrivingFrontImage(null);
    setDrivingBackImage(null);
    setCameraOpen(false);
    setCurrentDocType("aadhar");
    setCurrentPage("front");
  };

  // To handle image upload
  const handleImageUpload = (type, page, docType) => {
    setCurrentDocType(docType);
    setCurrentPage(page);

    if (type === "camera") {
      setCameraOpen(true);
    } else {
      // Handle Gallery
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";

      input.onchange = (e) => {
        const file = e.target?.files?.[0];
        if (file) {
          if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file", {
              position: "top-center",
              autoClose: 1000,
            });
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            const imageUrl = reader.result;
            if (docType === "driving") {
              if (page === "front") {
                setDrivingFrontImage(imageUrl);
              } else {
                setDrivingBackImage(imageUrl);
              }
            } else if (docType === "aadhar") {
              if (page === "front") {
                setAadharFrontImage(imageUrl);
              } else {
                setAadharBackImage(imageUrl);
              }
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  };

  //Capture Photo
  const capturePhoto = (imageSrc) => {
    if (currentDocType === "driving") {
      if (currentPage === "front") {
        setDrivingFrontImage(imageSrc);
      } else {
        setDrivingBackImage(imageSrc);
      }
    } else if (currentDocType === "aadhar") {
      if (currentPage === "front") {
        setAadharFrontImage(imageSrc);
      } else {
        setAadharBackImage(imageSrc);
      }
    }
    setCameraOpen(false);
  };

  //Webcam Capture
  const WebcamCapture = () => {
    return (
      <Webcam
        audio={false}
        height={500}
        screenshotFormat="image/jpeg"
        width={500}
        className="text-center"
      >
        {({ getScreenshot }) => (
          <button
            onClick={() => {
              const imageSrc = getScreenshot();
              if (imageSrc) {
                capturePhoto(imageSrc);
              }
            }}
            className="mt-4 bg-[#edff8d] p-3 rounded-lg text-black"
          >
            Capture photo
          </button>
        )}
      </Webcam>
    );
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

  //Handle Payment
  const handlePayment = async () => {
    await delay(1000);
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      console.error("Razorpay SDK failed to load!");
      toast.error("Could not load Razorpay, Please try again later...", {
        position: "top-center",
        autoClose: 5000,
      });
      return false;
    }
    toast.dismiss();
    try {
      const amount = parseInt(car.totalAmount);
      const orderData = await createOrder(amount, "INR");

      return new Promise((resolve, reject) => {
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
            try {
              const data = { ...response };

              // console.log("Order ID:", response.razorpay_order_id);
              // console.log("Payment ID:", response.razorpay_payment_id);

              const res = await axios.post(
                `${functionsUrl}/payment/verifyPayment`,
                data
              );

              if (res.data.success) {
                resolve({
                  success: true,
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                });
              } else {
                toast.error("Payment error, Please try again...", {
                  position: "top-center",
                  autoClose: 5000,
                });
                resetAllState();
                resolve(false);
              }
            } catch (error) {
              console.error("Error verifying payment:", error);
              resolve(false);
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
        rzp1.on("payment.failed", function (response) {
          console.log("Payment failed:", response.error);
          reject(false);
        });

        rzp1.on("payment.error", function (response) {
          console.log("Payment error:", response.error);
          reject(false);
        });

        rzp1.open();
      });
    } catch (error) {
      console.error("Error during payment initiation:", error);
      return false;
    }
  };

  //Firebase Upload Logic
  const uploadDataToFirebase = async (images, orderId, paymentId) => {
    try {
      toast.loading("Verifying your payment...", {
        style: {
          backgroundColor: "#edff8d",
          color: "#000",
          fontWeight: "bold",
        },
        autoClose: 5000,
      });
      // Create a timestamp for the folder name once
      const timestamp = Date.now();
      const folderPath = `documents/${userData.email}_${timestamp}`;

      const imageUrls = await Promise.all(
        images.map(async (image) => {
          const fileRef = ref(webStorage, `${folderPath}/${image.name}`);
          await uploadBytes(fileRef, image.file_object);
          return await getDownloadURL(fileRef);
        })
      );

      //Extract URLs of uploaded images
      const [aadharFrontUrl, aadharBackUrl, licenseFrontUrl, licenseBackUrl] =
        imageUrls;

      const data = {
        carId: car.carId,
        bookingId: "Z" + new Date().getTime().toString(),
        carName: car.name,
        carModel: car.model,
        carType: car.type,
        startDate: startDate,
        endDate: endDate,
        userName: userData.userName,
        email: userData.email,
        phone: userData.phone,
        dob: userData.dob,
        address: userData.address,
        city: userData.city,
        pincode: userData.pincode,
        documents: {
          aadhaarFront: aadharFrontUrl,
          aadhaarBack: aadharBackUrl,
          licenseFront: licenseFrontUrl,
          licenseBack: licenseBackUrl,
        },
        orderId: orderId,
        paymentId: paymentId,
        price: car.totalAmount,
        bookingType: "Extended Test Drive",
        createdAt: new Date(),
      };

      // Add data to Firebase collection
      await addDoc(collection(webDB, "BuySectionBookingDetail"), data);
      setBookingData(data);
      // console.log("Data uploaded to Firebase:", data);

      toast.dismiss();
      setIsConfirmed(true);
      resetAllState();
    } catch (error) {
      console.error("Error uploading documents to Firebase:", error);
    }
  };

  //On Submit
  const handleSubmit = async () => {
    try {
      // Check if all required documents are uploaded
      const images = [
        { file: aadharFrontImage, name: "front_page_aadhar_license" },
        { file: aadharBackImage, name: "back_page_aadhar_license" },
        { file: drivingFrontImage, name: "front_page_driving_license" },
        { file: drivingBackImage, name: "back_page_driving_license" },
      ];

      // Convert base64 strings to File objects and add a 'file_object' property
      const convertedImages = images.map((img) => {
        if (img.file && img.file.startsWith("data:image")) {
          return {
            file: img.file,
            name: img.name,
            file_object: dataURLtoFile(img.file, img.name),
          };
        }
        return img;
      });

      const missingImages = convertedImages.filter((img) => !img.file_object);

      if (missingImages.length > 0) {
        toast.error("Please upload all the required documents", {
          position: "top-center",
          autoClose: 3000,
        });
        return;
      }
      toast.loading("Redirecting to Payment Dashboard...", {
        style: {
          backgroundColor: "#edff8d",
          color: "#000",
          fontWeight: "bold",
        },
        autoClose: 5000,
      });
      // Proceed with payment first & After payment is successful, upload the data to Firebase
      const paymentSuccess = await handlePayment();

      if (!paymentSuccess.success) {
        console.error("Payment failed, not proceeding with Firebase upload.");
        return;
      }

      await uploadDataToFirebase(
        convertedImages,
        paymentSuccess.orderId,
        paymentSuccess.paymentId
      );

      trackEvent(
        "Extended Test Drive Booking",
        "Extended Test Drive",
        "User Documents Uploaded"
      );
    } catch (error) {
      console.error("Error uploading images:", error);
      resetAllState();
    }
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta
          name="description"
          content="Upload required documents to confirm your test drive appointment with Zymo."
        />
        <meta property="og:title" content={title} />
        <meta
          property="og:description"
          content="Securely upload your driving license and other documents to confirm your test drive."
        />
        <link rel="canonical" href="https://zymo.app/buy/upload-doc" />
      </Helmet>
      <div className="min-h-screen bg-[#212121]  text-white px-4 md:px-8">
        <div className="container mx-auto max-w-4xl py-8">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-1 md:left-5 top-10 p-2 text-white/80 hover:text-white hover:bg-[#2A2A2A] bg-transparent transition-all "
          >
            <ArrowLeft size={30} />
          </button>

          <div className="text-center mb-6 md:mb-10">
            <h1 className="text-xl md:text-4xl font-bold">
              You&apos;re just one step away from{" "}
              <span className="text-[#edff8d]">Booking</span>
            </h1>
          </div>

          <div className="bg-[#2A2A2A] p-6 md:p-8 rounded-xl shadow-2xl border border-white/10">
            <div className="space-y-8">
              <UploadSection
                title="Upload Driving License Front Page"
                image={drivingFrontImage}
                onUpload={(type) => handleImageUpload(type, "front", "driving")}
              />

              <UploadSection
                title="Upload Driving License Back Page"
                image={drivingBackImage}
                onUpload={(type) => handleImageUpload(type, "back", "driving")}
              />

              <UploadSection
                title="Upload Aadhar Card Front Page"
                image={aadharFrontImage}
                onUpload={(type) => handleImageUpload(type, "front", "aadhar")}
              />

              <UploadSection
                title="Upload Aadhar Card Back Page"
                image={aadharBackImage}
                onUpload={(type) => handleImageUpload(type, "back", "aadhar")}
              />
            </div>

            <button
              onClick={handleSubmit}
              className={`w-full p-4 rounded-lg font-semibold text-lg transition-transform bg-[#edff8d] text-black 
              ${
                allImagesUploaded
                  ? "hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  : "cursor-not-allowed"
              }
              mt-8`}
              disabled={!allImagesUploaded}
            >
              Proceed to Payment
            </button>
          </div>
        </div>

        {/* Modal for Camera */}
        {cameraOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-[#121212] p-6 rounded-lg w-[90%] md:w-[600px] text-white text-center relative">
              <button
                onClick={() => setCameraOpen(false)}
                className="absolute top-2 right-2 text-white"
              >
                <X size={24} />
              </button>

              <h3 className="text-xl mb-4">Take a Photo</h3>
              <div className="text-center">
                <WebcamCapture />
              </div>
            </div>
          </div>
        )}

        {/* {isLoading && (
        <PaymentConfirmationPage
          isOpen={isLoading}
          close={() => setIsLoading(false)}
        />
      )} */}

        {isConfirmed && (
          <ExtendedTestDriveConfirmPage
            isOpen={isConfirmed}
            close={() => setIsConfirmed(false)}
            bookingData={bookingData}
          />
        )}
      </div>
    </>
  );
};

export default ExtendedTestDriveUploadDocuments;
