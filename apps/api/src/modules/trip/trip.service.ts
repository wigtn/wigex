import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { CreateDestinationDto } from './dto/create-destination.dto';

@Injectable()
export class TripService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, status?: string) {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    return this.prisma.trip.findMany({
      where,
      include: {
        destinations: {
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: { expenses: true },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        destinations: {
          orderBy: { orderIndex: 'asc' },
        },
        wallets: true,
        _count: {
          select: { expenses: true },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return trip;
  }

  async create(userId: string, createTripDto: CreateTripDto) {
    const { destinations, startDate, endDate, ...tripData } = createTripDto;

    return this.prisma.trip.create({
      data: {
        ...tripData,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        userId,
        destinations: destinations
          ? {
              create: destinations.map((d, index) => ({
                ...d,
                orderIndex: d.orderIndex ?? index,
              })),
            }
          : undefined,
      },
      include: {
        destinations: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }

  async update(userId: string, id: string, updateTripDto: UpdateTripDto) {
    await this.findOne(userId, id); // Check ownership

    return this.prisma.trip.update({
      where: { id },
      data: updateTripDto,
      include: {
        destinations: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id); // Check ownership

    await this.prisma.trip.delete({
      where: { id },
    });

    return { success: true, message: 'Trip deleted' };
  }

  async findDestinations(userId: string, tripId: string) {
    await this.findOne(userId, tripId); // Check ownership

    return this.prisma.destination.findMany({
      where: { tripId },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async addDestination(
    userId: string,
    tripId: string,
    createDestinationDto: CreateDestinationDto,
  ) {
    await this.findOne(userId, tripId); // Check ownership

    // Get max orderIndex
    const maxOrder = await this.prisma.destination.aggregate({
      where: { tripId },
      _max: { orderIndex: true },
    });

    return this.prisma.destination.create({
      data: {
        ...createDestinationDto,
        tripId,
        orderIndex: createDestinationDto.orderIndex ?? (maxOrder._max.orderIndex ?? -1) + 1,
      },
    });
  }

  async removeDestination(userId: string, tripId: string, destinationId: string) {
    await this.findOne(userId, tripId); // Check ownership

    await this.prisma.destination.delete({
      where: { id: destinationId },
    });

    return { success: true, message: 'Destination removed' };
  }
}
