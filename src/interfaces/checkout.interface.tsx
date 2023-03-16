export interface IShippingDate {
    date: Date,
    shippingTime: string,
    isActive: boolean,
    disabled: boolean
};

export interface IPaymentMethod {
    paymentMethodSystemName: string,
    name: string,
    description: string,
    fee: string,
    selected: boolean,
    logoUrl: string,
    successNote: string,
    savedCard?: ISavedCard
};

export interface ISavedCard {
    cardOwnerName: string,
    brand: string,
    lastFourDigits: string,
    cardLogoUrl?: string,
    serviceCustomerId: string,
    billAddress1: string,
    billAdministrativeArea: string,
    billCountry: string,
    billEmail: string,
    billFirstName: string,
    billLastName: string,
    billLocality: string,
    billPhoneNumber: string,
    billPostalCode: string,
    customerEnteredSecurityCode?: string,
    selectedShippingAddressId?: number,
    deviceFingerprintSessionId?: string
};

export interface IOrderTotal {
    orderTotal: number,
    orderTotalDiscount: number,
    orderItemsDiscount: number,
    shipping: number,
    subTotal: number,
    shoppingCartItemIds: number[]
};

export interface IPlaceOrder {
    selectedPaymentMethodSystemName: string,
    selectedShippingDate: string,
    selectedShippingTime: string,
    addressId: number,
    paymentResult?: string,
    shoppingCartItemIds: number[]
};

export interface IDiscount {
    name: string,
    discountId: number,
    resultMessage: string,
    couponCode: string
};

export interface IStripePayment {
    userId: number,
    stripeCustomerId: string
};

export interface IMercadopagoPaymentData {
    preferenceId: string,
    publicKey: string
};

export interface ICustomerBalance {
    currentBalance: number,
    balanceIsActive: boolean,
    orderUsableBalance: number
};