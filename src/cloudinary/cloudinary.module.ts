import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryConfig } from './cloudinary.config';
import { CloudinaryController } from './cloudinary.controller';

@Module({
  providers: [CloudinaryService, CloudinaryConfig],
  exports: [CloudinaryService, CloudinaryConfig],
  controllers: [CloudinaryController]
})
export class CloudinaryModule {}
