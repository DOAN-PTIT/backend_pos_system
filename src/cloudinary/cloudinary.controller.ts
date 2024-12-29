import { 
    Controller,
    Get,
    Req,
    Body,
    Post,
    Param,
    ParseIntPipe,
    UseInterceptors,
    UploadedFile,
    BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';

@Controller('cloudinary')
export class CloudinaryController {

    constructor (
        private cloudinaryService: CloudinaryService,
    ) {}
    
    @Post("upload-image")
    @UseInterceptors(FileInterceptor('image'))
    async uploadImage (
        @UploadedFile() image: Express.Multer.File
    ) {
        if (!image) {
            throw new BadRequestException('Image is required')
        }
        const result = await this.cloudinaryService.uploadImage(image)
        return result.url
    }

}
