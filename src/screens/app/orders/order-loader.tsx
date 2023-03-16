import React, { memo } from "react";
import { StyleSheet, Dimensions } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";

interface IProps { }
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const OrderLoader: React.FC<IProps> = (props) => {
    return (
        <>
            <ContentLoader
                speed={0.5}
                width={screenWidth}
                height={screenHeight}
                viewBox={`${"0 0 " + screenWidth + " " + screenHeight}`}
                backgroundColor="#f3f3f3"
                foregroundColor="#ecebeb"
                {...props}
            >
                <Rect x="12" y="0" rx="0" ry="0" width={screenWidth * 0.94} height="90" />
                <Rect x="12" y="100" rx="2" ry="2" width={screenWidth * 0.94} height="90" />
                <Rect x="12" y="200" rx="2" ry="2" width={screenWidth * 0.94} height="90" />
                <Rect x="12" y="300" rx="2" ry="2" width={screenWidth * 0.94} height="90" />
                <Rect x="12" y="400" rx="2" ry="2" width={screenWidth * 0.94} height="90" />
                <Rect x="12" y="500" rx="2" ry="2" width={screenWidth * 0.94} height="90" />
                <Rect x="12" y="600" rx="2" ry="2" width={screenWidth * 0.94} height="90" />
                <Rect x="12" y="700" rx="2" ry="2" width={screenWidth * 0.94} height="90" />
                <Rect x="12" y="800" rx="2" ry="2" width={screenWidth * 0.94} height="90" />
            </ContentLoader>
        </>
    )
};

const componentStyles = StyleSheet.create({});

export default memo(OrderLoader);