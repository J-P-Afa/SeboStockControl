import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateSaidaDto } from './create-saida.dto';

export class CreateSaidaBulkDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaidaDto)
  items: CreateSaidaDto[];
}
