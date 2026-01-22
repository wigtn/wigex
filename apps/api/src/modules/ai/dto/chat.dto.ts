import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class ChatDto {
  @ApiProperty({ example: '오늘 얼마 썼어?' })
  @IsString()
  @MaxLength(2000)
  message: string;

  @ApiPropertyOptional({ description: 'Trip ID for context' })
  @IsOptional()
  @IsString()
  tripId?: string;
}
