export interface IProduct {
    id: number,
    pictureUrl: string,
    name: string,
    shortDescription: string,
    price: number,
    oldPrice: number,
    weightInterval: number,
    equivalenceCoefficient: number,
    currentCartQuantity: number,
    buyingBySecondary: boolean,
    selectedPropertyOption?: string,
    propertyOptions: string[],
    cartItemId: number,
    discount: number,
    itemDiscount: number,
    sku: string,
    subTotal: number,
    unitPrice: number,
    isExtraCartProduct: boolean,
    warnings: string[],
    isInWishlist: boolean,
    giftProductEnable: boolean,
    stock: number
};