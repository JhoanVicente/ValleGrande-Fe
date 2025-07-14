import { OrderStatusType } from './order-status-type.model';
import { RestaurantUser } from './restaurant-user.model';

export interface Reservation {
  reservationId?: number;
  reservationName: string;
  reservationDate: string; // ISO string para compatibilidad con Angular forms
  orderStatusType: OrderStatusType;
  restaurantUser: RestaurantUser;
} 