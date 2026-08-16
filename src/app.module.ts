import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma.module';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { AlumniModule } from './alumni/alumni.module';
import { BlogsModule } from './blogs/blogs.module';
import { AdminModule } from './admin/admin.module';
import { CategoriesModule } from './categories/categories.module';
import { UsersModule } from './users/users.module';
import { ContactModule } from './contact/contact.module';
import { ResearchersModule } from './researchers/researchers.module';
import { MembershipModule } from './membership/membership.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    AuthModule,
    AlumniModule,
    BlogsModule,
    AdminModule,
    CategoriesModule,
    UsersModule,
    ContactModule,
    ResearchersModule,
    MembershipModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
