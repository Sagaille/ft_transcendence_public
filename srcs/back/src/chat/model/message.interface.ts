import { UserI } from "src/user/user.interface";
import { Pagination } from "./pagination.type";
import { RoomI } from "./room.interface";

export interface MessageI {
    id?: number;
    text: string;
    user: UserI;
    room: RoomI;
    createdAt: Date;
    updatedAt: Date;
}

export interface MessagePaginatedI {
    items: MessageI[];
    pagination: Pagination;
}
