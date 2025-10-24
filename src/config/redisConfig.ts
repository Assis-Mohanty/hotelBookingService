import IORedis, { Redis } from "ioredis"
import Redlock from "redlock"
import { serverConfig } from "."

// export const redisClient = new IORedis(serverConfig.REDIS_URL);

export function connectToRedis(){
    try {
        let connection: Redis
        return ()=>{
            if(!connection){
                connection = new IORedis(serverConfig.REDIS_URL);
                return connection;
            }
            return connection;
        }
    } catch (error) {
        console.log("Error connecting to Redis :",error)
        throw error
    }
}

export const getRedisConnection=connectToRedis();
export const redlock=new Redlock([getRedisConnection()],{
    driftFactor:0.01,
    retryCount:10,
    retryDelay:200,
    retryJitter:200
});

