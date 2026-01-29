export interface CreateBookingDTO{
    userId:number
    hotelId:number
    totalGuest:number
    bookingAmt:number
    checkInDate:Date
    checkOutDate:Date
    roomCategoryId:number
}
