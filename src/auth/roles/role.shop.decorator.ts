import { SetMetadata } from '@nestjs/common';
import { RoleShop } from './role.shop.enum';

export const ROLES_SHOP_KEY = 'rolesShop';
export const RolesShop = (...roles: RoleShop[]) => SetMetadata(ROLES_SHOP_KEY, roles);
