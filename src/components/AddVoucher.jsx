import { useState } from "react";
import { appDB } from "../utils/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  Eye,
  EyeOff,
  Search,
  User,
  Package,
  Phone,
  Car,
  Calendar,
  CreditCard,
  Star,
  ArrowLeft,
  ArrowRight,
  Edit, // Add this import
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AddVoucher = () => {
  const [password, setPassword] = useState("");
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [voucherAmount, setVoucherAmount] = useState("");
  const [voucherData, setVoucherData] = useState(null);
  const [isEditingBeforeSubmit, setIsEditingBeforeSubmit] = useState(false); // Add this new state
  const [showSuccess, setShowSuccess] = useState(false); // Add new state for success message

  // Get formatted current date for input default value
  const getTodayFormatted = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Get formatted date 30 days from now
  const getThirtyDaysFromNow = () => {
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    return thirtyDays.toISOString().split("T")[0];
  };

  // Initialize custom dates with current date and 30 days from now
  const [customStartDate, setCustomStartDate] = useState(getTodayFormatted());
  const [customEndDate, setCustomEndDate] = useState(getThirtyDaysFromNow());

  const navigate = useNavigate();

  const colorScheme = {
    appColor: "#edff8d",
    darkGrey: "#212121",
    darkGrey2: "#424242",
    white: "#ffffff",
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // Replace 'your-password-here' with actual password
    if (password === "123zymo") {
      setIsPasswordCorrect(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  // Update handleUserSearch to properly handle Firestore timestamp
  const handleUserSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const bookingsRef = collection(appDB, "CarsPaymentSuccessDetails");
      const userIdQuery = query(
        bookingsRef,
        where("UserId", "==", userId.trim())
      );
      const userIdSnapshot = await getDocs(userIdQuery);

      if (userIdSnapshot.empty) {
        setError("No bookings found with this User ID");
        setUserData(null);
      } else {
        const bookingData = userIdSnapshot.docs[0].data();

        // Properly convert Firestore timestamp to Date
        const startDate = bookingData.StartDate?.toDate?.() || new Date();

        setUserData({
          name: bookingData.FirstName || "N/A",
          phone: bookingData.PhoneNumber || "N/A",
          email: bookingData.Email || "N/A",
          bookingStartDate: startDate,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      setError("Error searching for bookings: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add the getStatus helper function
  const getStatus = (booking) => {
    if (
      booking.Cancelled === true ||
      booking.CancelledByAgent ||
      booking.cancelOrder === "Yes"
    ) {
      return "Cancelled";
    }
    return "Active";
  };

  // Add this helper function at the top of your component
  const formatDate = (date) => {
    if (!date) return "N/A";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Update handleVoucherGenerate function - remove automatic redirect
  const handleVoucherGenerate = (e) => {
    e.preventDefault();

    try {
      // Use the custom dates directly since they're already in state
      const validFrom = new Date(customStartDate);
      const validTill = new Date(customEndDate);

      if (validTill < validFrom) {
        throw new Error("End date cannot be before start date");
      }

      const voucherDetails = {
        amount: voucherAmount,
        validFrom: validFrom,
        validTill: validTill,
        userId: userId,
        userName: userData.name,
        status: "Active"
      };

      setVoucherData(voucherDetails);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error generating voucher:", error);
      setError("Error generating voucher: " + error.message);
    }
  };

  return (
    <div
      className="min-h-screen p-8 relative"
      style={{ backgroundColor: colorScheme.darkGrey }}
    >
      {/* Add back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center gap-2 hover:scale-105 transition-transform"
        style={{ color: colorScheme.appColor }}
      >
        <ArrowLeft size={24} />
        <span className="text-lg font-semibold">Back</span>
      </button>

      <div className="max-w-md mx-auto">
        {/* Step 1: Password Section */}
        <div
          className="bg-opacity-80 rounded-lg p-6 mb-6"
          style={{ backgroundColor: colorScheme.darkGrey2 }}
        >
          <h2
            className="text-xl font-bold mb-4"
            style={{ color: colorScheme.appColor }}
          >
            Step 1: Enter Password
          </h2>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white"
              placeholder="Enter password"
              disabled={isPasswordCorrect}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              style={{ color: colorScheme.appColor }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button
            onClick={handlePasswordSubmit}
            className="w-full mt-4 py-2 rounded-lg font-semibold"
            style={{
              backgroundColor: isPasswordCorrect
                ? "#4CAF50"
                : colorScheme.appColor,
              color: colorScheme.darkGrey,
            }}
            disabled={isPasswordCorrect}
          >
            {isPasswordCorrect ? "Password Verified ✓" : "Verify Password"}
          </button>
        </div>

        {/* Step 2: User Search - Only shown after password verification */}
        {isPasswordCorrect && (
          <div
            className="bg-opacity-80 rounded-lg p-6 mb-6"
            style={{ backgroundColor: colorScheme.darkGrey2 }}
          >
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: colorScheme.appColor }}
            >
              Step 2: Search User
            </h2>
            <form onSubmit={handleUserSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white"
                  placeholder="Enter User ID"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: colorScheme.appColor }}
                >
                  <Search size={20} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error and Loading States */}
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        {loading && (
          <div
            className="text-center mt-4"
            style={{ color: colorScheme.appColor }}
          >
            Searching...
          </div>
        )}

        {/* Step 3: User Details - Only shown after user search */}
        {userData && (
          <div
            className="bg-opacity-80 rounded-lg p-6"
            style={{ backgroundColor: colorScheme.darkGrey2 }}
          >
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: colorScheme.appColor }}
            >
              Step 3: User Details
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User
                    className="text-lg"
                    style={{ color: colorScheme.appColor }}
                  />
                  <p className="text-gray-400">Name:</p>
                  <p className="text-white">{userData.name || "N/A"}</p>
                </div>
                {/* <div className="flex items-center gap-2">
                  <Package className="text-lg" style={{ color: colorScheme.appColor }} />
                  <p className="text-gray-400">Booking ID:</p>
                  <p className="text-white">{userData.bookingId || 'N/A'}</p>
                </div> */}
                <div className="flex items-center gap-2">
                  <Phone
                    className="text-lg"
                    style={{ color: colorScheme.appColor }}
                  />
                  <p className="text-gray-400">Phone:</p>
                  <p className="text-white">{userData.phone || "N/A"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone
                    className="text-lg"
                    style={{ color: colorScheme.appColor }}
                  />
                  <p className="text-gray-400">Email:</p>
                  <p className="text-white">{userData.email || "N/A"}</p>
                </div>
                {/* <div className="flex items-center gap-2">
                  <Car className="text-lg" style={{ color: colorScheme.appColor }} />
                  <p className="text-gray-400">Car:</p>
                  <p className="text-white">{userData.carName || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="text-lg" style={{ color: colorScheme.appColor }} />
                  <p className="text-gray-400">Start Date:</p>
                  <p className="text-white">
                    {userData.startDate ? userData.startDate.toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="text-lg" style={{ color: colorScheme.appColor }} />
                  <p className="text-gray-400">End Date:</p>
                  <p className="text-white">
                    {userData.endDate ? userData.endDate.toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="text-lg" style={{ color: colorScheme.appColor }} />
                  <p className="text-gray-400">Amount:</p>
                  <p className="text-white">₹{userData.amount || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="text-lg" style={{ color: colorScheme.appColor }} />
                  <p className="text-gray-400">Status:</p>
                  <p className={`${
                    userData.status === 'Active' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {userData.status}
                  </p>
                </div> */}
              </div>
            </div>
          </div>
        )}

        {/* Add after user details section */}
        {userData && (
          <div
            className="bg-opacity-80 rounded-lg p-6 mt-6"
            style={{ backgroundColor: colorScheme.darkGrey2 }}
          >
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: colorScheme.appColor }}
            >
              Step 4: Add Voucher
            </h2>

            {!voucherData ? (
              <form onSubmit={handleVoucherGenerate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 mb-2">
                      Enter Voucher Amount
                    </label>
                    <input
                      type="number"
                      value={voucherAmount}
                      onChange={(e) => setVoucherAmount(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white"
                      placeholder="Enter amount"
                      required
                    />
                  </div>

                  {/* Date Section */}
                  <div className="space-y-2">
                    {!isEditingBeforeSubmit ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar
                              className="text-lg"
                              style={{ color: colorScheme.appColor }}
                            />
                            <div>
                              <p className="text-gray-400">Valid From:</p>
                              <p className="text-white">
                                {formatDate(new Date(customStartDate))}
                              </p>
                            </div>
                          </div>
                          <Edit
                            className="text-lg cursor-pointer hover:scale-110 transition-transform"
                            style={{ color: colorScheme.appColor }}
                            onClick={() => setIsEditingBeforeSubmit(true)}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar
                            className="text-lg"
                            style={{ color: colorScheme.appColor }}
                          />
                          <div>
                            <p className="text-gray-400">Valid Till:</p>
                            <p className="text-white">
                              {formatDate(new Date(customEndDate))}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-400 mb-2">
                            Valid From
                          </label>
                          <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => {
                              setCustomStartDate(e.target.value);
                              const startDate = new Date(e.target.value);
                              const endDate = new Date(startDate);
                              endDate.setDate(startDate.getDate() + 30);
                              setCustomEndDate(
                                endDate.toISOString().split("T")[0]
                              );
                            }}
                            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 mb-2">
                            Valid Till (30 days)
                          </label>
                          <input
                            type="date"
                            value={customEndDate}
                            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white cursor-not-allowed"
                            disabled
                          />
                          <p className="text-xs text-yellow-500 mt-1">
                            * Voucher validity is fixed to 30 days from start
                            date
                          </p>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setIsEditingBeforeSubmit(false)}
                            className="px-4 py-2 rounded-lg font-semibold"
                            style={{
                              backgroundColor: "#ff4444",
                              color: "white",
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingBeforeSubmit(false)}
                            className="px-4 py-2 rounded-lg font-semibold"
                            style={{
                              backgroundColor: colorScheme.appColor,
                              color: colorScheme.darkGrey,
                            }}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 rounded-lg font-semibold"
                    style={{
                      backgroundColor: colorScheme.appColor,
                      color: colorScheme.darkGrey,
                    }}
                  >
                    Add Voucher
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div
                  className="p-4 rounded-lg border-2"
                  style={{ borderColor: colorScheme.appColor }}
                >
                  <h3
                    className="text-lg font-bold mb-4"
                    style={{ color: colorScheme.appColor }}
                  >
                    Voucher Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User
                        className="text-lg"
                        style={{ color: colorScheme.appColor }}
                      />
                      <p className="text-gray-400">User ID:</p>
                      <p className="text-white">{userId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard
                        className="text-lg"
                        style={{ color: colorScheme.appColor }}
                      />
                      <p className="text-gray-400">Amount:</p>
                      <p className="text-white">₹{voucherData.amount}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar
                        className="text-lg"
                        style={{ color: colorScheme.appColor }}
                      />
                      <p className="text-gray-400">Valid From:</p>
                      <p className="text-white">
                        {formatDate(voucherData.validFrom)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar
                        className="text-lg"
                        style={{ color: colorScheme.appColor }}
                      />
                      <p className="text-gray-400">Valid Till:</p>
                      <p className="text-white">
                        {formatDate(voucherData.validTill)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star
                        className="text-lg"
                        style={{ color: colorScheme.appColor }}
                      />
                      <p className="text-gray-400">Status:</p>
                      <p className="text-green-500">{voucherData.status}</p>
                    </div>
                  </div>
                </div>
                {showSuccess && (
                  <div className="flex items-center justify-center p-4 bg-green-500 rounded-lg animate-bounce">
                    <p className="text-white font-bold text-lg">
                      Voucher Added Successfully! ✓
                    </p>
                  </div>
                )}
                <div
                  onClick={() => navigate("/agent-info")}
                  className="flex items-center justify-center gap-2 cursor-pointer hover:scale-105 transition-transform"
                >
                  <p className="text-green-500">Go to Agent Info</p>
                  <ArrowRight className="text-green-500" size={20} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddVoucher;
