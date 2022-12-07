import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MessageI, messagePaginateI } from 'src/app/chat/model/message.interface';
import { AuthService } from 'src/app/login/auth.service';
import { UserI } from 'src/app/user/user.interface';
import { ChatHelperService } from '../../services/chat-service/chat-helper.service';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})
export class ChatMessageComponent implements OnInit {

  @Input() messagesPaginate$: Observable<messagePaginateI>;
  user: BehaviorSubject<UserI>;

  constructor(private authService: AuthService, private chatHelperService: ChatHelperService) { }

  ngOnInit(): void {
    this.user = this.authService.user$;
  }

  convertTime(timestamp: Date): string | null {
    return this.chatHelperService.convertTime(timestamp);
  }

  isUserBlocked(targetUser: UserI) {
    if (targetUser && targetUser.id) {
      return (this.chatHelperService.getListOfBlock(this.user.value).has(targetUser.id))
    }
    return false;
  }
}
