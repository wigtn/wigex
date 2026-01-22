import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { AuthenticatedRequest } from '../../common/interfaces/request.interface';

@ApiTags('wallets')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('trips/:tripId/wallets')
  @ApiOperation({ summary: 'Get all wallets for a trip' })
  async findAll(@Req() req: AuthenticatedRequest, @Param('tripId') tripId: string) {
    return this.walletService.findAll(req.user.id, tripId);
  }

  @Post('trips/:tripId/wallets')
  @ApiOperation({ summary: 'Create a new wallet' })
  async create(
    @Req() req: AuthenticatedRequest,
    @Param('tripId') tripId: string,
    @Body() createWalletDto: CreateWalletDto,
  ) {
    return this.walletService.create(req.user.id, tripId, createWalletDto);
  }

  @Get('wallets/:id')
  @ApiOperation({ summary: 'Get wallet by ID with balance' })
  async findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.walletService.findOne(req.user.id, id);
  }

  @Delete('wallets/:id')
  @ApiOperation({ summary: 'Delete wallet' })
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.walletService.remove(req.user.id, id);
  }

  @Get('wallets/:id/transactions')
  @ApiOperation({ summary: 'Get wallet transactions' })
  async getTransactions(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.walletService.getTransactions(req.user.id, id);
  }

  @Post('wallets/:id/transactions')
  @ApiOperation({ summary: 'Add transaction to wallet' })
  async addTransaction(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.walletService.addTransaction(req.user.id, id, createTransactionDto);
  }
}
