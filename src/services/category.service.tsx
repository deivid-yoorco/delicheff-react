import axiosInstance from '@app-utils/axios-instance';
import {ICategory, IParentCategory, ICategoryTree, IRecentProductsSettings, IDiscountedProductSettings} from '@app-interfaces/category.interface';
import {IProduct} from '@app-interfaces/product.interface';

const getChildCategoriesUrl: string = '/Categories/GetChildCategories?parentCategoryId=';
const getProductsInCategoryUrl: string = '/Categories/GetProductsInCategory?categoryId=';
const getCategoryTreeUrl: string = '/Categories/GetCategoryTree';
const getParentCategoriesUrl: string = '/Categories/getParentCategories';
const getRecentProductsUrl: string = '/RecentProductsApi/RecentProductsForApp?pageNumber=';
const getRecentProductsPluginInfoUrl: string = '/RecentProductsApi/GetRecentProductsPluginInfo';
const getDiscountedProductsUrl: string = '/DiscountedProductsApi/DiscountedProductsForApp?pageNumber=';
const getDiscountedProductsPluginInfoUrl: string = '/DiscountedProductsApi/GetDiscountedProductsPluginInfo';

const CategoryService = {
  getChildCategories: (parentCategoryId: number) => {
    return axiosInstance.get<ICategory[]>(getChildCategoriesUrl + parentCategoryId);
  },

  getProductsInCategory: (
    categoryId: number,
    page: number,
    elementsPerPage: number,
    sortBy: number,
  ) => {
    return axiosInstance.get<IProduct[]>(
      getProductsInCategoryUrl +
        categoryId +
        '&page=' +
        page +
        '&elementsPerPage=' +
        elementsPerPage +
        '&sortBy=' +
        sortBy,
    );
  },

  getCategoryTree: () => {
    return axiosInstance.get<ICategoryTree[]>(getCategoryTreeUrl);
  },

  getParentCategories: () => {
    return axiosInstance.get<IParentCategory[]>(getParentCategoriesUrl);
  },
  
  getRecentProducts: (page: number) => {
    return axiosInstance.get<IProduct[]>(getRecentProductsUrl + page);
  },
  
  getRecentProductsPluginInfo: () => {
    return axiosInstance.get<IRecentProductsSettings>(getRecentProductsPluginInfoUrl);
  },

  getDiscountedProducts: (page: number) => {
    return axiosInstance.get<IProduct[]>(getDiscountedProductsUrl + page);
  },
  
  getDiscountedProductsPluginInfo: () => {
    return axiosInstance.get<IDiscountedProductSettings>(getDiscountedProductsPluginInfoUrl);
  },
};

export default CategoryService;
