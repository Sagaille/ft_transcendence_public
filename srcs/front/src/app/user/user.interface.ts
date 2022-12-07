export interface UserI {
	id?:			number;
	username: 		string;
	avatar: 		string;
	ingame_name: 	string,
	wins: 			number,
	losses:			number,
	ladder_lvl:		number,
	match_history:	number[],
	two_factor:		boolean,
	friends:		string[],
	status:			string,
	email:			string,
	blockedByUsers:	UserI[],
	blockingUsers:	UserI[],
}
