import { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { appDB } from '../utils/firebase'; // Adjust the import path based on your Firebase config

const VoucherDisplay = ({ userId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [vouchers, setVouchers] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVouchers = async () => {
      setIsLoading(true);
      setMessage('');
      setError('');

      try {
        // Reference to the user's document
        const userDocRef = doc(appDB, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        // Check if the user exists
        if (!userDoc.exists()) {
          setMessage('User does not exist');
          setIsLoading(false);
          return;
        }

        // Reference to the 'vouchers' subcollection
        const vouchersRef = collection(userDocRef, 'vouchers');
        const vouchersSnapshot = await getDocs(vouchersRef);

        // Check if there are any vouchers
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

    // Fetch vouchers if userId is provided
    if (userId) {
      fetchVouchers();
    } else {
      setMessage('Please provide a user ID');
      setIsLoading(false);
    }
  }, [userId]);

  // Render based on state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (vouchers.length > 0) {
    return (
      <div>
        <h2>Your Vouchers</h2>
        <ul>
          {vouchers.map((voucher) => (
            <li key={voucher.id}>
              Code: {voucher.code}, Value: {voucher.value}, Expiry: {voucher.expiryDate}
            </li>
          ))}
        </ul>
      </div>
    );
  } else {
    return <div>{message}</div>;
  }
};

export default VoucherDisplay;