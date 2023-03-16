import axiosInstance from "@app-utils/axios-instance";
import { IUpdateShoppingCart, IShoppingCartItem, IWishlistItem } from "@app-interfaces/shopping-cart.interface";
import { IProduct } from "@app-interfaces/product.interface";

const getWishlistDataUrl: string = "/ShoppingCart/getWishlistData";
const setOrUnsetWishlistProductUrl: string = "/ShoppingCart/setOrUnsetWishlistProduct?productId=";

const WishlistService = {
    getWishlistData: () => {
        return axiosInstance.get<IWishlistItem[]>(getWishlistDataUrl);
    },
    
    getWishlistProductData: (page: number, elementsPerPage: number) => {
        return axiosInstance.get<IProduct[]>(getWishlistDataUrl + '?asProducts=true&page=' + page + '&elementsPerPage=' + elementsPerPage);
    },

    setOrUnsetWishlistProduct: (productId: number) => {
        return axiosInstance.get<boolean>(setOrUnsetWishlistProductUrl + productId);
    },
};

export default WishlistService;