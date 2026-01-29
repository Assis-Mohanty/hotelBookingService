import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./generated/client";
const adapter = new PrismaMariaDb(
  {
    host: "localhost",
    port: 3306,
    database:"hotel_booking_dev",
    user:"root",
    password:"qqqq",
    connectionLimit: 100
  }
)
export const prisma = new PrismaClient({
    adapter: adapter
});
