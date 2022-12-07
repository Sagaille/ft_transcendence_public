import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

// ref: https://notiz.dev/blog/send-emails-with-nestjs
// https://medium.com/swlh/how-to-develop-two-factor-email-authentication-using-nodejs-postgresql-and-nodemailer-7a29c3fa6472

@Injectable()
export class TwoFactorService
{
	constructor(
	private mailerService: MailerService,
	) { }

	async sendEmail(email: string, JWT: string)
	{
		const url = `http://localhost:4200/user/edit/two_factor/confirm?email=${email}&jwtoken=${JWT}`;

		/*console.log("url = ");
		console.log(url);*/
		await this.mailerService.sendMail({
		to: email,
		subject: 'Welcome to Transcendence! Click the link to be redirected',
		template: 'confirm', // `.hbs` extension is appended automatically
		context: { // ✏️ filling curly brackets with content
			name: email,
			url,
		},
		});
	}
}

