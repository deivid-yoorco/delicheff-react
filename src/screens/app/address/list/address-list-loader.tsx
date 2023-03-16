import React, { memo } from "react";
import { StyleSheet, Dimensions } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";

interface IProps { }
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const AddressListLoader: React.FC<IProps> = (props) => {
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
                <Rect x="0" y="0" rx="0" ry="0" width={screenWidth * 0.94} height="150" />
                <Rect x="0" y="160" rx="2" ry="2" width={screenWidth * 0.94} height="150" />
                <Rect x="0" y="320" rx="2" ry="2" width={screenWidth * 0.94} height="150" />
                <Rect x="0" y="480" rx="2" ry="2" width={screenWidth * 0.94} height="150" />
                <Rect x="0" y="640" rx="2" ry="2" width={screenWidth * 0.94} height="150" />
                <Rect x="0" y="800" rx="2" ry="2" width={screenWidth * 0.94} height="150" />
            </ContentLoader>
        </>
    )
};

const componentStyles = StyleSheet.create({});

export default memo(AddressListLoader);