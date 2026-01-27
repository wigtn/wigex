import { apiClient } from './client';
import { Trip, Destination } from '../types';

// ============ Types ============

export interface CreateTripDto {
  name: string;
  startDate: string;
  endDate: string;
  budget?: number;
  destinations: CreateDestinationDto[];
}

export interface CreateDestinationDto {
  countryCode?: string;
  country: string;
  city?: string;
  currency: string;
  startDate?: string;
  endDate?: string;
  orderIndex?: number;
}

export interface UpdateTripDto {
  name?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  status?: 'active' | 'completed' | 'cancelled';
}

export interface TripResponse extends Trip {
  destinations: Destination[];
  _count?: { expenses: number };
}

// ============ API Functions ============

export const tripApi = {
  // Get all trips
  getAll: (status?: 'active' | 'completed' | 'cancelled') =>
    apiClient.get<TripResponse[]>('/trips', {
      params: status ? { status } : undefined,
    }),

  // Get single trip
  getById: (id: string) =>
    apiClient.get<TripResponse>(`/trips/${id}`),

  // Create trip with destinations
  create: (dto: CreateTripDto) =>
    apiClient.post<TripResponse>('/trips', dto),

  // Update trip
  update: (id: string, dto: UpdateTripDto) =>
    apiClient.patch<TripResponse>(`/trips/${id}`, dto),

  // Delete trip
  delete: (id: string) =>
    apiClient.delete(`/trips/${id}`),

  // Get destinations for a trip
  getDestinations: (tripId: string) =>
    apiClient.get<Destination[]>(`/trips/${tripId}/destinations`),

  // Add destination to trip
  addDestination: (tripId: string, dto: CreateDestinationDto) =>
    apiClient.post<Destination>(`/trips/${tripId}/destinations`, dto),

  // Remove destination
  removeDestination: (tripId: string, destinationId: string) =>
    apiClient.delete(`/trips/${tripId}/destinations/${destinationId}`),
};
