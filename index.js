/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import PushNotification from 'react-native-push-notification';
import { LSKeys } from '@app-utils/ls-keys';

AppRegistry.registerHeadlessTask('ReactNativeFirebaseMessagingHeadlessTask', () =>
    (taskData) => {
        return new Promise((resolve, reject) => {
            PushNotification.localNotification({
                channelId: LSKeys.default_notification_channel,
                title: taskData.data.title,
                message: taskData.data.body,
                userInfo: { actionTypeId: taskData.data.actionTypeId },
                ///@ts-ignore
                data: { actionTypeId: taskData.data.actionTypeId },
                smallIcon: "ic_notification",
                largeIcon: "ic_notification"
            });
            resolve();
        })
    });

AppRegistry.registerComponent(appName, () => App);
