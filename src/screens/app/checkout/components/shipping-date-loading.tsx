import React from "react";
import { StyleSheet, Dimensions } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";

interface IProps { }
const screenWidth = Dimensions.get("window").width;
const elementHeight = 85;

const ShippingDateLoading: React.FC<IProps> = (props) => {
    return (
        <>
            <ContentLoader
                speed={0.5}
                width={screenWidth}
                height={elementHeight}
                backgroundColor="#f3f3f3"
                foregroundColor="#ecebeb"
                {...props}
            >
                <Rect x="0" y="15" rx="0" ry="0" width={screenWidth - 70} height={elementHeight} />
            </ContentLoader>
        </>
    )
};

export default ShippingDateLoading;