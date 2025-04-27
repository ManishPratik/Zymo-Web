import { useState, useEffect, useRef } from "react";
import { BsTelephone } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { signInWithCustomToken } from "firebase/auth";
import { appAuth } from "../utils/firebase";

const LoginPage = ({ onAuth, isOpen, onClose }) => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [OTPData, setOTPData] = useState("");
  const [step, setStep] = useState("phone");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const otpRefs = useRef([]);

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
      setTimer(15 * 60);
      toast.success("OTP sent successfully!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast.error("Please enter a valid OTP");
      return;
    }
    setLoading(true);
    try {
      await verifyOTP();
      toast.success("Login successful!");
      onAuth({ phoneNumber: phone });
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setLoading(true);
    try {
      // TODO: Implement your resend OTP logic here
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
      const response = await fetch("http://127.0.0.1:5001/zymo-prod/us-central1/api/otp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      if (!response.ok) {
        throw new Error("Failed to send OTP");
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to send OTP");
      }
      
      // Store the session ID for verification
      setOTPData(data.sessionId);
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error(error.message);
      throw error;
    }
  };

  const verifyOTP = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5001/zymo-prod/us-central1/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
        //   sessionId: OTPData,
          sessionId: "5e51405a-4970-44bf-b688-1ebab7f5e891",
          otp: otp.join(""),
        //   phone: phone 
          phone: "919370406054" 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to verify OTP");
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "OTP verification failed");
      }

      // Handle custom token authentication
      if (data.customToken) {
        // Sign in with the custom token
        await signInWithCustomToken(appAuth, data.customToken);
        console.log("User authenticated successfully with custom token");
        toast.success("Login successful!");
        onAuth({ phoneNumber: phone, uid: appAuth.currentUser?.uid });
        onClose();
      } else {
        throw new Error("Authentication failed: No custom token received");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error(error.message);
      throw error;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="relative bg-darkGrey text-white p-8 rounded-2xl shadow-xl w-96 border border-[#faffa4]">
        <button
          className="absolute top-3 right-3 text-white hover:text-gray-300"
          onClick={onClose}
        >
          <IoClose size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="inline-block p-3 rounded-full bg-[#faffa4] mb-4">
            <BsTelephone className="w-6 h-6 text-darkGrey" />
          </div>
          <h2 className="text-2xl font-bold">
            {step === "phone" ? "Login with Phone" : "Enter OTP"}
          </h2>
        </div>

        {step === "phone" ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Phone Number</label>
              <PhoneInput
                country={"in"}
                value={phone}
                onChange={setPhone}
                inputClass="!w-full !px-4 !py-2 !border !rounded-lg !bg-darkGrey !text-white"
                containerClass="!bg-transparent"
                buttonClass="!bg-transparent !border-0"
                dropdownClass="!bg-darkGrey !text-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#faffa4] text-darkGrey py-3 rounded-lg hover:bg-[#faffa9] font-semibold disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-300">
                Enter the 6-digit code sent to {phone}
              </label>
              <div className="flex gap-2 justify-between">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !digit && index > 0) {
                        otpRefs.current[index - 1].focus();
                      }
                    }}
                    className="w-12 h-12 text-center border rounded-lg bg-darkGrey text-white focus:ring-2 focus:ring-[#faffa4] focus:border-transparent"
                  />
                ))}
              </div>
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
              disabled={loading}
              className="w-full bg-[#faffa4] text-darkGrey py-3 rounded-lg hover:bg-[#faffa9] font-semibold disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

LoginPage.propTypes = {
  onAuth: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default LoginPage;
