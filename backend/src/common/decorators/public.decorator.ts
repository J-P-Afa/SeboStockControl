import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * @ai-context Marks an endpoint as publicly accessible, bypassing JWT authentication.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
