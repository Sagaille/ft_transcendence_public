import { Pagination } from "./pagination.type";
import { RoomI } from "./room.interface";
import { UserI } from "src/app/user/user.interface";

export interface MessageI {
    id?:        number;
    text:       string;
    user_id?:   string;
    user?:      UserI;
    room_id?:   string;
    room:       RoomI;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface messagePaginateI {
    items: MessageI[];
    pagination: Pagination;
}