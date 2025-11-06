// This file contains all the basic configuration logic for the app server to work
import dotenv from 'dotenv';

type ServerConfig = {
    PORT: number,
    REDIS_URL:string,
    LOCK_TTL:number,
    GET_ROOM_URL:string
}

function loadEnv() {
    dotenv.config();
    console.log(`Environment variables loaded`);
}

loadEnv();

export const serverConfig: ServerConfig = {
    PORT: Number(process.env.PORT) || 3001,
    REDIS_URL:process.env.REDIS_URL || "redis://localhost:6379",
    LOCK_TTL:Number(process.env.LOCK_TTL) || 30000,
    GET_ROOM_URL:process.env.GET_ROOM_URL || 'http://localhost:3000/api/v1/room/',
};