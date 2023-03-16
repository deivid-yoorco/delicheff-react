import axiosInstance from "@app-utils/axios-instance";
import { IUserOrder } from "@app-interfaces/order.interface";
import { IProduct } from "@app-interfaces/product.interface";

const getUserOrdersUrl: string = '/Order/GetCustomerOrders?page=';
const getNotDeliveredProductsUrl: string = '/App/GetNotDeliveredProducts?orderId=';
const reOrderUrl: string = '/Order/ReOrder?orderId=';

const OrderService = {
    getUserOrders: (page: number, elementsPerPage: number) => {
        return axiosInstance.get<IUserOrder[]>(getUserOrdersUrl + page + '&elementsPerPage=' + elementsPerPage);
    },

    getNotDeliveredProducts: (orderId: number) => {
        return axiosInstance.get<IProduct[]>(getNotDeliveredProductsUrl + orderId);
    },

    reOrder: (orderId: number) => {
        return axiosInstance.get(reOrderUrl + orderId);
    },    
};

export default OrderService;