import { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { appDB, appAuth } from '../utils/firebase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import NavBar from './NavBar';
import Footer from './Footer';

const YourVouchers = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [vouchers, setVouchers] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = appAuth.currentUser;

  useEffect(() => {
    if (!user) {
      navigate('/profile');
      return;
    }

    const fetchVouchers = async () => {
      setIsLoading(true);
      setMessage('');
      setError('');

      try {
        const userDocRef = doc(appDB, 'users', user.uid);
        const vouchersRef = collection(userDocRef, 'vouchers');
        const vouchersSnapshot = await getDocs(vouchersRef);

        if (vouchersSnapshot.empty) {
          setMessage('No vouchers available');
        } else {
          const voucherData = vouchersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setVouchers(voucherData);
        }
      } catch (err) {
        console.error('Error fetching vouchers:', err);
        setError('Failed to fetch vouchers: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVouchers();
  }, [user, navigate]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date.seconds * 1000).toLocaleDateString();
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-[#212121] p-4">
        <button
          onClick={() => navigate('/profile')}
          className="text-white m-5 cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft className="w-6 h-6" />
          <span>Back to Profile</span>
        </button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6">Your Vouchers</h1>

          {isLoading && (
            <div className="text-white text-center">Loading vouchers...</div>
          )}

          {error && (
            <div className="text-red-500 text-center mb-4">{error}</div>
          )}

          {!isLoading && !error && vouchers.length === 0 && (
            <div className="text-white text-center p-4 bg-[#424242] rounded-lg">
              {message || 'No vouchers available'}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {vouchers.map((voucher) => (
              <div
                key={voucher.id}
                className="bg-[#424242] rounded-lg p-6 shadow-lg"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[#edff8d] text-2xl font-bold">
                    ₹{voucher.amount}
                  </span>
                  <span className={`px-3 py-1 rounded-full ${
                    voucher.status === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {voucher.status}
                  </span>
                </div>

                <div className="space-y-3 text-gray-300">
                  <div>
                    <p className="text-sm text-gray-400">Valid From</p>
                    <p>{formatDate(voucher.validFrom)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Valid Till</p>
                    <p>{formatDate(voucher.validTill)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Voucher ID</p>
                    <p className="font-mono text-sm">{voucher.id}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default YourVouchers;