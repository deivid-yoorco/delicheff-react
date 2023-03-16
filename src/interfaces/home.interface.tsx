import {ICategory} from './category.interface';
import {IProduct} from './product.interface';

export interface IHomeProducts {
    headerText: string;
    products: IProduct[];
}

export interface IHomeCategory {
    category: ICategory;
    products: IProduct[];
}

export interface IOnboarding {
    backgroundColor: string;
    subtitle: string;
    title: string;
    imageId: number;
}

export interface ITaggableBox {
    elementId: number;
    pictureUrl: string;
    position: number;
    type: number;
    elementName: string;
    isChild: boolean;
}

export interface ISliderPicture {
    sliderPictureUrl: string;
    actionTypeId: number;
    additionalData: any;
}