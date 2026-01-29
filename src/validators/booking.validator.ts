// import { z } from 'zod';

// export const createBookingSchema = z.object({
//     userId: z.number({ message: "User ID must be present" }),
//     hotelId: z.number({ message: "Hotel ID must be present" }),
//     totalGuest: z.number({ message: "Total guests must be present" }).min(1, { message: "Total guests must be at least 1" }),
//     bookingAmt: z.number({ message: "Booking amount must be present" }).min(1, { message: "Booking amount must be greater than 1" }),
//     checkInDate:z.string({message:"Check in date in required"}),
//     checkOutDate:z.string({message:"Check out date in required"}),
//     roomCategoryId:z.string({message:"room category id is required"})
// })