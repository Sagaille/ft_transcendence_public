import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserI } from 'src/app/user/user.interface';
import { ChatService } from '../../services/chat-service/chat.service';


function conditionalRequired(type: string) {
  return type == "protected" ? Validators.required : Validators.nullValidator;
}

@Component({
  selector: 'app-create-room',
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.scss']
})
export class CreateRoomComponent implements OnInit {

  chatroomTypes: string[] = ["public", "protected", "private"];
  hide = true;
  public form: FormGroup;
  constructor(private fb: FormBuilder, private chatService: ChatService, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.form = this.fb.group({
      type: new FormControl(null, [Validators.required]),
      name: new FormControl(null, [Validators.required, Validators.maxLength(30)]),
      description: new FormControl(null, [Validators.maxLength(240)]),
      password: [''],
      users: new FormArray([], [])
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

      // add users required for private chats (since users can't be added after)
      if (type && type.value === 'private') {
        // new FormArray([], [Validators.required]
        this.form.get('users')?.setValidators([Validators.required]);
        this.form.get('users')?.updateValueAndValidity();
      } else {
        this.form.get('users')?.clearValidators();         // Clear All Validators
        this.form.get('users')?.updateValueAndValidity();
      }
    });
  }

  create() {
    if (this.form.valid) {
      this.chatService.createRoom(this.form.getRawValue());
      this.router.navigate(['../dashboard'], {relativeTo: this.activatedRoute}); 
    }
  }

  initUser(user: UserI) {
    return new FormControl({
      id: user.id,
      username: user.username,
    })
  } 

  addUser(userFormControl: FormControl) {
    this.users.push(userFormControl);
  }

  removeUser(user: UserI) {
    this.users.removeAt(this.users.value.findIndex( (u: UserI) => u.id == user.id) );
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

  get users(): FormArray {
    return this.form.get('users') as FormArray;
  }

  get password(): FormArray {
    return this.form.get('password') as FormArray;
  }
}
