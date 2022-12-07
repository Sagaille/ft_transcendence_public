import { UserI } from "src/app/user/user.interface";
import { RoomI } from "./room.interface";

export interface MutedRoomI {
    id:            number;
    mutedUserId?:   number;
    mutedUser?:		UserI;
    roomId?:         number;
    room?:			RoomI;
    createdAt:		Date
    endAt:			Date;
}