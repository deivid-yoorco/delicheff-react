import axiosInstance from '@app-utils/axios-instance';
import {
  ISliderPicture,
  IHomeProducts,
  IHomeCategory,
  IOnboarding,
  ITaggableBox,
} from '@app-interfaces/home.interface';
import {ICategory} from '@app-interfaces/category.interface';
import AsyncStorage from '@react-native-community/async-storage';
import {LSKeys} from '@app-utils/ls-keys';

const getSliderPicturesUrl: string = '/Home/GetSliderPictures1';
const getHomeProductsUrl: string = '/Home/GetHomeProducts';
const getCategoryProductsUrl: string = '/Home/GetCategoryProducts';
const getFeaturedCategoriesUrl: string = '/Home/getFeaturedCategories';
const getPopupDataUrl: string = '/Popup/getPopupData?isFirstTime=';
const getActiveOnboardingsUrl: string = '/Home/GetActiveOnboardings';
const getTaggableBoxesUrl: string = '/Home/getTaggableBoxes';

const HomeService = {
  getSliderPictures: () => {
    return axiosInstance.get<ISliderPicture[]>(getSliderPicturesUrl);
  },

  getTaggableBoxes: () => {
    return axiosInstance.get<ITaggableBox[]>(getTaggableBoxesUrl);
  },

  getHomeProducts: () => {
    return axiosInstance.get<IHomeProducts>(getHomeProductsUrl);
  },

  getCategoryProducts: () => {
    return axiosInstance.get<IHomeCategory[]>(getCategoryProductsUrl);
  },

  getFeaturedCategories: () => {
    return axiosInstance.get<ICategory[]>(getFeaturedCategoriesUrl);
  },

  getPopupData: (isFirstTime: boolean) => {
    return axiosInstance.get<string[]>(getPopupDataUrl + isFirstTime);
  },

  getActiveOnboardings: () => {
    return axiosInstance.get<IOnboarding[]>(getActiveOnboardingsUrl);
  },

  saveIfPopupDisplayedTodayInLS: async () => {
    let date = new Date();
    let stringDate =
      date.getDate().toString() + date.getMonth().toString() + date.getFullYear().toString();
    await AsyncStorage.setItem(LSKeys.lskey_popup, stringDate);
  },

  checkIfPopupDisplayedToday: async () => {
    let date = new Date();
    let stringDate =
      date.getDate().toString() + date.getMonth().toString() + date.getFullYear().toString();
    return AsyncStorage.getItem(LSKeys.lskey_popup).then(async (result) => {
      if (result == null || !result) return false;
      else if (result != stringDate) {
        await AsyncStorage.removeItem(LSKeys.lskey_popup);
        return false;
      } else return true;
    });
  },
};

export default HomeService;
