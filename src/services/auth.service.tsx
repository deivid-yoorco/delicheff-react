import decode from 'jwt-decode';
import axiosInstance from './../utils/axios-instance';
import {AxiosError} from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import DeviceInfo from 'react-native-device-info';
import {Platform} from 'react-native';
import {LSKeys} from '@app-utils/ls-keys';
import {IAppUser, IUpdateUser} from '@app-interfaces/user.interface';

export interface IRegisterDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    birthDate: string;
    gender: string;
    newsletterCheck: boolean;
    phoneNumber: string;
    device?: IDevice;
}

export interface IRegisterCustomerValidationDto {
    email: string;
    phoneNumer: string;
    verifyOnlyNumber: boolean;
}

export interface IRegisterCodeValidationDto {
    code: string;
    phoneNumer: string;
}

export interface IRegisterCustomerValidationResultDto {
    code: string;
    shouldValidatePhone: boolean;
    errorMessage: string;
    minutesForCodeRequest: number;
}

export interface IRegisterCodeValidationResultDto {
    validatedCorrectly: boolean;
    errorMessage: string;
}

export interface IAuthResultDto {
    tokens: IToken;
    birthDate: string;
    gender: string;
    newsletterCheck: boolean;
    phoneNumber: string;
    profilePictureId: number;
    successNote?: string;
}

export interface IToken {
    token: string;
    refreshToken: string;
}

interface ILogin {
    email: string;
    password: string;
    device: IDevice;
}

interface IDevice {
    uuid: string;
    model: string;
    platform: string;
    version: string;
    manufacturer: string;
}

const AuthService = {
    emailExists: (email: string) => {
        return axiosInstance.get<any>('/auth/EmailExists?email=' + email);
    },

    login: async (email: string, password: string): Promise<IAppUser> => {
        let body: ILogin = {
            email: email,
            password: password,
            device: await AuthService.getDevice(),
        };

        return axiosInstance
            .post<IAuthResultDto>('/auth/gettoken?legacy=false', body)
            .then(async (result) => {
                axiosInstance.defaults.headers['Authorization'] =
                    'Bearer ' + result.data.tokens.token;
                let token: string = result.data.tokens.token;
                let user = AuthService.decodeToken(token);
                user.refreshToken = result.data.tokens.refreshToken;
                user.birthDate = result.data.birthDate;
                user.gender = result.data.gender;
                user.phoneNumber = result.data.phoneNumber;
                user.newsletterCheck = result.data.newsletterCheck;
                user.profilePictureId = result.data.profilePictureId;
                await AuthService.saveUserInLS(user);
                await AsyncStorage.setItem(LSKeys.lskey_token, result.data.tokens.token);
                return user;
            })
            .catch((error: AxiosError) => {
                throw error;
            });
    },

    register: async (user: IRegisterDto) => {
        user.device = await AuthService.getDevice();
        return axiosInstance
            .post<IAuthResultDto>('/auth/register', user)
            .then(async (result) => {
                axiosInstance.defaults.headers['Authorization'] =
                    'Bearer ' + result.data.tokens.token;
                let token: string = result.data.tokens.token;
                let user = AuthService.decodeToken(token);
                user.refreshToken = result.data.tokens.refreshToken;
                user.birthDate = result.data.birthDate;
                user.gender = result.data.gender;
                user.phoneNumber = result.data.phoneNumber;
                user.newsletterCheck = result.data.newsletterCheck;
                await AuthService.saveUserInLS(user);
                await AsyncStorage.setItem(LSKeys.lskey_token, result.data.tokens.token);
                return {user, successNote: result.data.successNote};
            })
            .catch((error: AxiosError) => {
                throw error;
            });
    },

    updateDataUser: async (user: IUpdateUser) => {
        return axiosInstance.post<number>('/auth/UpdateAccount', user);
    },

    getProfilePicture: () => {
        return axiosInstance.get<number>('/auth/getProfilePicture');
    },

    registerCustomerValidation: (body: IRegisterCustomerValidationDto) => {
        return axiosInstance.post<IRegisterCustomerValidationResultDto>('/auth/RegisterCustomerValidation', body);
    },

    registerCodeValidation: (body: IRegisterCodeValidationDto) => {
        return axiosInstance.post<IRegisterCodeValidationResultDto>('/auth/ValidateSmsVerificationCode', body);
    },

    recoverPassword: (email: string, url: string) => {
        let body = {
            Email: email,
            SiteUrl: url,
        };

        return axiosInstance.post<IToken>('/auth/passwordRecovery', body);
    },

    decodeToken: (token: string): IAppUser => {
        let claims = decode(token) as any;

        let user: IAppUser = {
            firstName: claims.first_name,
            lastName: claims.last_name,
            email: claims.sub,
            id: claims.user_id,
            roles: claims.roles.split(','),
            refreshToken: '',
            birthDate: '',
            gender: '',
            phoneNumber: '',
            newsletterCheck: true,
            profilePictureId: 0,
            profilePictureLastUpdate: new Date(),
        };

        return user;
    },

    getUser: async (): Promise<IAppUser | null> => {
        const currentUser = await AsyncStorage.getItem(LSKeys.lskey_user);
        if (currentUser == null) {
            return null;
        }
        return JSON.parse(currentUser) as IAppUser;
    },

    saveUserInLS: async (user: IAppUser) => {
        AsyncStorage.setItem(LSKeys.lskey_user, JSON.stringify(user));
    },

    clearStorage: async () => {
        await AsyncStorage.clear();
    },

    isLoggedIn: async (): Promise<boolean> => {
        const user = await AuthService.getUser();
        return user != null;
    },

    getDevice: async (): Promise<IDevice> => {
        return {
            uuid: await AuthService.getDeviceUuid(),
            model: DeviceInfo.getDeviceId(),
            platform: Platform.OS,
            version: DeviceInfo.getSystemVersion(),
            manufacturer: await DeviceInfo.getManufacturer(),
        };
    },

    getDeviceUuid: async (): Promise<string> => {
        return DeviceInfo.getUniqueId();
    },

    setNotificationStatus: (notification: boolean) => {
        return AsyncStorage.setItem(LSKeys.lskey_user_notifications, JSON.stringify(notification));
    },
};

export default AuthService;
