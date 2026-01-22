import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsIn, MaxLength } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ enum: ['deposit', 'withdraw', 'adjust'] })
  @IsIn(['deposit', 'withdraw', 'adjust'])
  type: string;

  @ApiProperty({ example: 200 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: 1450.5 })
  @IsOptional()
  @IsNumber()
  exchangeRate?: number;

  @ApiPropertyOptional({ example: '공항에서 추가 환전' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  memo?: string;
}
