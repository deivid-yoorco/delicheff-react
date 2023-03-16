import axiosInstance from "@app-utils/axios-instance";
import { IUpdateShoppingCart, IShoppingCartItem } from "@app-interfaces/shopping-cart.interface";
import { IProduct } from "@app-interfaces/product.interface";

const getShoppingCartDataUrl: string = "/ShoppingCart/getShoppingCartData";
const addProductToCartUrl: string = "/ShoppingCart/AddProductToCart";
const updateShoppingCartUrl: string = "/ShoppingCart/UpdateShoppingCartItems";
const getUserShoppingCartUrl: string = "/ShoppingCart/GetLoggedUserCart";
const getExtraCartProductsUrl: string = "/ShoppingCart/getExtraCartProducts";
const deleteShopingCartUrl: string = "/ShoppingCart/deleteShopingCart";
const getCrossSellingProductsUrl: string = "/ShoppingCart/getCrossSellingProducts";
const getMinOrderAmountErrorMessageUrl: string = "/App/getMinOrderAmountErrorMessage";

const ShoppingCartService = {
    getShoppingCartData: () => {
        return axiosInstance.get<IShoppingCartItem[]>(getShoppingCartDataUrl);
    },

    addProductToCart: (body: IUpdateShoppingCart) => {
        return axiosInstance.post(addProductToCartUrl, body);
    },

    updateShoppingCart: (body: IUpdateShoppingCart[]) => {
        return axiosInstance.post(updateShoppingCartUrl, body);
    },

    getUserShoppingCart: () => {
        return axiosInstance.get<IProduct[]>(getUserShoppingCartUrl);
    },

    getExtraCartProducts: () => {
        return axiosInstance.get<IProduct[]>(getExtraCartProductsUrl);
    },

    getCrossSellingProducts: () => {
        return axiosInstance.get<IProduct[]>(getCrossSellingProductsUrl);
    },

    getMinOrderAmountErrorMessage: () => {
        return axiosInstance.get<string>(getMinOrderAmountErrorMessageUrl);
    },

    deleteShopingCart: () => {
        return axiosInstance.put(deleteShopingCartUrl);
    },

    prepareUpdateShoppingCart: (updatedProducts: IProduct[]): IUpdateShoppingCart[] => {
        return updatedProducts.map(updatedProduct => {
            return {
                productId: updatedProduct.id,
                buyingBySecondary: updatedProduct.buyingBySecondary,
                selectedPropertyOption: !updatedProduct.selectedPropertyOption && updatedProduct.propertyOptions?.length > 0 ? updatedProduct.propertyOptions[0] : updatedProduct.selectedPropertyOption,
                newQuantity: updatedProduct.currentCartQuantity
            }
        });
    }
};

export default ShoppingCartService;