import { UserI } from "src/user/user.interface";
import { Pagination } from "./pagination.type";

export interface RoomI {
    id?:            number;
    name?:          string;
    description?:   string;
    type?:          string;
    password?:      string;
    users?:         UserI[];
    adminUsers?:    UserI[];
    mutedUsers?:    UserI[];
    bannedUsers?:   UserI[];
    ownedByUser?:   UserI;
    createdBy?:     UserI;
    createdAt?:     Date;
    updatedAt?:     Date;
}

export interface RoomPaginatedI {
    items: RoomI[];
    pagination: Pagination;
}
