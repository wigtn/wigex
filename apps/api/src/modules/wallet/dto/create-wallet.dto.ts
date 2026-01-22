import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, MaxLength } from 'class-validator';

export class CreateWalletDto {
  @ApiProperty({ example: 'EUR' })
  @IsString()
  @MaxLength(3)
  currency: string;

  @ApiPropertyOptional({ example: '유로 현금' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 500, description: 'Initial deposit amount' })
  @IsOptional()
  @IsNumber()
  initialDeposit?: number;

  @ApiPropertyOptional({ example: 1450.5, description: 'Exchange rate for initial deposit' })
  @IsOptional()
  @IsNumber()
  exchangeRate?: number;
}
