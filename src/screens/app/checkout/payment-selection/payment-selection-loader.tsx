import React, { memo } from "react";
import { StyleSheet, Dimensions } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";

interface IProps { }
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const PaymentSelectionLoader: React.FC<IProps> = (props) => {
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
                <Rect x="15" y="0" rx="0" ry="0" width={screenWidth * 0.94} height="70" />
                <Rect x="15" y="75" rx="0" ry="0" width={screenWidth * 0.94} height="70" />
                <Rect x="15" y="150" rx="0" ry="0" width={screenWidth * 0.94} height="70" />
                <Rect x="15" y="225" rx="0" ry="0" width={screenWidth * 0.94} height="70" />
            </ContentLoader>
        </>
    )
};

export default memo(PaymentSelectionLoader);