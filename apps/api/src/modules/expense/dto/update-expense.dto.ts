import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsIn,
  MaxLength,
} from 'class-validator';

export class UpdateExpenseDto {
  @ApiPropertyOptional({ example: 25.5 })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ enum: ['food', 'transport', 'shopping', 'lodging', 'activity', 'etc'] })
  @IsOptional()
  @IsIn(['food', 'transport', 'shopping', 'lodging', 'activity', 'etc'])
  category?: string;

  @ApiPropertyOptional({ enum: ['card', 'cash', 'wallet'] })
  @IsOptional()
  @IsIn(['card', 'cash', 'wallet'])
  paymentMethod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  memo?: string;

  @ApiPropertyOptional({ example: '2025-01-20' })
  @IsOptional()
  @IsDateString()
  expenseDate?: string;

  @ApiPropertyOptional({ example: '14:30' })
  @IsOptional()
  @IsString()
  expenseTime?: string;
}
