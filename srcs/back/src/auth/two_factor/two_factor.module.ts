import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { TwoFactorService } from './two_factor.service';
import { ConfigService } from '@nestjs/config';

@Module({
	imports: [
    MailerModule.forRootAsync({
	useFactory: async (config: ConfigService) => ({
      transport: {
        host: 'smtp-mail.outlook.com',
		port: 587,
        secure: false,
        auth: {
          user: config.get('SMTP_EMAIL'),
          pass: config.get('SMTP_SECRET'),
        },
      },
      defaults: {
        from: `"No Reply" <${config.get('SMTP_EMAIL')}>`,
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
        options: {
          strict: false,
        },
      },
    }),
		inject: [ConfigService],
    }),
  ],
  providers: [TwoFactorService],
  exports: [TwoFactorService], // 👈 export for DI
})
export class TwoFactorModule {}
