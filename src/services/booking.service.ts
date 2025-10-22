import { CreateBookingDTO } from '../dto/booking.dto';
import { confirmBooking, createBooking, createIdempotencyKey, finalizeIdempotencyKey, getIdempotencyKeyWithLock } from '../repository/booking.repository';
import { BadRequestError, InternalServerError, NotFoundError } from '../utils/errors/app.error';
import  generateIdempotencyKey  from '../utils/helpers/generateIdempotencyKey'
import {  PrismaClient } from '@prisma/client';
import { serverConfig } from '../config';
import { redlock } from '../config/redisConfig';
const prisma=new PrismaClient();

export async function createBookingService(createBookingDTO: CreateBookingDTO) {
    const ttl = serverConfig.LOCK_TTL;
    const bookingResource = `hotel:${createBookingDTO.hotelId}`;

    try {
        await redlock.acquire([bookingResource], ttl);
        const booking = await createBooking({
            userId: createBookingDTO.userId,
            hotelId: createBookingDTO.hotelId,
            totalGuests: createBookingDTO.totalGuest,
            bookingAmount: createBookingDTO.bookingAmt,
        });

        const idempotencyKey = generateIdempotencyKey();

        await createIdempotencyKey(idempotencyKey, booking.id);

        return {
            bookingId: booking.id,
            idempotencyKey: idempotencyKey,
        };
    } catch (error) {
        throw new InternalServerError('Failed to acquire lock for booking resource');
    }
}

// Todo: explore the function for potential issues and improvements
export async function confirmBookingService(idempotencyKey: string) {
    return await prisma.$transaction(async(tx)=>{
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