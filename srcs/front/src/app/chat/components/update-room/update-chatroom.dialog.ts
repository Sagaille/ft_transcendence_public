import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/login/auth.service';
import { UserI } from 'src/app/user/user.interface';
import { RoomI } from '../../model/room.interface';
import { ChatService } from '../../services/chat-service/chat.service';

@Component({
  selector: 'update-chatroom-dialog',
  templateUrl: 'update-chatroom-dialog.html',
  styleUrls: ['./update-room.component.scss']

})
export class UpdateChatroomDialog implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<UpdateChatroomDialog>,
    @Inject(MAT_DIALOG_DATA) public room: RoomI,
    private fb: FormBuilder,
    private chatService: ChatService,
    private authService: AuthService,
  ) { }

  user: BehaviorSubject<UserI>;
  chatroomTypes: string[] = ["public", "protected", "private"];
  hide = true;
  public form: FormGroup;

  ngOnInit() {
    this.user = this.authService.user$;
    this.form = this.fb.group({
      type: new FormControl(this.room.type, [Validators.required]),
      name: new FormControl(this.room.name, [Validators.required, Validators.maxLength(30)]),
      description: new FormControl(null),
      password: [''],
    });

    this.form.get('type')!.valueChanges
      .subscribe(value => {
        let type = this.form.get('type');
        if (type && type.value === 'protected') {
          this.form.get('password')?.setValidators([Validators.required, Validators.minLength(4)]);
          this.form.get('password')?.updateValueAndValidity();
        } else {
          this.form.get('password')?.clearValidators();         // Clear All Validators
          this.form.get('password')?.updateValueAndValidity();
        }
      });
  }

  onSubmit(form: FormGroup) {
    if (form.valid && this.user && this.user.value && this.user.value.id) {
      this.room.type = this.type.value;
      this.room.name = this.name.value;
      this.room.description = this.description.value;
      this.room.password = this.password.value;
      this.chatService.updateChatRoom(this.room, this.user.value.id);
      this.dialogRef.close();
    } else {
      console.log("Error in the form, update was not called.")
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  get type(): FormControl {
    return this.form.get('type') as FormControl;
  }

  get name(): FormControl {
    return this.form.get('name') as FormControl;
  }

  get description(): FormControl {
    return this.form.get('description') as FormControl;
  }

  get password(): FormArray {
    return this.form.get('password') as FormArray;
  }
}
