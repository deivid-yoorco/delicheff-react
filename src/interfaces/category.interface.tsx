export interface ICategory {
    id: number,
    name: string,
    pictureUrl: string,
    parentCategoryId: number
};

export interface ICategoryTree {
    id: number,
    name: string,
    parentId: number
    pictureUrl: string,
    parentCategoryId: number
};

export interface IParentCategory {
    id: number,
    name: string
};

export interface IRecentProductsSettings {
    textMenu: string,
    productsBeforeDays: number,
    productsPerPage: number,
    active: boolean
};

export interface IDiscountedProductSettings {
    textMenu: string,
    productsBeforeDays: number,
    productsPerPage: number,
    active: boolean
};