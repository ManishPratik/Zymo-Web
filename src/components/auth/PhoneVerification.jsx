import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import {
  signInWithCustomToken,
} from "firebase/auth";
import { appAuth } from "../../utils/firebase";
import OtpInput from "./OtpInput";
import PhoneInputForm, { PhoneHeaderIcon } from "./PhoneInputForm";

const LoginPage = ({ onAuth, isOpen, onClose, authType }) => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [OTPData, setOTPData] = useState("");
  const [step, setStep] = useState("phone");  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  //? Environment variable for API URL
  const VITE_FUNCTIONS_API_URL = import.meta.env.VITE_FUNCTIONS_API_URL 
  
  //? For testing purposes, using local API URL
  // const VITE_FUNCTIONS_API_URL = "http://127.0.0.1:5001/zymo-prod/us-central1/api"; 

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    setLoading(true);
    try {
      await sendOtp(phone);
      setStep("otp");
      setTimer(30); // Set timer to 30 seconds
      toast.success("OTP sent successfully!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      await verifyOTP();
      // verifyOTP will handle the success message and navigation
    } catch (error) {
      // Error handling is done inside verifyOTP
      console.log("OTP verification failed:", error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleResendOtp = async () => {
    if (timer > 0) return;
    setLoading(true);
    try {
      await sendOtp(phone);
      setTimer(30);
      toast.success("OTP resent successfully!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  

  const sendOtp = async (phoneNumber) => {
    try {
      // Format phone number for API
      let formattedPhone = phoneNumber;
      // If phone number doesn't start with '+', add it
      // The backend expects Indian numbers with +91 prefix
      if (!formattedPhone.startsWith("+")) {
        formattedPhone = formattedPhone.startsWith("91")
          ? "+" + formattedPhone
          : "+91" + formattedPhone;
      }
      
      // In development, use local API, in production use deployed URL
      const apiUrl = `${VITE_FUNCTIONS_API_URL}/otp/send`;
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: formattedPhone }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          // Try to parse as JSON for structured error
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `Server error: ${response.status}`);
        } catch {
          throw new Error(`Failed to send OTP: ${response.statusText || 'Unknown error'}`);
        }
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to send OTP");
      }

      // Store the session ID for verification
      setOTPData(data.sessionId);
      console.log("OTP sent successfully to", formattedPhone);
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error(error.message || "Failed to send OTP");
      throw error;
    }
  };
  const verifyOTP = async (isLinking = false) => {
    if (!OTPData) {
      toast.error("Session expired. Please request a new OTP.");
      setStep("phone");
      return;
    }

    try {
      // Format phone number for API
      let formattedPhone = phone;
      if (!formattedPhone.startsWith("+")) {
        formattedPhone = formattedPhone.startsWith("91")
          ? "+" + formattedPhone
          : "+91" + formattedPhone;
      }
      
      const apiUrl = `${VITE_FUNCTIONS_API_URL}/otp/verify`;
      
      const requestBody = {
        sessionId: OTPData,
        otp: otp.join(""),
        phone: formattedPhone,
        isLinking: isLinking,
      };
      
      // Add UID for account linking
      if (isLinking && appAuth.currentUser?.uid) {
        requestBody.uid = appAuth.currentUser.uid;
      }
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Handle non-200 responses
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || `Server error: ${response.status}`;
          
          // Handle expired OTP case specifically
          if (errorJson.expired) {
            setStep("phone");
            throw new Error("OTP has expired. Please request a new one.");
          }
        } catch {
          // Parsing error, use generic message
          errorMessage = `Error: ${response.status} ${response.statusText || 'Unknown error'}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "OTP verification failed");
      }

      // Handle custom token authentication
      if (data.customToken) {
        try {
          // Sign in with the custom token
          await signInWithCustomToken(appAuth, data.customToken);
          console.log("User authenticated successfully with custom token");
          
          // Get current user for callback
          const user = appAuth.currentUser;
          const userData = {
            phoneNumber: formattedPhone,
            uid: user?.uid,
            displayName: user?.displayName,
            email: user?.email,
          };
          
          toast.success(isLinking ? "Account linked successfully!" : "Login successful!");
          onAuth(userData);
          onClose();
        } catch (tokenError) {
          console.error("Error signing in with custom token:", tokenError);
          throw new Error("Authentication failed: " + tokenError.message);
        }
      } else {
        throw new Error("Authentication failed: No custom token received");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      
      // Handle specific error messages
      if (error.message.includes("invalid") || error.message.includes("incorrect")) {
        toast.error("Invalid OTP. Please try again.");
        // Clear OTP for retrying
        setOtp(["", "", "", "", "", ""]);
      } else {
        toast.error(error.message);
      }
      
      throw error;
    }
  };

  if (!isOpen) return null;  return (
    <div>
      <div className="text-center mb-6">
        <PhoneHeaderIcon />
        <h2 className="text-2xl font-bold">
          {step === "phone"
            ? `${
                authType === "login" ? "Login with Phone" : "SignUp with Phone"
              }`
            : step === "linkOtp"
            ? "Verify Phone for Linking"
            : "Enter OTP"}
        </h2>
        {step === "phone" && (
          <p className="text-sm text-gray-400 mt-2">
            {authType === "login" 
              ? "Enter your registered phone number" 
              : "Create a new account with your phone number"}
          </p>
        )}
      </div>      {step === "phone" && (
        <div className="space-y-6">
          {/* Phone verification form */}
          <PhoneInputForm
            phone={phone}
            setPhone={setPhone}
            loading={loading}
            onSubmit={handlePhoneSubmit}
            buttonText={authType === "login" ? "Login with OTP" : "Sign Up with OTP"}
          />

        </div>
      )}

      {step === "otp" && (
        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-300">
              Enter the 6-digit code sent to {phone}
            </label>
            <OtpInput 
              otp={otp} 
              setOtp={setOtp}
              loading={loading}
            />
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={timer > 0 || loading}
              className="text-[#faffa4] text-sm hover:underline disabled:text-gray-500"
            >
              {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading || otp.some(digit => !digit)}
            className="w-full bg-[#faffa4] text-darkGrey py-3 rounded-lg hover:bg-[#faffa9] font-semibold disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      )}
    </div>
  );
};

LoginPage.propTypes = {
  onAuth: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  authType: PropTypes.string,
};

export default LoginPage;
