import { 
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Query
} from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {

    constructor (
        private readonly productService: ProductService
    ) {}

    @Get('is-code-existed')
    async checkProductCodeExited (
        @Query() query: { shop_id: number, product_code: string }
    ) {
        return await this.productService.isProductCodeExisted(query.shop_id, query.product_code);
    }

    @Get('is-variation-code-existed')
    async checkVariationCodeExited (
        @Query() query: { product_id: number, variation_code: string }
    ) {
        return await this.productService.isVariationCodeExisted(query.product_id, query.variation_code);
    }

}
