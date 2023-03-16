import React, { memo } from "react";
import { StyleSheet, Dimensions } from "react-native";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";

interface IProps { }
const screenWidth = Dimensions.get("window").width;
const sliderHeight = 1080 / (1920 / screenWidth);

const HomeLoading: React.FC<IProps> = (props) => {
    return (
        <>
            <ContentLoader
                width={screenWidth}
                height={sliderHeight}
                viewBox={`${"0 0 " + screenWidth + " " + sliderHeight}`}
                backgroundColor="#f3f3f3"
                foregroundColor="#ecebeb"
                speed={0.5}
            >
                <Rect x="0" y="0" rx="0" ry="0" width={screenWidth} height={sliderHeight} />
            </ContentLoader>
            <ContentLoader
                speed={0.5}
                width={screenWidth}
                height={575}
                viewBox={`${"0 0 " + screenWidth + " 575"}`}
                backgroundColor="#f3f3f3"
                foregroundColor="#ecebeb"
                {...props}
            >
                <Rect x="15" y="25" rx="2" ry="2" width={screenWidth / 3} height="10" />
                <Rect x="15" y="58" rx="2" ry="2" width={(screenWidth / 2) - 10} height="211" />
                <Rect x={(screenWidth / 2) + 15} y="58" rx="2" ry="2" width={(screenWidth / 2) - 25} height="211" />
                <Rect x="15" y="280" rx="2" ry="2" width={(screenWidth / 2) - 10} height="211" />
                <Rect x={(screenWidth / 2) + 15} y="280" rx="2" ry="2" width={(screenWidth / 2) - 25} height="211" />
            </ContentLoader>
        </>
    )
};

const componentStyles = StyleSheet.create({});

export default memo(HomeLoading);