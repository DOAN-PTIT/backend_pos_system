import { Module } from '@nestjs/common';
import { SocialController } from './social.controller';
import { FacebookStrategy } from './strategy/facebook.strategy';
import { SocialService } from './social.service';

@Module({
  imports: [],
  controllers: [SocialController],
  providers: [FacebookStrategy, SocialService],
})
export class SocialModule {}
