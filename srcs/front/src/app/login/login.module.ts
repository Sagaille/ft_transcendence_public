import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HttpClientModule, HttpClient} from '@angular/common/http';
import { LoginComponent } from './login.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  declarations: [ConfirmationComponent],
  imports: [
    CommonModule,
  ]
})
export class LoginModule { }
