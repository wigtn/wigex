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
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TripService } from './trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { CreateDestinationDto } from './dto/create-destination.dto';

@ApiTags('trips')
@Controller('trips')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Get()
  @ApiOperation({ summary: 'Get all trips for current user' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'completed', 'cancelled'] })
  async findAll(@Request() req, @Query('status') status?: string) {
    return this.tripService.findAll(req.user.id, status);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new trip' })
  async create(@Request() req, @Body() createTripDto: CreateTripDto) {
    return this.tripService.create(req.user.id, createTripDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trip by ID' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.tripService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update trip' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateTripDto: UpdateTripDto,
  ) {
    return this.tripService.update(req.user.id, id, updateTripDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete trip' })
  async remove(@Request() req, @Param('id') id: string) {
    return this.tripService.remove(req.user.id, id);
  }

  // Destinations
  @Get(':id/destinations')
  @ApiOperation({ summary: 'Get all destinations for a trip' })
  async findDestinations(@Request() req, @Param('id') id: string) {
    return this.tripService.findDestinations(req.user.id, id);
  }

  @Post(':id/destinations')
  @ApiOperation({ summary: 'Add destination to trip' })
  async addDestination(
    @Request() req,
    @Param('id') id: string,
    @Body() createDestinationDto: CreateDestinationDto,
  ) {
    return this.tripService.addDestination(req.user.id, id, createDestinationDto);
  }

  @Delete(':tripId/destinations/:destinationId')
  @ApiOperation({ summary: 'Remove destination from trip' })
  async removeDestination(
    @Request() req,
    @Param('tripId') tripId: string,
    @Param('destinationId') destinationId: string,
  ) {
    return this.tripService.removeDestination(req.user.id, tripId, destinationId);
  }
}
