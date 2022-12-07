import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { CustomSocket } from '../chat/sockets/custom-socket';
import { UserI } from './user.interface';

@Injectable({
	providedIn: 'root'
})
export class UserService {

	constructor(private http: HttpClient, private snackbar: MatSnackBar) { }

	updateUser(user: BehaviorSubject<UserI>): Observable<any> {
		//console.log("user updated")
		const httpOptions = {
			headers: new HttpHeaders({ 'Content-Type': 'application/json' })
		};
		return this.http.post<any>('http://localhost:3000/user/update', {
			payload: user, httpOptions
		})
	}

	findByUsername(username: string): Observable<UserI[]> {
		return this.http.get<UserI[]>(`http://localhost:3000/user/find-by-username?username=${username}`);
	}

}
