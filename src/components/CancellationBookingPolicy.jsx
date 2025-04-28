import React from 'react'

const CancellationBookingPolicy = ({ vendor }) => {
    return (
        <>
            {vendor == "ZoomCar" ?

                <div>
                    <h3 className="text-xl font-bold mb-2">Cancellation Policy</h3>
                    <ul className="mb-4 list-disc pl-5">
                        <li><strong>More than 6 Hours Before Trip Start Time:</strong> 50% of the booking amount will be refunded.</li>
                        <li><strong>Within 6 Hours of the Trip Start Time or After the Trip Has Started:</strong> No refund (100% cancellation charge applies).</li>
                        <li>In case a user has cancelled multiple consecutive bookings then they will be charged 50%.</li>
                        <li>In case of no car available, 100% booking fee will be refunded.</li>
                    </ul>
                </div>
                :

                <div className=' text-gray-300'>
                    <h3 className="text-xl font-bold mb-2">Cancellation Policy</h3>
                    <ul className="mb-4 list-disc pl-5">
                        <li><strong>Up to 6 Hours Before Trip Start Time:</strong> 100% cancellation charge (No refund).</li>
                        <li><strong>Between 6-24 Hours Before Trip Start Time:</strong> 50% cancellation charge (50% refund).</li>
                        <li><strong>More than 24 Hours Before Trip Start Time:</strong> 2% cancellation charge (98% refund).</li>
                    </ul>
                </div>
            }



        </>
    )
}

export default CancellationBookingPolicy
