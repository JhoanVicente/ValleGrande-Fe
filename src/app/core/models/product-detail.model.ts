import { Product } from './product.model';
import { SalesTicket } from './sales-ticket.model';

export interface ProductDetail {
    idProductDetail?: number;
    amount: number;
    unitPrice: number;
    subtotal: number;
    product: Product;
    salesTicket?: SalesTicket;
} 