import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsIn,
  MaxLength,
} from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({ example: 25.5 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'EUR' })
  @IsString()
  @MaxLength(3)
  currency: string;

  @ApiProperty({ example: 1450.5 })
  @IsNumber()
  exchangeRate: number;

  @ApiProperty({ example: 36963 })
  @IsNumber()
  amountKRW: number;

  @ApiProperty({ enum: ['food', 'transport', 'shopping', 'lodging', 'activity', 'etc'] })
  @IsIn(['food', 'transport', 'shopping', 'lodging', 'activity', 'etc'])
  category: string;

  @ApiProperty({ enum: ['card', 'cash', 'wallet'] })
  @IsIn(['card', 'cash', 'wallet'])
  paymentMethod: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  destinationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  walletId?: string;

  @ApiPropertyOptional({ example: '에펠탑 근처 카페' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  memo?: string;

  @ApiProperty({ example: '2025-01-20' })
  @IsDateString()
  expenseDate: string;

  @ApiPropertyOptional({ example: '14:30' })
  @IsOptional()
  @IsString()
  expenseTime?: string;
}
