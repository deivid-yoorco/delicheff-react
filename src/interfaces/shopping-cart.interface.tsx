export interface IUpdateShoppingCart {
    productId: number,
    buyingBySecondary: boolean,
    selectedPropertyOption?: string,
    newQuantity: number
};

export interface IShoppingCartItem {
    productId: number,
    buyingBySecondary: boolean,
    quantity: number,
    pictureUrl: string,
    selectedPropertyOption?: string,
};

export interface IWishlistItem {
    productId: number,
    productName: string,
    productSku: string,
    productSubtotal: number
};