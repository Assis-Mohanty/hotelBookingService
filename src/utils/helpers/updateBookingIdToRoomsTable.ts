import axios from "axios"
import { serverConfig } from "../../config"

export async function updateBookingIdToRoomsTable(bookingId:number,roomIds:number[]){
    const result = await axios.patch(`${serverConfig.GET_ROOM_URL}bookings/${bookingId}`,{
        roomIds
    })
    return result.data.data
}