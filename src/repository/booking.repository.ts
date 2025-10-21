import { Prisma , IdempotencyKey} from "@prisma/client";

import prismaClient from "../prisma/client";
import { BadRequestError, InternalServerError, NotFoundError } from "../utils/errors/app.error";
import {validate as isValidUUID } from 'uuid'
export async function createBooking(bookingInput: Prisma.BookingCreateInput) {
    if(!bookingInput){
        throw new BadRequestError("No input")
    }
    const booking = await prismaClient.booking.create({
        data: bookingInput
    });

    return booking;
}


export async function createIdempotencyKey(idemKey: string, bookingId: number) {
    const idempotencyKey = await prismaClient.idempotencyKey.create({
        data: {
            idemKey:idemKey,
            booking: {
                connect: {
                    id: bookingId
                }
            }
        }
    });

    return idempotencyKey;
}

export async function getIdempotencyKeyWithLock(tx:Prisma.TransactionClient,idemKey: string) {
    if(!isValidUUID(idemKey)){
        throw new InternalServerError("Invalid idempotency key format")
    }
    const idempotencyKey:Array<IdempotencyKey>=await tx.$queryRaw (Prisma.sql`
        SELECT * FROM IdempotencyKey WHERE idemKey=${idemKey} FOR UPDATE`)

    if(!idempotencyKey||idempotencyKey.length===0){
        throw new NotFoundError('Idempotency Key not found')
    }
    return idempotencyKey[0]
}

export async function getBookingById(bookingId: number) {
    const booking = await prismaClient.booking.findUnique({
        where: {
            id: bookingId
        }
    });

    return booking;
}

export async function confirmBooking(tx:Prisma.TransactionClient,bookingId: number) {
    const booking = await tx.booking.update({
        where: {
            id: bookingId
        },
        data: {
            status: "CONFIRMED"
        }
    });
    return booking;
} 

export async function cancelBooking(bookingId: number) {
    const booking = await prismaClient.booking.update({
        where: {
            id: bookingId
        },
        data: {
            status: "CANCELLED"
        }
    });
    return booking;
}

export async function finalizeIdempotencyKey(tx:Prisma.TransactionClient,IdemKey: string) {
    console.log('Finalizing Idempotency Key:', IdemKey);
    const idempotencyKey = await tx.idempotencyKey.update({
        where: {
            idemKey:IdemKey,
        },
        data: {
            finalized: true,
        },
    });
    console.log('Finalized Idempotency Key:', idempotencyKey);
    return idempotencyKey;
}