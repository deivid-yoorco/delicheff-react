import React, { memo } from "react";
import { StyleSheet, Dimensions } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";

interface IProps { }
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const CategoryLoading: React.FC<IProps> = (props) => {
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
                <Rect x="15" y="0" rx="0" ry="0" width={(screenWidth / 2) - 15} height="100" />
                <Rect x={(screenWidth / 2) + 6} y="0" rx="0" ry="0" width={(screenWidth / 2) - 18} height="100" />

                <Rect x="15" y="106" rx="0" ry="0" width={(screenWidth / 2) - 15} height="100" />
                <Rect x={(screenWidth / 2) + 6} y="106" rx="0" ry="0" width={(screenWidth / 2) - 18} height="100" />

                <Rect x="15" y="212" rx="0" ry="0" width={(screenWidth / 2) - 15} height="100" />
                <Rect x={(screenWidth / 2) + 6} y="212" rx="0" ry="0" width={(screenWidth / 2) - 18} height="100" />

                <Rect x="15" y="318" rx="0" ry="0" width={(screenWidth / 2) - 15} height="100" />
                <Rect x={(screenWidth / 2) + 6} y="318" rx="0" ry="0" width={(screenWidth / 2) - 18} height="100" />

                <Rect x="15" y="424" rx="0" ry="0" width={(screenWidth / 2) - 15} height="100" />
                <Rect x={(screenWidth / 2) + 6} y="424" rx="0" ry="0" width={(screenWidth / 2) - 18} height="100" />

                <Rect x="15" y="530" rx="0" ry="0" width={(screenWidth / 2) - 15} height="100" />
                <Rect x={(screenWidth / 2) + 6} y="530" rx="0" ry="0" width={(screenWidth / 2) - 18} height="100" />

                <Rect x="15" y="636" rx="0" ry="0" width={(screenWidth / 2) - 15} height="100" />
                <Rect x={(screenWidth / 2) + 6} y="636" rx="0" ry="0" width={(screenWidth / 2) - 18} height="100" />
            </ContentLoader>
        </>
    )
};


export default memo(CategoryLoading);