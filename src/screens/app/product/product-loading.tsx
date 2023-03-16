import React, { memo } from "react";
import { StyleSheet, Dimensions } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";

interface IProps { }
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const ProductLoading: React.FC<IProps> = (props) => {
    return (
        <>
            <ContentLoader
                speed={0.5}
                width={screenWidth}
                height={screenHeight}
                backgroundColor="#f3f3f3"
                foregroundColor="#ecebeb"
                {...props}
            >
                <Rect x="15" y="0" rx="0" ry="0" width={screenWidth - 30} height="250" />
                <Rect x="15" y="260" rx="0" ry="0" width={screenWidth / 1.5} height="40" />
                <Rect x="15" y="310" rx="0" ry="0" width={screenWidth / 2.5} height="40" />
                <Rect x="15" y="360" rx="0" ry="0" width={screenWidth - 50} height="10" />
                <Rect x="15" y="380" rx="0" ry="0" width={screenWidth / 1.5} height="10" />
                <Rect x="15" y="400" rx="0" ry="0" width={screenWidth - 50} height="10" />
                <Rect x="15" y="420" rx="0" ry="0" width={screenWidth / 1.5} height="10" />
                <Rect x="15" y="440" rx="0" ry="0" width={screenWidth - 50} height="10" />
                <Rect x="15" y={screenHeight - 150} rx="0" ry="0" width={screenWidth - 30} height="60" />
            </ContentLoader>
        </>
    )
};

export default memo(ProductLoading);