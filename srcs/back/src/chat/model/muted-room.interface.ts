import { UserI } from "src/user/user.interface";
import { RoomI } from "./room.interface";

export interface MutedRoomI {
    id?:            number;
    mutedUser?:		UserI;
    room?:			RoomI;
    createdAt?:		Date;
    endAt?:			Date;
}