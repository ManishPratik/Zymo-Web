
export const handleGetZoomcarDetails = async (bookingId, uid, setZoomcarDetails, setIsZoomcarModalOpen, setLoadingZoomDetails) => {
  setLoadingZoomDetails(true);
  const url = import.meta.env.VITE_FUNCTIONS_API_URL;

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
    }    const apiResponseData = await response.json(); // Raw data from API

    // Pass the complete API response to the ZoomcarDetails component
    // The component is designed to handle the full API response structure
    setZoomcarDetails(apiResponseData); // Set the complete API response to zoomcarDetails state
    setIsZoomcarModalOpen(true);        // Open the modal
    console.log("Complete Zoom API Response:", apiResponseData);
  } catch (error) {
    console.error("Error fetching Zoomcar details:", error);
    alert("Failed to fetch Zoomcar booking details. Please try again.");
  } finally {
    setLoadingZoomDetails(false);
  }
};
