import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNumber, IsIn, MaxLength } from 'class-validator';

export class UpdateTripDto {
  @ApiPropertyOptional({ example: '유럽 배낭여행' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: '2025-01-15' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-01-28' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 3000000 })
  @IsOptional()
  @IsNumber()
  budget?: number;

  @ApiPropertyOptional({ enum: ['active', 'completed', 'cancelled'] })
  @IsOptional()
  @IsIn(['active', 'completed', 'cancelled'])
  status?: string;
}
