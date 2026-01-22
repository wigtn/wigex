import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);
  private readonly cacheTimeout = 60 * 60 * 1000; // 1 hour

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getRates() {
    // Check cache first
    const cached = await this.prisma.exchangeRate.findFirst({
      orderBy: { fetchedAt: 'desc' },
    });

    if (
      cached &&
      new Date().getTime() - cached.fetchedAt.getTime() < this.cacheTimeout
    ) {
      return {
        base: cached.baseCurrency,
        rates: cached.rates,
        lastUpdated: cached.fetchedAt.toISOString(),
      };
    }

    // Fetch fresh rates
    try {
      const apiUrl = this.configService.get<string>('exchangeRate.apiUrl');
      const response = await firstValueFrom(
        this.httpService.get(`${apiUrl}/KRW`),
      );

      const rates = response.data.rates;

      // Save to cache
      await this.prisma.exchangeRate.create({
        data: {
          baseCurrency: 'KRW',
          rates,
          source: 'exchangerate-api.com',
        },
      });

      // Clean old cache entries (keep last 10)
      const oldEntries = await this.prisma.exchangeRate.findMany({
        orderBy: { fetchedAt: 'desc' },
        skip: 10,
      });

      if (oldEntries.length > 0) {
        await this.prisma.exchangeRate.deleteMany({
          where: {
            id: { in: oldEntries.map((e) => e.id) },
          },
        });
      }

      return {
        base: 'KRW',
        rates,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to fetch exchange rates:', error);

      // Return cached data if available
      if (cached) {
        return {
          base: cached.baseCurrency,
          rates: cached.rates,
          lastUpdated: cached.fetchedAt.toISOString(),
          stale: true,
        };
      }

      // Return default rates as last resort
      return {
        base: 'KRW',
        rates: this.getDefaultRates(),
        lastUpdated: new Date().toISOString(),
        default: true,
      };
    }
  }

  async convert(from: string, to: string, amount: number) {
    const { rates } = await this.getRates();

    // Rates are based on KRW, so we need to convert
    const fromRate = from === 'KRW' ? 1 : (rates as any)[from];
    const toRate = to === 'KRW' ? 1 : (rates as any)[to];

    if (!fromRate || !toRate) {
      throw new Error(`Unsupported currency: ${!fromRate ? from : to}`);
    }

    // Convert to KRW first, then to target currency
    const krwAmount = from === 'KRW' ? amount : amount / fromRate;
    const result = to === 'KRW' ? krwAmount : krwAmount * toRate;

    return {
      from,
      to,
      amount,
      result: Math.round(result * 100) / 100,
      rate: toRate / fromRate,
    };
  }

  private getDefaultRates() {
    // Default rates (1 KRW = X foreign currency)
    return {
      USD: 0.00074,
      EUR: 0.00068,
      JPY: 0.11,
      GBP: 0.00058,
      CNY: 0.0053,
      THB: 0.026,
      VND: 18.5,
      TWD: 0.023,
      PHP: 0.041,
      SGD: 0.001,
      AUD: 0.0011,
      CAD: 0.001,
      CHF: 0.00065,
      CZK: 0.017,
      HKD: 0.0058,
      MYR: 0.0033,
      NZD: 0.0012,
      IDR: 11.8,
    };
  }
}
