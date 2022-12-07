import { RoomI } from "src/chat/model/room.interface";

export interface UserI {
    id?: number;
    username?: string;
    rooms?: RoomI[];
    ownerRoom?: RoomI[];
    admin_of_room?: RoomI[];

}
