import { Config } from "@app-config/app.config";
import AsyncStorage from "@react-native-community/async-storage";
import { LSKeys } from "./ls-keys";

export const getRequestMessage = (statusCode: number, message?: string): string => {
    switch (statusCode) {
        case 0:
            return "Ocurrió un problema con la solicitud, por favor inténtalo de nuevo.";
        case 401:
            return "Credenciales inválidas.";
        case 400:
            return message || "Hubo un problema procesando la solicitud. Por favor, inténtalo de nuevo más tarde.";
        default:
            return "Hubo un problema procesando la solicitud. Por favor, inténtalo de nuevo más tarde.";
    }
};

export const getRequestMessageType = (statusCode: number): "danger" | "success" | "warning" | undefined => {
    switch (statusCode) {
        case 0:
        case 401:
        case 400:
            return 'danger';
        default:
            return undefined;
    }
};

export const getAuthorizationHeaderValue = async (): Promise<string> => {
    let currentToken = await AsyncStorage.getItem(LSKeys.lskey_token);
    if (currentToken === null) return '';
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        // console.log('TOKEN:', currentToken);
    };
    return 'Bearer ' + currentToken;
};

export const getProfilePictureUrl = (profilePictureId: number, profilePictureUpdated: Date): string => {
    return Config.apiUrl + '/Settings/GetPicture?id=' + profilePictureId + '&' + profilePictureUpdated
};

export const getPictureUrl = (pictureId: number): string => {
    return Config.apiUrl + '/Settings/GetPicture?id=' + pictureId;
};