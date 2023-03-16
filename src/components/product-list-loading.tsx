import React, { memo } from "react";
import { StyleSheet, Dimensions } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";

interface IProps { }

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const ProductListLoading: React.FC<IProps> = (props) => {
    return (
        <ContentLoader
            speed={0.5}
            width={screenWidth}
            height={screenHeight}
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
            {...props}
        >
            <Rect x="15" y="0" rx="2" ry="2" width={(screenWidth / 2) - 10} height="210" />
            <Rect x={(screenWidth / 2) + 15} y="0" rx="2" ry="2" width={(screenWidth / 2) - 25} height="210" />
            <Rect x="15" y="220" rx="2" ry="2" width={(screenWidth / 2) - 10} height="210" />
            <Rect x={(screenWidth / 2) + 15} y="220" rx="2" ry="2" width={(screenWidth / 2) - 25} height="210" />

            <Rect x="15" y="440" rx="2" ry="2" width={(screenWidth / 2) - 10} height="210" />
            <Rect x={(screenWidth / 2) + 15} y="440" rx="2" ry="2" width={(screenWidth / 2) - 25} height="210" />
        </ContentLoader>
    )
};

const componentStyles = StyleSheet.create({});

export default memo(ProductListLoading);