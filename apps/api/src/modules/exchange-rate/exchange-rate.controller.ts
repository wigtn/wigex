import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

import { ExchangeRateService } from './exchange-rate.service';

@ApiTags('exchange-rates')
@Controller('exchange-rates')
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Get()
  @ApiOperation({ summary: 'Get current exchange rates (base: KRW)' })
  async getRates() {
    return this.exchangeRateService.getRates();
  }

  @Get('convert')
  @ApiOperation({ summary: 'Convert currency' })
  @ApiQuery({ name: 'from', example: 'EUR' })
  @ApiQuery({ name: 'to', example: 'KRW' })
  @ApiQuery({ name: 'amount', example: 100 })
  async convert(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('amount') amount: number,
  ) {
    return this.exchangeRateService.convert(from, to, amount);
  }
}
