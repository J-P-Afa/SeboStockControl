import { IsString, IsUrl } from 'class-validator';

export class ImportBookCoverDto {
  @IsString()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  sourceUrl: string;
}
