import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class AnalyzeReceiptDto {
  @ApiProperty({ description: 'Base64 encoded image' })
  @IsString()
  image: string;

  @ApiProperty({ example: 'image/jpeg', description: 'Image MIME type' })
  @IsString()
  mimeType: string;

  @ApiPropertyOptional({ description: 'Trip ID for auto expense creation' })
  @IsOptional()
  @IsString()
  tripId?: string;

  @ApiPropertyOptional({ description: 'Destination ID' })
  @IsOptional()
  @IsString()
  destinationId?: string;
}
