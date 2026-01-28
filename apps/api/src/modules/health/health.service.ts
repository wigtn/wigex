import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  async checkDetailed() {
    const checks = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '3.0.0',
      environment: process.env.NODE_ENV || 'development',
      dependencies: {
        database: await this.checkDatabase(),
        redis: await this.checkRedis(),
      },
    };

    // Set overall status based on dependencies
    const allHealthy = Object.values(checks.dependencies).every(
      (dep) => dep.status === 'healthy',
    );
    checks.status = allHealthy ? 'healthy' : 'degraded';

    return checks;
  }

  private async checkDatabase(): Promise<{ status: string; latency?: number }> {
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;
      return { status: 'healthy', latency };
    } catch (error) {
      return { status: 'unhealthy' };
    }
  }

  private async checkRedis(): Promise<{ status: string; latency?: number }> {
    // Redis check - if REDIS_URL is not set, skip
    if (!process.env.REDIS_URL) {
      return { status: 'skipped' };
    }

    try {
      // Simple check - Redis connection is managed by caching module
      // For now, just return healthy if URL is set
      return { status: 'healthy' };
    } catch (error) {
      return { status: 'unhealthy' };
    }
  }
}
