import { useContext, useEffect } from 'react';
import { AppRegistry, Linking, Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import NotificationService from '@app-services/notification.service';
import { LSKeys } from '@app-utils/ls-keys';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList, AuthStackParamList } from 'navigation/navigation';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import analytics from '@react-native-firebase/analytics';
import AuthService from '@app-services/auth.service';
import WebView from 'react-native-webview';

type ScreenNavigationProp = CompositeNavigationProp<StackNavigationProp<AppStackParamList, 'Product'>,
    StackNavigationProp<AuthStackParamList, 'Register'>>;

const useNotifications = () => {
    const navigation = useNavigation<ScreenNavigationProp>();

    useEffect(() => {
        PushNotification.configure({
            // (optional) Called when Token is generated (iOS and Android)
            onRegister: (token) => onRegister(token),

            // (required) Called when a remote is received or opened, or local notification is opened
            onNotification: (notification) => handleNotificationAction(notification),

            // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
            onRegistrationError: (error) => onRegistrationError(error),

            // IOS ONLY (optional): default: all - Permissions to register.
            permissions: {
                alert: true,
                badge: true,
                sound: true,
            },

            // Should the initial notification be popped automatically
            // default: true
            popInitialNotification: true,
            requestPermissions: true,
        });
    }, []);

    useEffect(() => {
        messaging().setBackgroundMessageHandler(async (message) => {
            onNotification(message);
        });

        const unsubscribe = messaging().onMessage((message) => {
            onNotification(message);
        });
        return unsubscribe;
    }, []);

    const setupAndroidNotification = (token: string) => {
        saveTokenInLs(token);
    };

    const onRegister = (token: { os: string; token: string; }) => {
        if (token.os === 'ios') {
            setupIosNotification();
        }
        else {
            setupAndroidNotification(token.token);
        }
    };

    const setupIosNotification = () => {
        messaging().getToken()
            .then((result) => {
                saveTokenInLs(result);
            })
            .catch((error) => {
                console.log('ERROR GETTING FIREBASE TOKEN:', error);
            })
    };

    const onNotification = (notification: any) => {
        console.log("ON NOTIFICATION:", notification);
        AuthService.isLoggedIn()
            .then((value) => {
                if (!value) return;
                NotificationService.getNotificationStatus()
                    .then((status) => {
                        if (status !== 'true') return;
                        PushNotification.localNotification({
                            channelId: LSKeys.default_notification_channel,
                            title: notification.data.title,
                            message: notification.data.body,
                            userInfo: { actionTypeId: notification.data.actionTypeId },
                            ///@ts-ignore
                            data: {
                                actionTypeId: notification.data.actionTypeId,
                                additionalData1: notification.data?.additionalData1,
                                additionalData2: notification.data?.additionalData2,
                                additionalData3: notification.data?.additionalData3,
                            },
                            smallIcon: "ic_notification",
                            largeIcon: "ic_notification"
                        });

                        handleNotificationAction(notification);

                        if (notification.finish)
                            notification.finish(PushNotificationIOS.FetchResult.NoData);
                    })
                    .catch(async (error) => {
                        console.log('ERROR GETTING NOTIFICATION STATUS:', error);
                        await analytics().logEvent('custom_error', { message: 'ERROR GETTING NOTIFICATION STATUS: ' + JSON.stringify(error) })
                    })
            })
            .catch((error) => console.log('ERROR CHECKING IF USER LOGGED IN', error))
    };

    const handleNotificationAction = async (notification: any) => {
        await analytics().logEvent('notification_action', { message: 'NOTIFICACIÓN ABIERTA: ' + JSON.stringify(notification) });
        console.log(notification.data);
        if ((notification.userInteraction || notification.data.userInteraction) && notification.data?.actionTypeId) {
            switch (notification.data.actionTypeId) {
                case "20": // Open shopping cart
                    navigation.push("ShoppingCart");
                    break;
                case "30": // Open wishlist
                    navigation.push("Wishlist");
                    break;
                case "40": // Open register
                    navigation.push("Register");
                    break;
                default:
                    break;
            }
            if (notification.data?.additionalData1) {
                switch (notification.data.actionTypeId) {
                    case "50": // Open category
                        navigation.push("Category", {
                            categoryId: notification.data?.additionalData1,
                            categoryName: notification.data?.additionalData2,
                            isChild: notification.data?.additionalData3 == 'true',
                        });
                        break;
                    case "60": // Open product
                        navigation.push("Product", {
                            productId: notification.data?.additionalData1,
                            shouldLoadProduct: true,
                        });
                        break;
                    case "70": // Open and search term
                        navigation.push("Search", {
                            givenSearchTerm: notification.data?.additionalData1
                        });
                        break;
                    case "80": // Open external link
                        // <WebView
                        //     // style={{ width: 0, height: 0, position: 'absolute', top: -5000 }}
                        //     source={{ uri: notification.data?.additionalData1 }}
                        // />
                        Linking.openURL(notification.data?.additionalData1);
                        break;
                    default:
                        break;
                }
            }
        }
    };

    const saveTokenInLs = (token: string) => {
        NotificationService.saveNotificationTokenInLs(token).catch(error => console.log("ERROR SAVING TOKEN IN LS:", error));
        NotificationService.createDefaultChannels();
    };

    const onAction = (notification: any) => {
        console.log("NOTIFICATION ACTION:", notification);
        // process the action
    };

    const onRegistrationError = (err: any) => {
        console.error('NOTIFICATION ERROR ' + err.message, err);
    };

    return [];
};

export default useNotifications;