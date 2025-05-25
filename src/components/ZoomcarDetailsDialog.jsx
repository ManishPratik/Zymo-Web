import PropTypes from "prop-types";

const ZoomcarDetailsDialog = ({ details, onClose }) => {
  if (!details) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatTimestampFromEpoch = (epochTime) => {
    if (!epochTime) return "N/A";
    const date = new Date(parseInt(epochTime));
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#212121] w-full max-w-6xl rounded-lg relative overflow-y-auto max-h-[90vh]">
        <div className="p-6">
          {/* Back Button and Title */}
          <div className="mb-8">
            <button
              onClick={onClose}
              className="flex items-center text-[#edff8d] mb-4 hover:opacity-80"
            >
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>
            <h1 className="text-2xl text-center text-[#edff8d] font-semibold mb-4">
              ZoomCar Booking Details
            </h1>
            <div className="flex justify-center items-center gap-4">
              {details.status && (
                <span
                  className={`px-6 py-1 rounded-full text-sm font-medium ${
                    details.status === "SUCCESS"
                      ? "bg-[#F7B614] text-black"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {details.status}
                </span>
              )}
              {details.sub_status && (
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium capitalize">
                  {details.sub_status}
                </span>
              )}
            </div>
          </div>{" "}
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Car Details Section */}
              <div className="bg-[#1A1A1A] rounded-lg p-6">
                <h2 className="text-[#edff8d] text-xl font-semibold mb-6">
                  Car Details
                </h2>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">
                        Brand & Model
                      </p>
                      <p className="text-white">
                        {details.car_details?.brand}{" "}
                        {details.car_details?.model}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">License</p>
                      <p className="text-white">
                        {details.car_details?.license || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Segment</p>
                      <p className="text-white">
                        {details.car_details?.segment}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Seating</p>
                      <p className="text-white">
                        {details.car_details?.seater} Seater
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Transmission</p>
                      <p className="text-white">
                        {details.car_details?.transmission}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Fuel Type</p>
                      <p className="text-white capitalize">
                        {details.car_details?.fuel_type}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Car ID</p>
                    <p className="text-white">{details.car_details?.car_id}</p>
                  </div>
                </div>
              </div>

              {/* Booking Information Section */}
              <div className="bg-[#1A1A1A] rounded-lg p-6">
                <h2 className="text-[#edff8d] text-xl font-semibold mb-6">
                  Booking Information
                </h2>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Booking ID</p>
                      <p className="text-white font-mono">{details.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Booking Type</p>
                      <p className="text-white">{details.type}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Start Time</p>
                      <p className="text-white">
                        {formatTimestampFromEpoch(details.starts)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">End Time</p>
                      <p className="text-white">
                        {formatTimestampFromEpoch(details.ends)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Fuel Included</p>
                    <p className="text-white">
                      {details.fuel_included ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Free KMs</p>
                    <p className="text-white">{details.free_kms || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Pickup Location Section */}
              <div className="bg-[#1A1A1A] rounded-lg p-6">
                <h2 className="text-[#edff8d] text-xl font-semibold mb-6">
                  Pickup Location
                </h2>
                <div className="grid gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Address</p>
                    <p className="text-white">
                      {details.pickup_location?.address}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Latitude</p>
                      <p className="text-white">
                        {details.pickup_location?.lat}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Longitude</p>
                      <p className="text-white">
                        {details.pickup_location?.lng}
                      </p>
                    </div>
                  </div>
                  {details.pickup_location?.last_mile?.directions && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Directions</p>
                      <p className="text-white">
                        {
                          details.pickup_location.last_mile.directions[0]
                            ?.instructions
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* User Details Section */}
              {details.user_details && (
                <div className="bg-[#1A1A1A] rounded-lg p-6">
                  <h2 className="text-[#edff8d] text-xl font-semibold mb-6">
                    User Details
                  </h2>
                  <div className="grid gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Phone</p>
                      <p className="text-white">{details.user_details.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">
                        Profile Status
                      </p>
                      <p className="text-white capitalize">
                        {details.user_details.profile_status}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">License</p>
                      <p className="text-white">
                        {details.user_details.license || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Payment Summary */}
              {details.fare_breakup && (
                <div className="bg-[#1A1A1A] rounded-lg p-6">
                  <h2 className="text-[#edff8d] text-xl font-semibold mb-6">
                    Payment Summary
                  </h2>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm mb-1">
                          Total Amount
                        </p>
                        <p className="text-white font-bold text-lg">
                          {formatCurrency(
                            details.fare_breakup.charges?.total_amount || 0
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-1">
                          Payment Received
                        </p>
                        <p className="text-green-400 font-bold text-lg">
                          {formatCurrency(
                            details.fare_breakup.payment_received || 0
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm mb-1">
                          Refunds Made
                        </p>
                        <p className="text-red-400 font-bold">
                          {formatCurrency(
                            details.fare_breakup.refunds_made || 0
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-1">
                          Outstanding
                        </p>
                        <p className="text-yellow-400 font-bold">
                          {formatCurrency(
                            details.fare_breakup.outstanding || 0
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Charge Breakdown */}
              {details.fare_breakup?.charges?.break_up &&
                details.fare_breakup.charges.break_up.length > 0 && (
                  <div className="bg-[#1A1A1A] rounded-lg p-6">
                    <h2 className="text-[#edff8d] text-xl font-semibold mb-6">
                      Charge Breakdown
                    </h2>
                    <div className="space-y-3">
                      {details.fare_breakup.charges.break_up.map(
                        (charge, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-[#2A2A2A] rounded"
                          >
                            <div>
                              <p className="text-white font-medium">
                                {charge.activity}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {charge.refundable
                                  ? "Refundable"
                                  : "Non-refundable"}{" "}
                                • {charge.category}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-bold">
                                {formatCurrency(charge.amount)}
                              </p>
                              <p
                                className={`text-sm ${
                                  charge.processed
                                    ? "text-green-400"
                                    : "text-yellow-400"
                                }`}
                              >
                                {charge.processed ? "Processed" : "Pending"}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Payment Received Breakdown */}
              {details.fare_breakup?.payments_received_breakup?.break_up &&
                details.fare_breakup.payments_received_breakup.break_up.length >
                  0 && (
                  <div className="bg-[#1A1A1A] rounded-lg p-6">
                    <h2 className="text-[#edff8d] text-xl font-semibold mb-6">
                      Payment Received
                    </h2>
                    <div className="space-y-3">
                      {details.fare_breakup.payments_received_breakup.break_up.map(
                        (payment, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-[#2A2A2A] rounded"
                          >
                            <div>
                              <p className="text-white font-medium">
                                Payment #{payment.id}
                              </p>
                              <p className="text-gray-400 text-sm">
                                Source: {payment.source} •{" "}
                                {formatTimestampFromEpoch(payment.created_at)}
                              </p>
                            </div>
                            <p className="text-green-400 font-bold">
                              {formatCurrency(payment.amount)}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Refund Breakdown */}
              {details.fare_breakup?.refund_made_breakup?.break_up &&
                details.fare_breakup.refund_made_breakup.break_up.length >
                  0 && (
                  <div className="bg-[#1A1A1A] rounded-lg p-6">
                    <h2 className="text-[#edff8d] text-xl font-semibold mb-6">
                      Refunds Made
                    </h2>
                    <div className="space-y-3">
                      {details.fare_breakup.refund_made_breakup.break_up.map(
                        (refund, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-[#2A2A2A] rounded"
                          >
                            <div>
                              <p className="text-white font-medium">
                                Refund #{refund.id}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {formatTimestampFromEpoch(refund.created_at)}
                              </p>
                            </div>
                            <p className="text-red-400 font-bold">
                              {formatCurrency(refund.amount)}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Cancellation Policy */}
              {details.cancellation_policy?.section_data?.policy_data && (
                <div className="bg-[#1A1A1A] rounded-lg p-6">
                  <h2 className="text-[#edff8d] text-xl font-semibold mb-6">
                    Cancellation Policy
                  </h2>
                  {details.cancellation_policy.section_data.policy_data.map(
                    (policy, index) => (
                      <div key={index} className="space-y-4">
                        {policy.id === "CANCELLATION_POLICY" && (
                          <>
                            <div className="p-4 bg-[#2A2A2A] rounded">
                              <h3 className="text-white font-medium mb-2">
                                {policy.title}
                              </h3>
                              {policy.cancellation_data && (
                                <div className="space-y-3">
                                  <p className="text-gray-300 text-sm">
                                    {policy.cancellation_data.sub_header}
                                  </p>
                                  {policy.cancellation_data.cancel_charges
                                    ?.charges_timeline && (
                                    <div className="space-y-2">
                                      <p className="text-[#edff8d] font-medium">
                                        Refund Timeline:
                                      </p>
                                      {policy.cancellation_data.cancel_charges.charges_timeline.map(
                                        (timeline, idx) => (
                                          <div
                                            key={idx}
                                            className="flex justify-between items-center"
                                          >
                                            <span className="text-white">
                                              {timeline.refund}
                                            </span>
                                            <span className="text-gray-400 text-sm">
                                              Until{" "}
                                              {formatTimestampFromEpoch(
                                                timeline.upto_epoch
                                              )}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Trip Readings */}
              {(details.trip_start_readings || details.trip_end_readings) && (
                <div className="bg-[#1A1A1A] rounded-lg p-6">
                  <h2 className="text-[#edff8d] text-xl font-semibold mb-6">
                    Trip Readings
                  </h2>
                  <div className="grid gap-4">
                    {details.trip_start_readings && (
                      <div>
                        <p className="text-gray-400 text-sm mb-1">
                          Start Readings
                        </p>
                        <pre className="text-white text-sm bg-[#2A2A2A] p-3 rounded overflow-x-auto">
                          {JSON.stringify(details.trip_start_readings, null, 2)}
                        </pre>
                      </div>
                    )}
                    {details.trip_end_readings && (
                      <div>
                        <p className="text-gray-400 text-sm mb-1">
                          End Readings
                        </p>
                        <pre className="text-white text-sm bg-[#2A2A2A] p-3 rounded overflow-x-auto">
                          {JSON.stringify(details.trip_end_readings, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>{" "}
        </div>
      </div>
    </div>
  );
};

ZoomcarDetailsDialog.propTypes = {
  details: PropTypes.shape({
    id: PropTypes.string,
    status: PropTypes.string,
    sub_status: PropTypes.string,
    starts: PropTypes.string,
    ends: PropTypes.string,
    type: PropTypes.string,
    fuel_included: PropTypes.bool,
    free_kms: PropTypes.any,
    release_payment: PropTypes.bool,
    msg: PropTypes.string,
    car_details: PropTypes.shape({
      id: PropTypes.number,
      brand: PropTypes.string,
      model: PropTypes.string,
      segment: PropTypes.string,
      transmission: PropTypes.string,
      fuel_type: PropTypes.string,
      seater: PropTypes.number,
      license: PropTypes.string,
      car_id: PropTypes.number,
      img: PropTypes.any,
    }),
    pickup_location: PropTypes.shape({
      lat: PropTypes.string,
      lng: PropTypes.string,
      address: PropTypes.string,
      radius: PropTypes.number,
      last_mile: PropTypes.shape({
        directions: PropTypes.arrayOf(
          PropTypes.shape({
            img: PropTypes.string,
            instructions: PropTypes.string,
          })
        ),
      }),
    }),
    user_details: PropTypes.shape({
      phone: PropTypes.string,
      profile_status: PropTypes.string,
      license: PropTypes.string,
    }),
    fare_breakup: PropTypes.shape({
      charges: PropTypes.shape({
        total_amount: PropTypes.number,
        break_up: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.number,
            activikey: PropTypes.string,
            activity: PropTypes.string,
            amount: PropTypes.number,
            refundable: PropTypes.bool,
            category: PropTypes.string,
            type: PropTypes.string,
            processed: PropTypes.bool,
          })
        ),
      }),
      payment_received: PropTypes.number,
      payments_received_breakup: PropTypes.shape({
        total: PropTypes.number,
        break_up: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.number,
            amount: PropTypes.number,
            source: PropTypes.string,
            created_at: PropTypes.string,
          })
        ),
      }),
      refunds_made: PropTypes.number,
      refund_made_breakup: PropTypes.shape({
        total: PropTypes.number,
        break_up: PropTypes.array,
      }),
      outstanding: PropTypes.number,
    }),
    cancellation_policy: PropTypes.shape({
      header_id: PropTypes.string,
      type: PropTypes.string,
      section_title: PropTypes.string,
      section_data: PropTypes.shape({
        policy_data: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string,
            icon: PropTypes.string,
            title: PropTypes.string,
            attributed_strings: PropTypes.any,
            action: PropTypes.object,
            cancellation_data: PropTypes.shape({
              header: PropTypes.string,
              sub_header: PropTypes.string,
              cancel_charges: PropTypes.shape({
                title: PropTypes.string,
                charges_timeline: PropTypes.arrayOf(
                  PropTypes.shape({
                    refund: PropTypes.string,
                    state: PropTypes.string,
                    fraction: PropTypes.number,
                    upto_epoch: PropTypes.number,
                  })
                ),
              }),
              link_action: PropTypes.object,
              cta_text: PropTypes.string,
            }),
          })
        ),
      }),
    }),
    hd_details: PropTypes.any,
    trip_start_readings: PropTypes.any,
    trip_end_readings: PropTypes.any,
  }),
  onClose: PropTypes.func.isRequired,
};

export default ZoomcarDetailsDialog;
