import { IProduct } from "./product.interface";
import { IUserAddress } from "./address.interface";

export interface IUserOrder {
    id: number,
    orderNumber: string, 
    orderTotal: number,
    orderStatus: string,
    isCancelled: boolean,
    shippingStatus: string, 
    paymentStatus: string, 
    shippingAddress: IUserAddress,
    creationDate: Date, 
    selectedShippingDate: Date,
    selectedShippingTime: string,
    orderSubtotal: number,
    orderShipping: number,
    orderItems: IProduct[] 
};