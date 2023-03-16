import { Config } from "@app-config/app.config";
import { ICoverage } from "@app-interfaces/coverage.interface";
import axiosInstance from "@app-utils/axios-instance";
import { LSKeys } from "@app-utils/ls-keys";
import AsyncStorage from "@react-native-community/async-storage";

const getCoverageDataUrl: string = '/Coverage/getCoverageData?appUrl=';
const validatePostalCodeUrl: string = '/App/validatePostalCode?postalCode=';
const postalCodeNotificationRequestUrl: string = '/App/postalCodeNotificationRequest';
const registerInvalidPostalCodeUrl: string = '/App/registerInvalidPostalCode?postalCode=';

const CoverageService = {
    getCoverageData: () => {
        return axiosInstance.get<ICoverage[]>(getCoverageDataUrl + Config.appUrl);
    },

    registerInvalidPostalCode: (postalCode: string) => {
        return axiosInstance.post(registerInvalidPostalCodeUrl + postalCode);
    },

    validatePostalCode: (postalCode: string) => {
        return axiosInstance.post<boolean>(validatePostalCodeUrl + postalCode);
    },

    postalCodeNotificationRequest: (postalCode: string, email: string) => {
        return axiosInstance.post(postalCodeNotificationRequestUrl, { postalCode, email });
    },

    registerCpRequestedInLS: (postalCode: string) => {
        AsyncStorage.setItem(LSKeys.lskey_cp_requested, postalCode);
    },

    cpValidationAlreadyRequested: () => {
        return AsyncStorage.getItem(LSKeys.lskey_cp_requested);
    },
};

export default CoverageService;