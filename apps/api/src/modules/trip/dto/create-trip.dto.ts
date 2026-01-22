import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsArray,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDestinationDto } from './create-destination.dto';

export class CreateTripDto {
  @ApiProperty({ example: '유럽 배낭여행' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: '2025-01-15' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: '2025-01-28' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 3000000 })
  @IsOptional()
  @IsNumber()
  budget?: number;

  @ApiPropertyOptional({ example: 'KRW' })
  @IsOptional()
  @IsString()
  budgetCurrency?: string;

  @ApiPropertyOptional({ type: [CreateDestinationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDestinationDto)
  destinations?: CreateDestinationDto[];
}
