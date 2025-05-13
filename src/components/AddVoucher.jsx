import { useState } from 'react';
import { appDB } from '../utils/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
  ArrowLeft 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddVoucher = () => {
  const [password, setPassword] = useState('');
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const colorScheme = {
    appColor: "#edff8d",
    darkGrey: "#212121",
    darkGrey2: "#424242",
    white: "#ffffff"
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // Replace 'your-password-here' with actual password
    if (password === '123zymo') {
      setIsPasswordCorrect(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  const handleUserSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const bookingsRef = collection(appDB, 'CarsPaymentSuccessDetails');
      // Log the userId to check what we're searching for
      console.log('Searching for UserId:', userId);

      // Try both UserId and bookingId fields
      const userIdQuery = query(bookingsRef, where('UserId', '==', userId));
      const bookingIdQuery = query(bookingsRef, where('bookingId', '==', userId));

      const [userIdSnapshot, bookingIdSnapshot] = await Promise.all([
        getDocs(userIdQuery),
        getDocs(bookingIdQuery)
      ]);

      if (userIdSnapshot.empty && bookingIdSnapshot.empty) {
        setError('No bookings found with this ID');
        setUserData(null);
      } else {
        // Use the first non-empty result
        const querySnapshot = !userIdSnapshot.empty ? userIdSnapshot : bookingIdSnapshot;
        const bookingData = querySnapshot.docs[0].data();
        
        // Log the found data to verify structure
        console.log('Found booking data:', bookingData);

        setUserData({
          id: querySnapshot.docs[0].id,
          name: bookingData.FirstName,
          phone: bookingData.PhoneNumber,
          email: bookingData.Email,
          bookingId: bookingData.bookingId,
          carName: bookingData.CarName,
          startDate: bookingData.StartDate?.toDate(),
          endDate: bookingData.EndDate?.toDate(),
          amount: bookingData.Amount,
          status: getStatus(bookingData),
          vendor: bookingData.Vendor,
          city: bookingData.City
        });
      }
    } catch (error) {
      console.error('Search error:', error); // Add detailed error logging
      setError('Error searching for bookings');
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

  return (
    <div className="min-h-screen p-8 relative" style={{ backgroundColor: colorScheme.darkGrey }}>
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
          <h2 className="text-xl font-bold mb-4" style={{ color: colorScheme.appColor }}>
            Step 1: Enter Password
          </h2>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
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
              backgroundColor: isPasswordCorrect ? '#4CAF50' : colorScheme.appColor,
              color: colorScheme.darkGrey 
            }}
            disabled={isPasswordCorrect}
          >
            {isPasswordCorrect ? 'Password Verified ✓' : 'Verify Password'}
          </button>
        </div>

        {/* Step 2: User Search - Only shown after password verification */}
        {isPasswordCorrect && (
          <div 
            className="bg-opacity-80 rounded-lg p-6 mb-6" 
            style={{ backgroundColor: colorScheme.darkGrey2 }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: colorScheme.appColor }}>
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
          <div className="text-center mt-4" style={{ color: colorScheme.appColor }}>
            Searching...
          </div>
        )}

        {/* Step 3: User Details - Only shown after user search */}
        {userData && (
          <div 
            className="bg-opacity-80 rounded-lg p-6" 
            style={{ backgroundColor: colorScheme.darkGrey2 }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: colorScheme.appColor }}>
              Step 3: User Details
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="text-lg" style={{ color: colorScheme.appColor }} />
                  <p className="text-gray-400">Name:</p>
                  <p className="text-white">{userData.name || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="text-lg" style={{ color: colorScheme.appColor }} />
                  <p className="text-gray-400">Booking ID:</p>
                  <p className="text-white">{userData.bookingId || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="text-lg" style={{ color: colorScheme.appColor }} />
                  <p className="text-gray-400">Phone:</p>
                  <p className="text-white">{userData.phone || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-2">
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
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddVoucher;