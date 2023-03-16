import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import { Config } from '@app-config/app.config';
import { useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { AppContext } from '@app-context/app.context';
import DeviceInfo from 'react-native-device-info';
import { LSKeys } from './ls-keys';
import { IAppUser } from '@app-interfaces/user.interface';
import { IToken } from '@app-services/auth.service';
import { getAuthorizationHeaderValue } from './request-utils';
import { ShoppingCartContext } from '@app-context/shopping-cart.context';

const lskey_token = 'user_token';
const refreshTokenUrl = '/auth/refresh';
const loginUrl = '/auth/GetToken';

const axiosInstance = axios.create({
    baseURL: Config.apiUrl,
    headers: {
        contentType: 'application/json',
        accept: 'application/json',
        //'Authorization': getAuthorizationHeaderValue()
    }
});

export const useAxios = () => {
    const context = useContext(AppContext);
    const shoppingCartContext = useContext(ShoppingCartContext);
    const [counter, setCounter] = useState(0);

    const inc = useCallback(() => setCounter(counter => counter + 1), [setCounter]);
    const dec = useCallback(() => setCounter(counter => counter - 1), [setCounter]);

    const interceptors = useMemo(() => ({
        request: (config: AxiosRequestConfig) => (inc(), handleRequest(config)),
        response: (response: AxiosResponse<any>) => (dec(), response),
        error: (error: AxiosError) => (dec(), handleError(error)),
    }), [inc, dec]);

    useEffect(() => {
        const request = axiosInstance.interceptors.request.use(interceptors.request, interceptors.error);
        const response = axiosInstance.interceptors.response.use(interceptors.response, interceptors.error);
        return () => {
            axiosInstance.interceptors.request.eject(request);
            axiosInstance.interceptors.response.eject(response);
        };
    }, [interceptors]);

    const handleRequest = async (config: AxiosRequestConfig) => {
        config.headers['Authorization'] = await getAuthorizationHeaderValue();
        return config;
    };

    const handleError = async (error: AxiosError) => {
        const originalRequest = error.config;
        
        if (error.response !== undefined && (originalRequest.url && originalRequest.url.toUpperCase().indexOf('AUTH') > -1 && error.response.status === 401)) {
            return Promise.reject(error);
        }

        const currentUserData = await AsyncStorage.getItem(LSKeys.lskey_user);
        if (currentUserData == null) return;
        let currentUser = JSON.parse(currentUserData) as IAppUser;

        // if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        //     console.log(JSON.stringify(error));
        // };

        if (error.response === undefined || error.response.status !== 401 || currentUser === null) {
            return Promise.reject(error);
        };

        if (originalRequest.url === refreshTokenUrl && error.response.status === 401) {
            // shoppingCartContext.clearShoppingCart();
            // context.logOutUser();
            return Promise.reject(error);
        };

        let body = {
            UserId: currentUser.id,
            RefreshToken: currentUser.refreshToken,
            DeviceUuid: DeviceInfo.getUniqueId(),
        };

        return axiosInstance.post<IToken>(refreshTokenUrl, body)
            .then(async result => {
                let newToken = result.data.token;
                axiosInstance.defaults.headers['Authorization'] = 'Bearer ' + newToken;
                originalRequest.headers['Authorization'] = 'Bearer ' + newToken;

                await AsyncStorage.setItem(lskey_token, newToken);

                return axios.request(originalRequest);
            })
            .catch(() => {
                // shoppingCartContext.clearShoppingCart();
                // context.logOutUser();
            })
    };

    return [counter > 0];
};

export default axiosInstance;