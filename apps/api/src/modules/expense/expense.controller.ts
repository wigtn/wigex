import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { AuthenticatedRequest } from '../../common/interfaces/request.interface';

@ApiTags('expenses')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get('trips/:tripId/expenses')
  @ApiOperation({ summary: 'Get all expenses for a trip' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Param('tripId') tripId: string,
    @Query('category') category?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.expenseService.findAll(req.user.id, tripId, {
      category,
      startDate,
      endDate,
    });
  }

  @Post('trips/:tripId/expenses')
  @ApiOperation({ summary: 'Create a new expense' })
  async create(
    @Req() req: AuthenticatedRequest,
    @Param('tripId') tripId: string,
    @Body() createExpenseDto: CreateExpenseDto,
  ) {
    return this.expenseService.create(req.user.id, tripId, createExpenseDto);
  }

  @Get('trips/:tripId/expenses/stats')
  @ApiOperation({ summary: 'Get expense statistics for a trip' })
  async getStats(@Req() req: AuthenticatedRequest, @Param('tripId') tripId: string) {
    return this.expenseService.getStats(req.user.id, tripId);
  }

  @Get('expenses/:id')
  @ApiOperation({ summary: 'Get expense by ID' })
  async findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.expenseService.findOne(req.user.id, id);
  }

  @Patch('expenses/:id')
  @ApiOperation({ summary: 'Update expense' })
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expenseService.update(req.user.id, id, updateExpenseDto);
  }

  @Delete('expenses/:id')
  @ApiOperation({ summary: 'Delete expense' })
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.expenseService.remove(req.user.id, id);
  }
}
