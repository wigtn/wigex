import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, tripId: string) {
    // Verify trip ownership
    const trip = await this.prisma.trip.findFirst({
      where: { id: tripId, userId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const wallets = await this.prisma.wallet.findMany({
      where: { tripId, userId },
      include: {
        transactions: true,
      },
    });

    // Calculate balance for each wallet
    return wallets.map((wallet) => ({
      ...wallet,
      balance: wallet.transactions.reduce(
        (sum, t) => sum + Number(t.amount),
        0,
      ),
      totalDeposit: wallet.transactions
        .filter((t) => t.type === 'deposit')
        .reduce((sum, t) => sum + Number(t.amount), 0),
      totalWithdraw: wallet.transactions
        .filter((t) => t.type === 'withdraw')
        .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0),
    }));
  }

  async findOne(userId: string, id: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const balance = wallet.transactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0,
    );

    const totalDeposit = wallet.transactions
      .filter((t) => t.type === 'deposit')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalWithdraw = wallet.transactions
      .filter((t) => t.type === 'withdraw')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

    return {
      ...wallet,
      balance,
      totalDeposit,
      totalWithdraw,
    };
  }

  async create(userId: string, tripId: string, createWalletDto: CreateWalletDto) {
    // Verify trip ownership
    const trip = await this.prisma.trip.findFirst({
      where: { id: tripId, userId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const wallet = await this.prisma.wallet.create({
      data: {
        tripId,
        userId,
        currency: createWalletDto.currency,
        name: createWalletDto.name,
      },
    });

    // Create initial deposit if provided
    if (createWalletDto.initialDeposit && createWalletDto.initialDeposit > 0) {
      await this.prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'deposit',
          amount: createWalletDto.initialDeposit,
          exchangeRate: createWalletDto.exchangeRate,
          amountKRW: createWalletDto.exchangeRate
            ? createWalletDto.initialDeposit * createWalletDto.exchangeRate
            : null,
          memo: '초기 환전',
        },
      });
    }

    return this.findOne(userId, wallet.id);
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id); // Check ownership

    await this.prisma.wallet.delete({
      where: { id },
    });

    return { success: true, message: 'Wallet deleted' };
  }

  async getTransactions(userId: string, walletId: string) {
    await this.findOne(userId, walletId); // Check ownership

    return this.prisma.walletTransaction.findMany({
      where: { walletId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addTransaction(
    userId: string,
    walletId: string,
    createTransactionDto: CreateTransactionDto,
  ) {
    await this.findOne(userId, walletId); // Check ownership

    // For withdraw, make amount negative
    let amount = createTransactionDto.amount;
    if (createTransactionDto.type === 'withdraw') {
      amount = -Math.abs(amount);
    }

    await this.prisma.walletTransaction.create({
      data: {
        walletId,
        type: createTransactionDto.type,
        amount,
        exchangeRate: createTransactionDto.exchangeRate,
        amountKRW: createTransactionDto.exchangeRate
          ? Math.abs(amount) * createTransactionDto.exchangeRate
          : null,
        memo: createTransactionDto.memo,
      },
    });

    return this.findOne(userId, walletId);
  }
}
