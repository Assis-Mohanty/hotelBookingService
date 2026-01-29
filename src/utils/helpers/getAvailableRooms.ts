import axios from "axios";
import { serverConfig } from "../../config";

export async function getAvailableRooms(
  roomCategoryId: number,
  checkInDate: Date,
  checkOutDate: Date
): Promise<any[]> {
  const response = await axios.get(
    `${serverConfig.GET_ROOM_URL}category/${roomCategoryId}/range?startDate=${checkInDate}&endDate=${checkOutDate}`,
  );

  return response.data.data;
}
