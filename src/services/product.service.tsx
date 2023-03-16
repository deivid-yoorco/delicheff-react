import axiosInstance from '@app-utils/axios-instance';
import {IProduct} from '@app-interfaces/product.interface';
import {ICategory} from '@app-interfaces/category.interface';
import {ISelectListItem} from '@app-interfaces/common.interface';

const searchProductsUrl: string = '/Search/searchProducts?searchTerm=';
const getProductUrl: string = '/Product/getProduct?id=';
const searchCategoriesUrl: string = '/Search/SearchCategories?searchTerm=';
const searchProductsWithPageUrl: string = '/Search/searchProductsWithPage?searchTerm=';
const getCustomerFavoriteProductsUrl: string = '/Product/getCustomerFavoriteProducts?page=';
const getProductQuantityListUrl: string = '/Product/getProductQuantityList';

const ProductService = {
    searchProducts: (text: string) => {
        return axiosInstance.get<IProduct[]>(searchProductsUrl + text);
    },

    searchProductsWithPage: (
        text: string,
        page: number,
        elementsPerPage: number,
        sortBy: number,
    ) => {
        return axiosInstance.get<IProduct[]>(
            searchProductsWithPageUrl +
                text +
                '&page=' +
                page +
                '&elementsPerPage=' +
                elementsPerPage +
                '&sortBy=' +
                sortBy,
        );
    },

    getProduct: (productId: number) => {
        return axiosInstance.get<IProduct>(getProductUrl + productId);
    },

    searchCategories: (text: string) => {
        return axiosInstance.get<ICategory[]>(searchCategoriesUrl + text);
    },

    getProductQuantityList: (
        stockQty: number,
        buyingBySecondary: boolean,
        equivalence: number,
        weightInterval: number,
        page: number,
        elementsPerPage: number,
    ) => {
        return axiosInstance.get<ISelectListItem[]>(
            `${getProductQuantityListUrl}?stockQty=${stockQty}&buyingBySecondary=${buyingBySecondary}&equivalence=${equivalence}&weightInterval=${weightInterval}&page=${page}&elementsPerPage=${elementsPerPage}`,
        );
    },

    getCustomerFavoriteProducts: (page: number, elementsPerPage: number) => {
        return axiosInstance.get<IProduct[]>(
            getCustomerFavoriteProductsUrl + page + '&elementsPerPage=' + elementsPerPage,
        );
    },
};

export default ProductService;
