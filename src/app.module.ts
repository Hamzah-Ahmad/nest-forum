import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';
import { UtilitiesModule } from './utilities/utilities.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    CoreModule,
    DatabaseModule,
    AuthModule,
    PostModule,
    UtilitiesModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
