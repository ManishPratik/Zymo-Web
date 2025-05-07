import { useRef, useEffect } from "react";
import PropTypes from "prop-types";

const OtpInput = ({ otp, setOtp, loading }) => {
  const otpRefs = useRef([]);

  // Focus first empty input on mount
  useEffect(() => {
    const firstEmptyIndex = otp.findIndex(digit => digit === '');
    if (firstEmptyIndex !== -1) {
      otpRefs.current[firstEmptyIndex]?.focus();
    }
  }, [otp]);

  const handleOtpChange = (index, value) => {
    // Allow only numbers
    if (value && !/^\d+$/.test(value)) return;
    
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    
    // Handle arrow keys for navigation
    if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    
    if (e.key === 'ArrowRight' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };
  
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Check if pasted content contains only digits
    if (!/^\d+$/.test(pastedData)) return;
    
    const digits = pastedData.split('').slice(0, 6);
    const newOtp = [...otp];
    
    digits.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
      }
    });
    
    setOtp(newOtp);
    
    // Focus on the next empty field or the last field
    const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
    if (nextEmptyIndex !== -1) {
      otpRefs.current[nextEmptyIndex]?.focus();
    } else if (digits.length < 6) {
      otpRefs.current[digits.length]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-between">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (otpRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleOtpChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          className="w-12 h-12 text-center border rounded-lg bg-darkGrey text-white border-gray-600 focus:outline-none focus:border-[#faffa4] text-lg font-bold"
          disabled={loading}
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

OtpInput.propTypes = {
  otp: PropTypes.arrayOf(PropTypes.string).isRequired,
  setOtp: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default OtpInput;
