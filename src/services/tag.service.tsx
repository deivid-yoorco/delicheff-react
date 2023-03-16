import axiosInstance from '@app-utils/axios-instance';
import {IProduct} from '@app-interfaces/product.interface';

const getProductsInTagUrl: string = '/Tag/GetProductsInTag?tagId=';

const TagService = {
    getProductsInTag: (tagId: number, page: number, elementsPerPage: number, sortBy: number) => {
        return axiosInstance.get<IProduct[]>(
            getProductsInTagUrl +
                tagId +
                '&page=' +
                page +
                '&elementsPerPage=' +
                elementsPerPage +
                '&sortBy=' +
                sortBy,
        );
    },
};

export default TagService;
