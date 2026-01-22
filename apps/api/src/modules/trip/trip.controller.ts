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
import { TripService } from './trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { AuthenticatedRequest } from '../../common/interfaces/request.interface';

@ApiTags('trips')
@Controller('trips')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Get()
  @ApiOperation({ summary: 'Get all trips for current user' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'completed', 'cancelled'] })
  async findAll(@Req() req: AuthenticatedRequest, @Query('status') status?: string) {
    return this.tripService.findAll(req.user.id, status);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new trip' })
  async create(@Req() req: AuthenticatedRequest, @Body() createTripDto: CreateTripDto) {
    return this.tripService.create(req.user.id, createTripDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trip by ID' })
  async findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.tripService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update trip' })
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateTripDto: UpdateTripDto,
  ) {
    return this.tripService.update(req.user.id, id, updateTripDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete trip' })
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.tripService.remove(req.user.id, id);
  }

  // Destinations
  @Get(':id/destinations')
  @ApiOperation({ summary: 'Get all destinations for a trip' })
  async findDestinations(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.tripService.findDestinations(req.user.id, id);
  }

  @Post(':id/destinations')
  @ApiOperation({ summary: 'Add destination to trip' })
  async addDestination(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() createDestinationDto: CreateDestinationDto,
  ) {
    return this.tripService.addDestination(req.user.id, id, createDestinationDto);
  }

  @Delete(':tripId/destinations/:destinationId')
  @ApiOperation({ summary: 'Remove destination from trip' })
  async removeDestination(
    @Req() req: AuthenticatedRequest,
    @Param('tripId') tripId: string,
    @Param('destinationId') destinationId: string,
  ) {
    return this.tripService.removeDestination(req.user.id, tripId, destinationId);
  }
}
