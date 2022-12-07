import { Pagination } from "./pagination.type";
import { UserI } from "src/app/user/user.interface";
import { MessageI } from "./message.interface";
import { MutedRoomI } from "./muted-room.interface";

export interface RoomI {
    id?:            number;
    name?:          string;
    description?:   string;
    type?:          string;
    password?:      string;
    users?:         UserI[];
    adminUsers?:    UserI[];
    createdBy?:     UserI;
    ownedByUser?:   UserI;
    createdAt:      Date;
    updatedAt?:     Date;
    messages?:      MessageI[]
    mutedUsers:     MutedRoomI[]
    bannedUsers?:   UserI[];
}

export interface RoomPaginatedI {
    items: RoomI[];
    pagination: Pagination;
}