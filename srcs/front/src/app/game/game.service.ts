import { Injectable, resolveForwardRef } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { AuthService } from '../login/auth.service';
import { UserI } from '../user/user.interface';
import { BehaviorSubject } from 'rxjs';
import { GameI } from './interfaces/game.interface';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable({
	providedIn: 'root'
})
export class GameService {

	socket: Socket;
	user: BehaviorSubject<UserI>;
	constructor(private authService: AuthService,
		private router: Router) {
		this.socket = io("http://localhost:3000");
		this.user = this.authService.user$;

		this.socket.on('navigateTo', (response: any[]) => {
			this.router.navigate(response);
		});
		this.socket.on('getFriendInvitation', (sender: UserI) => {
			this.getFriendInvitation(sender);
		});
		this.socket.on('invitationDecline', (receiver: UserI) => {
			this.invitationDecline(receiver);
		});
		this.socket.on('invitationPlayerStatus', (response: any) => {
			this.invitationPlayerStatus(response);
		});
		this.socket.on('updateUser', (response: any) => {
			this.updateUser(response['user']);
		});
		this.socket.on('invitationStatusFailed', () => {
			Swal.fire({
				title: `Invite not send!`,
				text: 'At least one of you is currently playing, watching or offline!',
				icon: 'info',
			});
		})
	}

	spectatePlayer(username: string) {
		this.socket.emit('getOnGoingGameList');
		this.socket.once('getOnGoingGameList', (response: GameI[]) => {
			let gameList: GameI[] = response;
			let gameId: number;
			for (let index = 0; index < gameList.length; index++) {
				const element = gameList[index];
				if (element.player1.user.username == username || element.player2.user.username == username) {
					gameId = element.id;
					this.socket.emit('SpectateRequest', { user: this.user.value, gameId: gameId });
                    this.router.navigate(['/spectate']);
					return;
				}
			}
			Swal.fire({
				title: `${username} is not currently playing!`,
				text: 'You can only spectate on going games!',
				icon: 'info',
			});
		});
	}

	friendGameInvitation(receiver: UserI) {
		// Call this function to send a prompt to invite another user to a game
		this.socket.emit('friendGameInvitation', { sender: this.user.value, receiver: receiver });
	}

	getFriendInvitation(sender: UserI) {
		let timerInterval;
		Swal.fire({
			title: `Invited to play Pong by ${sender.ingame_name}`,
			text: 'Accept to start a game of Pong!',
			icon: 'question',
			showDenyButton: true,
			confirmButtonText: 'Join',
			denyButtonText: 'Deny',
		}).then((result) => {
			if (result.isConfirmed) {
				this.socket.emit('friendGameAcceptation', { sender: sender, receiver: this.user.value });
			} else if (result.isDenied) {
				this.socket.emit('friendGameDecline', { sender: sender, receiver: this.user.value });
			}
		});
	}

	invitationDecline(receiver: UserI) {
		Swal.fire({
			title: `Invitation to play Pong declined by ${receiver.ingame_name}`,
			text: 'Maybe you could ask your opponent for a game of Pong later!',
			icon: 'error',
		});
	}


	friendGameAcceptation(senderId: number) {
		// Sender Socket is expected to be the gameServiceSocket
		// If sender click on invite, a prompt is sent to the receiver
		// If the receiver accept the game, call this function & redirect sender to /game
		this.socket.emit('friendGameAcceptation', { receiver: this.user.value.id, sender: senderId });
	}

	invitationPlayerStatus(response: any) {
		let sender: UserI = response['sender'];
		let receiver: UserI = response['receiver'];
		if (sender && receiver) {
			let timerInterval: any;
			Swal.fire({
				title: `Invite to play sent to ${receiver.ingame_name}`,
				text: 'If your opponent accept your invitation, you will start a Pong game!',
				icon: 'info',
				timer: 3000,
				timerProgressBar: true,
				didOpen: () => {
					Swal.showLoading()
					timerInterval = setInterval(() => { }, 100)
				},
				willClose: () => {
					clearInterval(timerInterval)
				}
			})
			this.friendGameInvitation(receiver);
		}
	}

	updateUser(user: UserI) {
		this.user.value.ladder_lvl = user.ladder_lvl;
		this.user.value.losses = user.losses;
		this.user.value.match_history = user.match_history;
		this.user.value.status = user.status;
		this.user.value.wins = user.wins;
		// console.log(`Current user Status: ${this.user.value.status}`);
	}

}