import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../chat/services/chat-service/chat.service';
import { GameService } from '../game/game.service';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  constructor(
    public authService: AuthService,
    private router: Router,
    private gameService: GameService,
    private chatService: ChatService
    )
  {}

  ngOnInit(): void {
		if (this.authService.isLoggedIn == true)
		this.router.navigate(['home']);
    this.gameService.socket.disconnect();
  }

  login() {
    this.authService.login().subscribe({
      next: (data) => {
        window.location.href = data.page;
      },
      error: error => {}
    });  //uncomment
  }

  logout()
  {
    this.authService.logout();
  }

  // fake users (delete after freeze)
  /*player1()
  {
      this.authService.player1 = true;     
      this.authService.player2 = false;     
      this.authService.player3 = false;  
      this.authService.player4 = false;
      this.router.navigate(['confirmation']);
  }

  player2()
  {
    this.authService.player1 = false;     
    this.authService.player2 = true;    
    this.authService.player3 = false;  
    this.authService.player4 = false;
    this.router.navigate(['confirmation']);
  }

  player3()
  {
      this.authService.player1 = false;     
      this.authService.player2 = false;   
      this.authService.player3 = true;  
      this.authService.player4 = false;
      this.router.navigate(['confirmation']);
  }

  player4()
  {
      this.authService.player1 = false;     
      this.authService.player2 = false;     
      this.authService.player3 = false;  
      this.authService.player4 = true;
      this.router.navigate(['confirmation']);
  }*/
  // till here
}
