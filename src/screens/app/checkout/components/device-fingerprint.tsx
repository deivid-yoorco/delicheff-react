import React from 'react';
import WebView from 'react-native-webview';
import { Config } from '@app-config/app.config';

interface IProps {
    sessionId: string;
};

const DeviceFingerprint: React.FC<IProps> = (props) => (
    <WebView
        style={{ width: 0, height: 0, position: 'absolute', top: -5000 }}
        source={{ uri: Config.appUrl + '/paymentvisa/DeviceFingerprint?sessionId=' + props.sessionId }}
    />
);

export default DeviceFingerprint;