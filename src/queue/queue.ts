import { Queue } from "bullmq";
import { getRedisConnection } from "../config/redisConfig";

export const theQueue:string='queue';
export const queue=new Queue(theQueue,{
    connection:getRedisConnection()
})