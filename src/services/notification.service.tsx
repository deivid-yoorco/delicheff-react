import { LSKeys } from "@app-utils/ls-keys";
import PushNotification from "react-native-push-notification";
import axiosInstance from "@app-utils/axios-instance";
import { ISaveNotificationToken } from "@app-interfaces/notification.interface";
import AuthService from '@app-services/auth.service';
import AsyncStorage from "@react-native-community/async-storage";
import { Platform } from "react-native";

const saveNotificationTokenUrl: string = '/Notification/saveNotificationToken';

const NotificationService = {
    createDefaultChannels() {
        PushNotification.createChannel(
            {
                channelId: LSKeys.default_notification_channel,
                channelName: LSKeys.default_notification_channel,
                channelDescription: LSKeys.default_notification_channel,
                soundName: "default",
                importance: 4,
                vibrate: true,
            },
            (created) => console.log(`createChannel ${LSKeys.default_notification_channel} returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
        );
    },

    saveNotificationTokenInLs: async (token: string) => {
        await AsyncStorage.setItem(LSKeys.lskey_firebase_token, token);
    },

    saveNotificationTokenInServer: async () => {
        let body: ISaveNotificationToken = {
            token: await AsyncStorage.getItem(LSKeys.lskey_firebase_token) || '',
            deviceUuid: await AuthService.getDeviceUuid()
        };
        if (!body.token) return;
        return axiosInstance.post(saveNotificationTokenUrl, body);
    },

    getNotificationStatus: async () => {
        return AsyncStorage.getItem(LSKeys.lskey_user_notifications)
            .then((result) => {
                if (result) return result;
                return AsyncStorage.setItem(LSKeys.lskey_user_notifications, 'true')
                    .then(() => { return 'true' })
                    .catch((error) =>
                        console.log('ERROR SETTING DEFAULT NOTIFICATION VALUE:', error))
            })
            .catch((error) => {
                console.log('ERROR GETTING NOTIFICATION STATUS FROM LS:', error);
                throw error;
            })
    },

    testNotification: () => {
        PushNotification.localNotification({
            channelId: LSKeys.default_notification_channel,
            title: "Probando",
            message: "Probando notificacion",
            smallIcon: "ic_notification",
            largeIcon: "ic_notification"
        });
    }
};

export default NotificationService;