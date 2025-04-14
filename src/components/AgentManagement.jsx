import { Link } from 'react-router-dom';
import { useEffect, useState} from 'react';
import { Helmet } from "react-helmet-async";
import { appDB } from '../utils/firebase';
import { collection, getDocs, query, updateDoc, doc } from 'firebase/firestore';
import { FiArrowLeft, FiCopy, FiCheck, FiUsers, FiFileText } from 'react-icons/fi';

const AgentBookingList = ({title}) => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [showDocuments, setShowDocuments] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showAddRefund, setShowAddRefund] = useState(false);
  const [refundTitle, setRefundTitle] = useState('');
  const [refundValue, setRefundValue] = useState('');
  const [showDeductionOptions, setShowDeductionOptions] = useState(false);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  const colorScheme = {
    appColor: "#edff8d", // Light yellow
    darkGrey: "#212121", // Dark background
    darkGrey2: "#424242", // Modal and table background
  };

  const uniqueFields = ['bookingId', 'UserId', 'Email', 'paymentId', 'id'];

  // Convert Firestore timestamp or string to JavaScript Date object
  const toDate = (field) => {
    if (!field) return null;
    if (typeof field.toDate === 'function') return field.toDate();
    if (typeof field === 'string') return new Date(field);
    return null;
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1000);
  };
    useEffect(() => {
        document.title = title;
      }, [title]);

  // Fetch and sort bookings from Firestore
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const q = query(collection(appDB, 'CarsPaymentSuccessDetails'));
        const querySnapshot = await getDocs(q);
        const bookingsData = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            const hasDocs =
              data.Documents &&
              (data.Documents.LicenseBack ||
                data.Documents.LicenseFront ||
                data.Documents.aadhaarBack ||
                data.Documents.aadhaarFront);
            return {
              id: doc.id,
              ...data,
              StartDate: toDate(data.StartDate),
              EndDate: toDate(data.EndDate),
              CancellationDate: toDate(data.CancellationDate),
              DateOfBooking: data.DateOfBooking, // Keep as number
              documentsAvailable: !!hasDocs,
              refundData: data.refundData || [],
              cancelOrder: data.cancelOrder || 'No',
            };
          })
          .filter(booking => typeof booking.DateOfBooking === 'number') // Filter for valid numerical DateOfBooking
          .sort((a, b) => b.DateOfBooking - a.DateOfBooking); // Sort descending by DateOfBooking
        setBookings(bookingsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Update documents list when a booking is selected
  useEffect(() => {
    if (selectedBooking && selectedBooking.Documents) {
      const docs = [
        { name: 'License Back', url: selectedBooking.Documents.LicenseBack },
        { name: 'License Front', url: selectedBooking.Documents.LicenseFront },
        { name: 'Aadhaar Back', url: selectedBooking.Documents.aadhaarBack },
        { name: 'Aadhaar Front', url: selectedBooking.Documents.aadhaarFront },
      ].filter((doc) => doc.url);
      setDocuments(docs);
    } else {
      setDocuments([]);
      setShowDocuments(false);
    }
  }, [selectedBooking]);

  // Simplified booking status: 'Active' or 'Cancelled'
  const getStatus = (booking) => {
    if (booking.Cancelled === true || booking.CancelledByAgent || booking.cancelOrder === 'Yes') {
      return 'Cancelled';
    }
    return 'Active';
  };

  // Cancel a booking
  const handleCancelBooking = async () => {
    try {
      const bookingRef = doc(appDB, 'CarsPaymentSuccessDetails', selectedBooking.id);
      await updateDoc(bookingRef, { cancelOrder: 'Yes' });
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === selectedBooking.id ? { ...booking, cancelOrder: 'Yes' } : booking
        )
      );
      setSelectedBooking((prev) => ({ ...prev, cancelOrder: 'Yes' }));
      setShowCancelConfirm(false);
    } catch (error) {
      console.error('Error canceling booking:', error);
    }
  };

  // Add refund data to a booking
  const handleAddRefund = async () => {
    if (!refundTitle || !refundValue) return;
    try {
      const bookingRef = doc(appDB, 'CarsPaymentSuccessDetails', selectedBooking.id);
      const newRefundData = [...(selectedBooking.refundData || []), { title: refundTitle, value: refundValue }];
      await updateDoc(bookingRef, { refundData: newRefundData });
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === selectedBooking.id ? { ...booking, refundData: newRefundData } : booking
        )
      );
      setSelectedBooking((prev) => ({ ...prev, refundData: newRefundData }));
      setRefundTitle('');
      setRefundValue('');
      setShowAddRefund(false);
      setShowDeductionOptions(false);
    } catch (error) {
      console.error('Error adding refund data:', error);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      booking.bookingId?.toLowerCase().includes(searchLower) ||
      booking.UserId?.toLowerCase().includes(searchLower) ||
      booking.FirstName?.toLowerCase().includes(searchLower)
    );
  });

  const displayedBookings = filteredBookings.slice(0, 20);

  const RenderValue = ({ value, field }) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">N/A</span>;
    }

    let dateValue = null;
    if ((field === 'StartDate' || field === 'EndDate' || field === 'CancellationDate') && (value instanceof Date && !isNaN(value))) {
      dateValue = value;
    } else if ((field === 'StartDate' || field === 'EndDate' || field === 'CancellationDate') && typeof value === 'string' && !isNaN(Date.parse(value))) {
      dateValue = new Date(value);
    } else if ((field === 'StartDate' || field === 'EndDate' || field === 'CancellationDate') && value && typeof value.toDate === 'function') {
      dateValue = value.toDate();
    }

    if (dateValue && !isNaN(dateValue)) {
      return (
        <span style={{ color: '#edff8d' }}>
          {dateValue.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </span>
      );
    }

    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return (
          <div className="space-y-2">
            {value.map((item, index) => (
              <div key={index} className="pl-4 border-l-2 border-gray-600">
                <RenderValue value={item} />
              </div>
            ))}
          </div>
        );
      } else {
        return (
          <div className="space-y-2">
            {Object.entries(value).map(([key, val]) => (
              <div key={key} className="pl-4 border-l-2 border-gray-600">
                <span className="font-semibold" style={{ color: colorScheme.appColor }}>
                  {key}:
                </span>{' '}
                <RenderValue value={val} />
              </div>
            ))}
          </div>
        );
      }
    }

    return <span style={{ color: '#edff8d' }}>{value.toString()}</span>;
  };
  const handleGetZoomDetails = async (bookingId, uid) => {
    //const url = import.meta.env.VITE_FUNCTIONS_API_URL;
    const url = "http://127.0.0.1:5001/zymo-prod/us-central1/api";

    // Fetch Firebase Cars
  
    try {
      const response = await fetch(`${url}/zoomcar/bookings/details`, {
        method: "POST",
        body: JSON.stringify({
          data: {
            booking_id: bookingId,
            uid: uid,
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch Zoomcar booking details");
      }
  
      const data = await response.json();
      setBookingDetails(data);
      setShowBookingDetails(true);
      console.log("Zoom Details:", data);
    } catch (error) {
      console.error("Error getting Zoom details:", error);
    }
  };
  
  
  

  return (
    <>
    <Helmet>
    <title>Agent Management - Zymo</title>
    <meta
        name="description"
        content="Manage Zymo agent bookings, track customer rentals, and oversee agent operations efficiently."
    />
    <meta property="og:title" content="Agent Management - Zymo" />
    <meta
        property="og:description"
        content="Access the Zymo agent dashboard to manage bookings, track rentals, and optimize operations."
    />
    <link rel="canonical" href="https://zymo.app/agent-info" />
</Helmet>

    <div className="flex min-h-screen p-8" style={{ backgroundColor: colorScheme.darkGrey }}>
      <nav className="w-30 space-y-4 mr-8">
        <Link
          to="/agent-info"
          className={`w-full p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:bg-gray-700 ${
            location.pathname === '/agent-info' ? 'bg-gray-700' : ''
          }`}
          style={{ 
            color: colorScheme.appColor,
            boxShadow: location.pathname === '/agent-info' ? `0 0 10px ${colorScheme.appColor}33` : 'none'
          }}
        >
          <FiFileText className="text-3xl mb-2" />
          <span className="text-xs font-bold text-center">Booking Details</span>
        </Link>
        <Link
          to="/master-agent"
          className={`w-full p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:bg-gray-700 ${
            location.pathname === '/master-agent' ? 'bg-gray-700' : ''
          }`}
          style={{ 
            color: colorScheme.appColor,
            boxShadow: location.pathname === '/master-agent' ? `0 0 10px ${colorScheme.appColor}33` : 'none'
          }}
        >
          <FiUsers className="text-3xl mb-2" />
          <span className="text-xs font-bold text-center">Master Agent</span>
        </Link>
      </nav>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');
          
          .zymo-title {
            text-shadow: 0 0 10px ${colorScheme.appColor}33, 0 0 20px ${colorScheme.appColor}22;
            letter-spacing: 2px;
          }

          @keyframes textReveal {
            0% { clip-path: inset(0 100% 0 0); }
            100% { clip-path: inset(0 0 0 0); }
          }
          .animate-text-reveal {
            animation: textReveal 1s ease-in-out forwards;
          }
        `}
      </style>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 text-center overflow-hidden">
          <span className="inline-block animate-text-reveal zymo-title" style={{ color: colorScheme.appColor }}>
            ZYMO PANEL
          </span>
        </h1>
        <div className="mb-8 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search by Booking ID, User ID or Name"
            className="px-4 py-2 rounded-lg"
            style={{ backgroundColor: colorScheme.darkGrey2, color: colorScheme.appColor, width: '1150px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center text-xl" style={{ color: colorScheme.appColor }}>
            Loading...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center text-xl" style={{ color: colorScheme.appColor }}>
            No bookings found
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              {displayedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-lg p-6 cursor-pointer transition-all hover:scale-[1.02] h-48"
                  style={{ backgroundColor: colorScheme.darkGrey2, border: `2px solid ${colorScheme.appColor}` }}
                  onClick={() => setSelectedBooking(booking)}
                >
                  <div className="flex justify-between items-start h-full">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2" style={{ color: colorScheme.appColor }}>
                        {booking.FirstName}
                      </h2>
                      <p className="text-xl mb-2" style={{ color: colorScheme.appColor }}>
                        {booking.CarName}
                      </p>
                      <div className="space-y-1">
                        <p className="text-xl" style={{ color: colorScheme.appColor }}>
                          {booking.StartDate
                            ? (() => {
                                const date = booking.StartDate.toDate
                                  ? booking.StartDate.toDate()
                                  : new Date(booking.StartDate);
                                return isNaN(date)
                                  ? 'Invalid Date'
                                  : date.toLocaleDateString('en-GB', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                    });
                              })()
                            : 'N/A'}
                        </p>
                        {booking.documentsAvailable && (
                          <button
                            className="px-2 py-1 rounded-full text-sm font-bold bg-yellow-500 text-black"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBooking(booking);
                              setShowDocuments(true);
                            }}
                          >
                            Contains Documents
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-4 justify-end">
                        <span className="text-lg" style={{ color: colorScheme.appColor }}>
                          {booking.bookingId}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyId(booking.bookingId);
                          }}
                        >
                          {copiedId === booking.bookingId ? (
                            <FiCheck style={{ color: '#4CAF50', fontSize: '1.5rem' }} />
                          ) : (
                            <FiCopy style={{ color: colorScheme.appColor, fontSize: '1.5rem' }} />
                          )}
                        </button>
                      </div>
                      <div className="space-y-2">
                        <span
                          className={`px-4 py-2 rounded-full text-md font-bold ${
                            getStatus(booking) === 'Active' ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        >
                          {getStatus(booking)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-4" style={{ color: colorScheme.appColor }}>
              Showing first 20 bookings, you can search the rest bookings.
            </div>
          </>
        )}

        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-start justify-center p-4 overflow-y-auto">
            <div
              className="rounded-lg p-8 w-full relative"
              style={{
                backgroundColor: colorScheme.darkGrey2,
                border: `3px solid ${colorScheme.appColor}`,
                boxShadow: `0 0 20px ${colorScheme.appColor}33`,
              }}
            >
              <button
                className="absolute top-6 left-6 flex items-center gap-2 hover:scale-105 transition-transform"
                style={{ color: colorScheme.appColor }}
                onClick={() => setSelectedBooking(null)}
              >
                <FiArrowLeft className="text-3xl" />
                <span className="text-xl">Back to List</span>
              </button>

              <h2 className="text-4xl font-bold mb-8 text-center" style={{ color: colorScheme.appColor }}>
                {selectedBooking.FirstName}'s Booking Details
              </h2>

              <div className="flex justify-between gap-4 mb-8 w-full">
  <button
    onClick={() => setShowCancelConfirm(true)}
    className="px-4 py-2 rounded text-white font-bold flex-1"
    style={{ backgroundColor: '#FF0000' }}
  >
    Cancel Booking
  </button>
    
  <button
  onClick={() => handleGetZoomDetails(selectedBooking.bookingId, selectedBooking.UserId)}
  className="px-4 py-2 rounded text-white font-bold flex-1"
  style={{ backgroundColor: '#6C63FF' }}
>
  Get Zoom Details
</button>

  <button
    onClick={() => setShowDocuments(true)}
    className="px-4 py-2 rounded text-white font-bold flex-1"
    style={{ backgroundColor: '#007BFF' }}
  >
    Show Documents
  </button>
  <button
    onClick={() => setShowAddRefund(true)}
    className="px-4 py-2 rounded text-white font-bold flex-1"
    style={{ backgroundColor: '#28A745' }}
  >
    Add Refund Data
  </button>


</div>


              <div className="w-full space-y-6">
                <table className="w-full divide-y divide-gray-700">
                  <tbody>
                    <tr style={{ backgroundColor: colorScheme.darkGrey2 }} className="border-b border-gray-700">
                      <td className="px-6 py-4 text-xl font-bold uppercase" style={{ color: colorScheme.appColor, width: '30%' }}>
                        Booking ID
                      </td>
                      <td className="px-6 py-4 text-lg" style={{ width: '30%' }}>
                        <RenderValue value={selectedBooking.bookingId} field="bookingId" />
                      </td>
                      <td className="px-6 py-4 text-lg text-right" style={{ width: '10%' }}>
                        <button onClick={() => handleCopyId(selectedBooking.bookingId)}>
                          {copiedId === selectedBooking.bookingId ? (
                            <FiCheck style={{ color: '#4CAF50', fontSize: '1.5rem' }} />
                          ) : (
                            <FiCopy style={{ color: colorScheme.appColor, fontSize: '1.5rem' }} />
                          )}
                        </button>
                      </td>
                    </tr>
                    {Object.entries(selectedBooking).map(([key, value]) => (
                      key !== 'bookingId' && key !== 'refundData' && key !== 'cancelOrder' && (
                        <tr key={key} style={{ backgroundColor: colorScheme.darkGrey2 }} className="border-b border-gray-700">
                          <td className="px-6 py-4 text-xl font-bold uppercase" style={{ color: colorScheme.appColor, width: '50%' }}>
                            {key}
                          </td>
                          <td className="px-6 py-4 text-lg" style={{ width: '50%' }}>
                            <RenderValue value={value} field={key} />
                          </td>
                          <td className="px-6 py-4 text-lg text-right" style={{ width: '10%' }}>
                            <button onClick={() => handleCopyId(value)}>
                              {copiedId === value ? (
                                <FiCheck style={{ color: '#4CAF50', fontSize: '1.5rem' }} />
                              ) : (
                                <FiCopy style={{ color: colorScheme.appColor, fontSize: '1.5rem' }} />
                              )}
                            </button>
                          </td>
                        </tr>
                      )
                    ))}
                    {selectedBooking.refundData && selectedBooking.refundData.map((refund, index) => (
                      <tr key={`refund-${index}`} style={{ backgroundColor: colorScheme.darkGrey2 }} className="border-b border-gray-700">
                        <td className="px-6 py-4 text-lg font-bold uppercase" style={{ color: colorScheme.appColor, width: '30%' }}>
                          {refund.title}
                        </td>
                        <td className="px-6 py-4 text-lg" style={{ width: '60%' }}>
                          <RenderValue value={refund.value} field={refund.title} />
                        </td>
                        <td className="px-6 py-4 text-lg text-right" style={{ width: '10%' }}>
                          <button onClick={() => handleCopyId(refund.value)}>
                            {copiedId === refund.value ? (
                              <FiCheck style={{ color: '#4CAF50', fontSize: '1.5rem' }} />
                            ) : (
                              <FiCopy style={{ color: colorScheme.appColor, fontSize: '1.5rem' }} />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr style={{ backgroundColor: colorScheme.darkGrey2 }} className="border-b border-gray-700">
                      <td className="px-6 py-4 text-lg font-bold uppercase" style={{ color: colorScheme.appColor, width: '30%' }}>
                        Cancel Order
                      </td>
                      <td className="px-6 py-4 text-lg" style={{ width: '60%' }}>
                        <RenderValue value={selectedBooking.cancelOrder} field="cancelOrder" />
                      </td>
                      <td className="px-6 py-4 text-lg text-right" style={{ width: '10%' }}>
                        <button onClick={() => handleCopyId(selectedBooking.cancelOrder)}>
                          {copiedId === selectedBooking.cancelOrder ? (
                            <FiCheck style={{ color: '#4CAF50', fontSize: '1.5rem' }} />
                          ) : (
                            <FiCopy style={{ color: colorScheme.appColor, fontSize: '1.5rem' }} />
                          )}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

{showBookingDetails && bookingDetails && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="w-full h-full flex flex-col">
      <div
        className="rounded-lg p-6 flex-1 overflow-y-auto"
        style={{ 
          backgroundColor: colorScheme.darkGrey2, 
          border: `2px solid ${colorScheme.appColor}` 
        }}
      >
        <button
          className="flex items-center gap-2 hover:scale-105 transition-transform mb-4 p-4"
          style={{ color: colorScheme.appColor }}
          onClick={() => setShowBookingDetails(false)}
        >
          <FiArrowLeft className="text-3xl" />
          <span className="text-xl">Back</span>
        </button>

        <h1 className="text-3xl font-bold mb-4 text-center -mt-8" style={{ color: colorScheme.appColor }}>
          Booking Details
        </h1>

        <table className="w-full text-left border-collapse">
          <tbody>
            {Object.entries(bookingDetails).map(([key, value]) => (
              key !== 'bookingId' && key !== 'refundData' && key !== 'cancelOrder' && (
                <tr key={key} style={{ backgroundColor: colorScheme.darkGrey2 }} className="border-b border-gray-700">
                  <td className="px-6 py-4 text-xl font-bold uppercase" style={{ color: colorScheme.appColor, width: '50%' }}>
                    {key}
                  </td>
                  <td className="px-6 py-4 text-lg" style={{ width: '50%' }}>
                    <RenderValue value={value} />
                  </td>
                  <td className="px-6 py-4 text-lg text-right" style={{ width: '10%' }}>
                    <button onClick={() => handleCopyId(value)}>
                      {copiedId === value ? (
                        <FiCheck style={{ color: '#4CAF50', fontSize: '1.5rem' }} />
                      ) : (
                        <FiCopy style={{ color: colorScheme.appColor, fontSize: '1.5rem' }} />
                      )}
                    </button>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}



        {showDocuments && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="w-full h-full flex flex-col">
              <div
                className="rounded-lg p-6 flex-1 overflow-y-auto"
                style={{ 
                  backgroundColor: colorScheme.darkGrey2, 
                  border: `2px solid ${colorScheme.appColor}`,
                }}
              >
                <button
                  className="flex items-center gap-2 hover:scale-105 transition-transform mb-4 p-4"
                  style={{ color: colorScheme.appColor }}
                  onClick={() => setShowDocuments(false)}
                >
                  <FiArrowLeft className="text-3xl" />
                  <span className="text-xl">Back to Booking</span>
                </button>
                <h1 className="text-3xl font-bold mb-4 text-center -mt-8" style={{ color: colorScheme.appColor }}>
                  User Documents
                </h1> 
                {documents.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {documents.map((doc, index) => (
                      <div key={index} className="p-4 flex flex-col items-center">
                        <p className="text-lg mb-2" style={{ color: colorScheme.appColor }}>
                          {doc.name}
                        </p>
                        <img
                          src={doc.url}
                          alt={doc.name}
                          loading="lazy"
                          className="w-full h-auto mb-2"
                          onError={(e) => {
                            console.error('Error loading image:', doc.url);
                            e.target.src = '/path/to/placeholder-image.jpg';
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <a
                            href={doc.url}
                            download={doc.name}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-lg" style={{ color: colorScheme.appColor }}>
                    No documents available for this booking
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div
              className="rounded-lg p-6 w-full max-w-md"
              style={{ backgroundColor: colorScheme.darkGrey2, border: `2px solid ${colorScheme.appColor}` }}
            >
              <h3 className="text-xl font-bold mb-4 text-center" style={{ color: colorScheme.appColor }}>
                Cancel Order?
              </h3>
              <div className="flex justify-center gap-8">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-4 py-2 rounded font-bold"
                  style={{ backgroundColor: '#B0BEC5', color: '#FFFFFF' }}
                >
                  No
                </button>
                <button
                  onClick={handleCancelBooking}
                  className="px-4 py-2 rounded font-bold text-white"
                  style={{ backgroundColor: '#D32F2F' }}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}

        {showAddRefund && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div
              className="rounded-lg p-6 w-full max-w-2xl"
              style={{ backgroundColor: colorScheme.darkGrey2, border: `2px solid ${colorScheme.appColor}` }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold" style={{ color: colorScheme.appColor }}>
                  Add Refund Data
                </h3>
                <button
                  onClick={() => setShowAddRefund(false)}
                  className="text-2xl font-bold"
                  style={{ color: colorScheme.appColor }}
                >
                  ×
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {['Cancelled by Vendor', 'Booking Cancelled', 'Fuel Refund', 'Security Deposit Refund', 'Deductions'].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setRefundTitle(option);
                      if (option === 'Deductions') {
                        setShowDeductionOptions(true);
                      } else {
                        setShowDeductionOptions(false);
                      }
                    }}
                    className="px-4 py-2 rounded-full font-bold"
                    style={{ backgroundColor: '#424242', color: colorScheme.appColor }}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {showDeductionOptions && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {['Fast Tag', 'Fuel Charges', 'Extra Kilometers Charges', 'Others'].map((deductionOption) => (
                    <button
                      key={deductionOption}
                      onClick={() => setRefundTitle(`Deductions - ${deductionOption}`)}
                      className="px-4 py-2 rounded-full font-bold"
                      style={{ backgroundColor: '#424242', color: colorScheme.appColor }}
                    >
                      {deductionOption}
                    </button>
                  ))}
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium" style={{ color: colorScheme.appColor }}>
                  Title
                </label>
                <input
                  type="text"
                  value={refundTitle}
                  onChange={(e) => setRefundTitle(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 rounded-md"
                  style={{ backgroundColor: '#424242', color: colorScheme.appColor, border: '1px solid #757575' }}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium" style={{ color: colorScheme.appColor }}>
                  Value
                </label>
                <input
                  type="text"
                  value={refundValue}
                  onChange={(e) => setRefundValue(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 rounded-md"
                  style={{ backgroundColor: '#424242', color: colorScheme.appColor, border: '1px solid #757575' }}
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleAddRefund}
                  className="px-4 py-2 rounded text-white font-bold"
                  style={{ backgroundColor: '#1e88e5' }}
                >
                  Add Row
                </button>
                <button
                  onClick={() => {
                    handleAddRefund();
                  }}
                  className="px-4 py-2 rounded text-white font-bold"
                  style={{ backgroundColor: '#43a047' }}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default AgentBookingList;