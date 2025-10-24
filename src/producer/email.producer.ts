import { NotificationDTO } from "../dto/notification.dto";
import { queue } from "../queue/queue";

export const PAYLOAD='payload'

export const addEmailToQueue= async(payload:NotificationDTO)=>{
    await queue.add(PAYLOAD,payload);
    console.log(`Email added to queue : ${JSON.stringify(payload)}`)
}
