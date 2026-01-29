import { CreateBookingDTO } from '../dto/booking.dto';
import { confirmBooking, createBooking, createIdempotencyKey, finalizeIdempotencyKey, getIdempotencyKeyWithLock } from '../repository/booking.repository';
import { BadRequestError, NotFoundError } from '../utils/errors/app.error';
import  generateIdempotencyKey  from '../utils/helpers/generateIdempotencyKey'
import { serverConfig } from '../config';
import { redlock } from '../config/redisConfig';
import { prisma } from '../prisma/client';
import { getAvailableRooms } from '../utils/helpers/getAvailableRooms';
import { updateBookingIdToRoomsTable } from '../utils/helpers/updateBookingIdToRoomsTable';

type AvailableRooms={
    id:number
    roomCategoryId:number
    dateOfAvailability:Date
}

export async function createBookingService(createBookingDTO: CreateBookingDTO) {
    console.log("amskdma")

    
    // const availableRoomsIds:number[]=avaliableRooms.forEach(room => {
    //     room.id
    // });

    const ttl = serverConfig.LOCK_TTL;
    const bookingResource = `hotel:${createBookingDTO.roomCategoryId}`;
    let lock
        console.log("reached ")

    try {
        lock =await redlock.acquire([bookingResource], ttl);
        const avaliableRooms=await getAvailableRooms(createBookingDTO.roomCategoryId,createBookingDTO.checkInDate,createBookingDTO.checkOutDate)
        const checkInDate = new Date(createBookingDTO.checkInDate);
        const checkOutDate = new Date(createBookingDTO.checkOutDate);
        console.log("reached q")

        if (
        isNaN(checkInDate.getTime()) ||
        isNaN(checkOutDate.getTime())
        ) {
        throw new BadRequestError("Invalid check-in or check-out date");
        }
        // const checkInDate=new Date(createBookingDTO.checkInDate)
        // const checkOutDate= new Date(createBookingDTO.checkOutDate)
        // const totalNights=Math.ceil((checkOutDate.getTime()-checkInDate.getTime())/1000*60*60*24)
        
        // const totalNights=Math.ceil((createBookingDTO.checkOutDate.getTime()-createBookingDTO.checkInDate.getTime())/(1000*60*60*24))
        if (avaliableRooms.length==0 ){
            throw new NotFoundError("No available Rooms for given dates")
        }
        console.log("reached 1")
        const booking = await createBooking({
            userId: createBookingDTO.userId,
            hotelId:createBookingDTO.hotelId,
            totalGuests: createBookingDTO.totalGuest,
            bookingAmount: createBookingDTO.bookingAmt,
            checkInDate:checkInDate,
            checkOutDate:checkOutDate,
            roomCategoryId:createBookingDTO.roomCategoryId
        });

        const idempotencyKey = generateIdempotencyKey();
        console.log("reached 2")

        await createIdempotencyKey(idempotencyKey, booking.id);
        await updateBookingIdToRoomsTable(booking.id,avaliableRooms.map((room:AvailableRooms)=>room.id))
        return {
            bookingId: booking.id,
            idempotencyKey: idempotencyKey,
        };
    } catch (error) {
        throw error
    }
    finally {
  if (lock) {
    await lock.release().catch(() => {
    });
  }
}
}


export async function confirmBookingService(idempotencyKey: string) {
    return await prisma.$transaction(async(tx:any )=>{
        const idempotencyKeyData = await getIdempotencyKeyWithLock(tx,idempotencyKey);

        if(!idempotencyKeyData ) {
        throw new NotFoundError('Idempotency key not found'); 
        }
        
        if(idempotencyKeyData.finalized) {
            throw new BadRequestError('Idempotency key already finalized');
        }

        const booking = await confirmBooking(tx,idempotencyKeyData.bookingId);
        await finalizeIdempotencyKey(tx,idempotencyKey);
        return booking;
    })
}