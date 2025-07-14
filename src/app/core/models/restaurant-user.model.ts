import { UserType } from './user-type.model';

export interface RestaurantUser {
  userId?: number;
  userName: string;
  password: string;
  names: string;
  surnames: string;
  dateOfBirth: string;
  address: string;
  telephone: string;
  email: string;
  documentType: string;
  numberType: string;
  state: string; // 'A' o 'I'
  userType: UserType;
}