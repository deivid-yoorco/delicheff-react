import React, { memo } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import customVariables from '@app-theme/native-base-theme/variables/material';
import ContentLoader, { Rect } from 'react-content-loader/native';

interface IProps { }
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const TopicLoader: React.FC<IProps> = (props) => {
    return (
        <ContentLoader
            speed={0.5}
            width={screenWidth}
            height={screenHeight}
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
            {...props}
        >
            <Rect x="0" y="10" rx="0" ry="0" width={screenWidth - 50} height="10" />
            <Rect x="0" y="30" rx="0" ry="0" width={screenWidth / 1.5} height="10" />
            <Rect x="0" y="50" rx="0" ry="0" width={screenWidth - 50} height="10" />
            <Rect x="0" y="70" rx="0" ry="0" width={screenWidth / 1.5} height="10" />
            <Rect x="0" y="90" rx="0" ry="0" width={screenWidth - 50} height="10" />

            <Rect x="0" y="120" rx="0" ry="0" width={screenWidth - 50} height="10" />
            <Rect x="0" y="140" rx="0" ry="0" width={screenWidth / 1.5} height="10" />
            <Rect x="0" y="160" rx="0" ry="0" width={screenWidth - 50} height="10" />
            <Rect x="0" y="180" rx="0" ry="0" width={screenWidth / 1.5} height="10" />
            <Rect x="0" y="200" rx="0" ry="0" width={screenWidth - 50} height="10" />

            <Rect x="0" y="230" rx="0" ry="0" width={screenWidth - 50} height="10" />
            <Rect x="0" y="250" rx="0" ry="0" width={screenWidth / 1.5} height="10" />
            <Rect x="0" y="270" rx="0" ry="0" width={screenWidth - 50} height="10" />
            <Rect x="0" y="290" rx="0" ry="0" width={screenWidth / 1.5} height="10" />
            <Rect x="0" y="310" rx="0" ry="0" width={screenWidth - 50} height="10" />

            <Rect x="0" y="340" rx="0" ry="0" width={screenWidth - 50} height="10" />
            <Rect x="0" y="360" rx="0" ry="0" width={screenWidth / 1.5} height="10" />
            <Rect x="0" y="380" rx="0" ry="0" width={screenWidth - 50} height="10" />
            <Rect x="0" y="400" rx="0" ry="0" width={screenWidth / 1.5} height="10" />
            <Rect x="0" y="420" rx="0" ry="0" width={screenWidth - 50} height="10" />

            <Rect x="0" y="450" rx="0" ry="0" width={screenWidth - 50} height="10" />
            <Rect x="0" y="470" rx="0" ry="0" width={screenWidth / 1.5} height="10" />
            <Rect x="0" y="490" rx="0" ry="0" width={screenWidth - 50} height="10" />
            <Rect x="0" y="510" rx="0" ry="0" width={screenWidth / 1.5} height="10" />
            <Rect x="0" y="530" rx="0" ry="0" width={screenWidth - 50} height="10" />
        </ContentLoader>
    )
};

const componentStyles = StyleSheet.create({});

export default memo(TopicLoader);