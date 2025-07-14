import { RestaurantTable } from './restaurant-table.model';
import { Reservation } from './reservation.model';

export interface ReservationDetail {
  idReservationDetail?: number;
  numberPeople: number;
  reservationMethod: string;
  request: string;
  table: RestaurantTable;
  reservation: Reservation;
  state?: 'A' | 'I';
} 