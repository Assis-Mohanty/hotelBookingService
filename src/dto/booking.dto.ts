export interface CreateBookingDTO{
    userId:number
    hotelId:number
    totalGuest:number
    bookingAmt:number
    checkInDate:string
    checkOutDate:string
    roomCategoryId:string
}
