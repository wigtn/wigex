import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: '홍길동' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}
