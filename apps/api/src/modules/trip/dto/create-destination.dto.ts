import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNumber, MaxLength } from 'class-validator';

export class CreateDestinationDto {
  @ApiProperty({ example: '프랑스' })
  @IsString()
  @MaxLength(100)
  country: string;

  @ApiPropertyOptional({ example: '파리' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiProperty({ example: 'EUR' })
  @IsString()
  @MaxLength(3)
  currency: string;

  @ApiPropertyOptional({ example: '2025-01-15' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-01-20' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  orderIndex?: number;
}
