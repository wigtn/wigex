import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@ApiTags('wallets')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('trips/:tripId/wallets')
  @ApiOperation({ summary: 'Get all wallets for a trip' })
  async findAll(@Request() req, @Param('tripId') tripId: string) {
    return this.walletService.findAll(req.user.id, tripId);
  }

  @Post('trips/:tripId/wallets')
  @ApiOperation({ summary: 'Create a new wallet' })
  async create(
    @Request() req,
    @Param('tripId') tripId: string,
    @Body() createWalletDto: CreateWalletDto,
  ) {
    return this.walletService.create(req.user.id, tripId, createWalletDto);
  }

  @Get('wallets/:id')
  @ApiOperation({ summary: 'Get wallet by ID with balance' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.walletService.findOne(req.user.id, id);
  }

  @Delete('wallets/:id')
  @ApiOperation({ summary: 'Delete wallet' })
  async remove(@Request() req, @Param('id') id: string) {
    return this.walletService.remove(req.user.id, id);
  }

  @Get('wallets/:id/transactions')
  @ApiOperation({ summary: 'Get wallet transactions' })
  async getTransactions(@Request() req, @Param('id') id: string) {
    return this.walletService.getTransactions(req.user.id, id);
  }

  @Post('wallets/:id/transactions')
  @ApiOperation({ summary: 'Add transaction to wallet' })
  async addTransaction(
    @Request() req,
    @Param('id') id: string,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.walletService.addTransaction(req.user.id, id, createTransactionDto);
  }
}
