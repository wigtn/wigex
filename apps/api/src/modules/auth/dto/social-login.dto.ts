import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SocialLoginDto {
  @ApiProperty({ description: 'ID Token from social provider' })
  @IsString()
  idToken: string;
}
