
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../utils/errors/app.error";
import { validate as isValidUUID } from "uuid";
import { prisma } from "../prisma/client";
import { idempotencykey, Prisma } from "../prisma/generated/client";

export async function createBooking(bookingInput: Prisma.bookingCreateInput) {
  if (!bookingInput) {
    throw new BadRequestError("No input");
  }
  const booking = await prisma.booking.create({
    data: bookingInput,
  });

  return booking;
}

export async function createIdempotencyKey(idemKey: string, bookingId: number) {
  const idempotencyKey = await prisma.idempotencykey.create({
    data: {
      idemKey: idemKey,
      updatedAt: new Date(),
      booking: {
        connect: {
          id: bookingId,
        },
      },
    },
  });

  return idempotencyKey;
}

export async function getIdempotencyKeyWithLock(
  tx: Prisma.TransactionClient,
  idemKey: string,
) {
  if (!isValidUUID(idemKey)) {
    throw new InternalServerError("Invalid idempotency key format");
  }
  const idempotencyKey: Array<idempotencykey> = await tx.$queryRaw(Prisma.sql`
        SELECT * FROM idempotencykey WHERE idemKey=${idemKey} FOR UPDATE`);

  if (!idempotencyKey || idempotencyKey.length === 0) {
    throw new NotFoundError("Idempotency Key not found");
  }
  return idempotencyKey[0];
}

export async function getBookingById(bookingId: number) {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
  });

  return booking;
}

export async function confirmBooking(
  tx: any,
  bookingId: number,
) {
  const booking = await (tx as any).booking.update({
    where: {
      id: bookingId,
    },
    data: {
      status: "CONFIRMED",
    },
  });
  return booking;
}

export async function cancelBooking(bookingId: number) {
  const booking = await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      status: "CANCELLED",
    },
  });
  return booking;
}

export async function finalizeIdempotencyKey(
  tx: Prisma.TransactionClient,
  idemKey: string
) {
  return await tx.idempotencykey.update({
    where: {
      idemKey: idemKey,
    },
    data: {
      finalized: true,
    },
  });
}

