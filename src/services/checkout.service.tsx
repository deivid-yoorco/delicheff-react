import axiosInstance from "@app-utils/axios-instance";
import { IShippingDate, IPaymentMethod, IOrderTotal, IPlaceOrder, ISavedCard, IDiscount, IStripePayment, IMercadopagoPaymentData, ICustomerBalance } from "@app-interfaces/checkout.interface";

const getAvailableDaysUrl: string = "/App/GetAvailableDaysByCp?postalCode=";
const getPaymentMethodsUrl: string = "/Checkout/GetPaymentMethods";
const getOrderTotalsUrl: string = "/Checkout/getOrderTotals";
const placeOrderUrl: string = "/Checkout/placeOrder";
const getPaypalTokenUrl: string = "/PaymentPaypalMobile/GetPaypalToken";
const saveStripeCardUrl: string = "/Checkout/saveStripeCard";
const applyDiscountCouponUrl: string = "/Checkout/applyDiscountCoupon?discountcouponcode=";
const getAppliedDiscountUrl: string = "/Checkout/getAppliedDiscount";
const getCustomerBalanceUrl: string = "/Checkout/getCustomerBalance";
const setBalanceActiveUrl: string = "/Checkout/setBalanceActive?isActive=";
const removeCouponUrl: string = "/Checkout/removeCoupon?discountId=";
const deleteStripeCardUrl: string = "/Checkout/deleteStripeCard";
const processStripePaymentUrl: string = "/MobilePayment/processStripePayment";
const createStripeCustomerUrl: string = "/MobilePayment/createStripeCustomer?token=";
const getStripeKeyUrl: string = "/MobilePayment/getStripeKey";
const getMercadopagoPreferenceUrl: string = "/paymentMercadoPago/getPreference?userId=";
const getOrderMinimumPedidoCheckUrl: string = "/App/GetOrderMinimumPedidoCheck?date="
const applyGiftProductUrl: string = "/Checkout/applyGiftProduct"

const CheckoutService = {
    getAvailableDays: (postalCode: string) => {
        return axiosInstance.get<IShippingDate[]>(getAvailableDaysUrl + postalCode);
    },

    getPaymentMethods: () => {
        return axiosInstance.get<IPaymentMethod[]>(getPaymentMethodsUrl);
    },

    getOrderTotals: () => {
        return axiosInstance.get<IOrderTotal>(getOrderTotalsUrl);
    },

    placeOrder: (body: IPlaceOrder) => {
        return axiosInstance.post<number>(placeOrderUrl, body);
    },

    getPaypalToken: () => {
        return axiosInstance.get<string>(getPaypalTokenUrl);
    },

    createStripeCustomer: (token: string, userId: string) => {
        return axiosInstance.post<string>(createStripeCustomerUrl + token + '&userId=' + userId);
    },

    getStripeKey: () => {
        return axiosInstance.get<string>(getStripeKeyUrl);
    },

    saveStripeCard: (body: ISavedCard) => {
        return axiosInstance.post<ISavedCard>(saveStripeCardUrl, body);
    },

    deleteStripeCard: () => {
        return axiosInstance.delete(deleteStripeCardUrl);
    },

    processStripePayment: (body: IStripePayment) => {
        return axiosInstance.post<string>(processStripePaymentUrl, body);
    },

    applyDiscountCoupon: (couponCode: string) => {
        return axiosInstance.post<IDiscount>(applyDiscountCouponUrl + couponCode);
    },

    getAppliedDiscounts: () => {
        return axiosInstance.get<IDiscount[]>(getAppliedDiscountUrl);
    },

    getCustomerBalance: () => {
        return axiosInstance.get<ICustomerBalance>(getCustomerBalanceUrl);
    },
    
    setBalanceActive: (isActive: boolean) => {
        return axiosInstance.get<boolean>(setBalanceActiveUrl + isActive);
    },

    removeCoupon: (discountId: number) => {
        return axiosInstance.delete(removeCouponUrl + discountId);
    },

    getMercadopagoPreference: (userId: number) => {
        return axiosInstance.get<IMercadopagoPaymentData>(getMercadopagoPreferenceUrl + userId);
    },

    getOrderMinimumPedidoCheck: (date: Date) => {
        return axiosInstance.get<string>(getOrderMinimumPedidoCheckUrl + date.toString().split('T')[0]);
    },

    applyGiftProduct: () => {
        return axiosInstance.get(applyGiftProductUrl);
    }
};

export default CheckoutService;