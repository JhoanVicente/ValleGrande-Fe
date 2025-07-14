import { RestaurantUser } from './restaurant-user.model';
import { OrderStatusType } from './order-status-type.model';
import { PaymentType } from './payment-type.model';
import { ProductDetail } from './product-detail.model';

export interface SalesTicket {
    ticketId?: number;
    saleDate: Date;
    totalPayment: number;
    delivery: string;
    deliveryAddress?: string;
    note?: string;
    user: RestaurantUser;
    orderStatusType: OrderStatusType;
    paymentType: PaymentType;
    productDetails: ProductDetail[];
} 