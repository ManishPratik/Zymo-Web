import PropTypes from "prop-types";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { BsTelephone } from "react-icons/bs";

const PhoneInputForm = ({ phone, setPhone, loading, onSubmit, buttonText = "Send OTP" }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
        disabled={loading || phone.length < 10}
        className="w-full bg-[#faffa4] text-darkGrey py-3 rounded-lg hover:bg-[#faffa9] font-semibold disabled:opacity-50"
      >
        {loading ? "Sending..." : buttonText}
      </button>
    </form>
  );
};

PhoneInputForm.propTypes = {
  phone: PropTypes.string.isRequired,
  setPhone: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  buttonText: PropTypes.string
};

export const PhoneHeaderIcon = () => (
  <div className="inline-block p-3 rounded-full bg-[#faffa4] mb-4">
    <BsTelephone className="w-6 h-6 text-darkGrey" />
  </div>
);

export default PhoneInputForm;
