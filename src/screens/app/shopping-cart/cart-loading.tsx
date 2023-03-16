import React, { memo } from "react";
import { StyleSheet, Dimensions } from "react-native";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";

interface IProps { }
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const sliderHeight = 1080 / (1520 / screenWidth);

const CartLoading: React.FC<IProps> = (props) => {
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
                <Rect x="16" y="13" rx="0" ry="0" width={screenWidth / 4.5 } height="63" />
                <Rect x="116" y="17" rx="0" ry="0" width={(screenWidth / 2.5)} height="8" />
                <Rect x="116" y="37" rx="0" ry="0" width={screenWidth / 4} height="8" />
                <Rect x="116" y="57" rx="0" ry="0" width={screenWidth / 3} height="9" />
                <Rect x="296" y="28" rx="0" ry="0" width={(screenWidth / 7) - 25} height="32" />
                <Rect x="363" y="28" rx="0" ry="0" width={(screenWidth / 7) - 25} height="31" />

                <Rect x="16" y={(screenWidth / 4) + 10} rx="0" ry="0" width={screenWidth / 4.5 } height="63" />
                <Rect x="116" y={(screenWidth / 4) + 13} rx="0" ry="0" width={(screenWidth / 2.5)} height="8" />
                <Rect x="116" y={(screenWidth / 3) - 1} rx="0" ry="0" width={screenWidth / 4} height="8" />
                <Rect x="116" y={(screenWidth / 3) + 20} rx="0" ry="0" width={screenWidth / 3} height="9" />
                <Rect x="296" y={(screenWidth / 3) - 10} rx="0" ry="0" width={(screenWidth / 7) - 25} height="32" />
                <Rect x="363" y={(screenWidth / 3) - 10} rx="0" ry="0" width={(screenWidth / 7) - 25} height="31" />

                <Rect x="16" y={(screenWidth / 2) + 10} rx="0" ry="0" width={screenWidth / 4.5 } height="63" />
                <Rect x="116" y={(screenWidth / 2) + 13} rx="0" ry="0" width={(screenWidth / 2.5)} height="8" />
                <Rect x="116" y={(screenWidth / 2) + 33} rx="0" ry="0" width={screenWidth / 4} height="8" />
                <Rect x="116" y={(screenWidth / 2) + 55} rx="0" ry="0" width={screenWidth / 3} height="9" />
                <Rect x="296" y={(screenWidth / 2) + 25} rx="0" ry="0" width={(screenWidth / 7) - 25} height="32" />
                <Rect x="363" y={(screenWidth / 2) + 25} rx="0" ry="0" width={(screenWidth / 7) - 25} height="31" />

                <Rect x="16" y={(screenWidth / 2) + 110} rx="0" ry="0" width={screenWidth / 4.5 } height="63" />
                <Rect x="116" y={(screenWidth / 2) + 113} rx="0" ry="0" width={(screenWidth / 2.5)} height="8" />
                <Rect x="116" y={(screenWidth / 2) + 133} rx="0" ry="0" width={screenWidth / 4} height="8" />
                <Rect x="116" y={(screenWidth / 2) + 155} rx="0" ry="0" width={screenWidth / 3} height="9" />
                <Rect x="296" y={(screenWidth / 2) + 125} rx="0" ry="0" width={(screenWidth / 7) - 25} height="32" />
                <Rect x="363" y={(screenWidth / 2) + 125} rx="0" ry="0" width={(screenWidth / 7) - 25} height="31" />

                <Rect x="16" y={(screenWidth / 2) + 210} rx="0" ry="0" width={screenWidth / 4.5 } height="63" />
                <Rect x="116" y={(screenWidth / 2) + 213} rx="0" ry="0" width={(screenWidth / 2.5)} height="8" />
                <Rect x="116" y={(screenWidth / 2) + 233} rx="0" ry="0" width={screenWidth / 4} height="8" />
                <Rect x="116" y={(screenWidth / 2) + 255} rx="0" ry="0" width={screenWidth / 3} height="9" />
                <Rect x="296" y={(screenWidth / 2) + 225} rx="0" ry="0" width={(screenWidth / 7) - 25} height="32" />
                <Rect x="363" y={(screenWidth / 2) + 225} rx="0" ry="0" width={(screenWidth / 7) - 25} height="31" />

                <Rect x="16" y={(screenWidth / 2) + 310} rx="0" ry="0" width={screenWidth / 4.5 } height="63" />
                <Rect x="116" y={(screenWidth / 2) + 313} rx="0" ry="0" width={(screenWidth / 2.5)} height="8" />
                <Rect x="116" y={(screenWidth / 2) + 333} rx="0" ry="0" width={screenWidth / 4} height="8" />
                <Rect x="116" y={(screenWidth / 2) + 355} rx="0" ry="0" width={screenWidth / 3} height="9" />
                <Rect x="296" y={(screenWidth / 2) + 325} rx="0" ry="0" width={(screenWidth / 7) - 25} height="32" />
                <Rect x="363" y={(screenWidth / 2) + 325} rx="0" ry="0" width={(screenWidth / 7) - 25} height="31" />

                <Rect x="16" y={(screenWidth / 2) + 410} rx="0" ry="0" width={screenWidth / 4.5 } height="63" />
                <Rect x="116" y={(screenWidth / 2) + 413} rx="0" ry="0" width={(screenWidth / 2.5)} height="8" />
                <Rect x="116" y={(screenWidth / 2) + 433} rx="0" ry="0" width={screenWidth / 4} height="8" />
                <Rect x="116" y={(screenWidth / 2) + 455} rx="0" ry="0" width={screenWidth / 3} height="9" />
                <Rect x="296" y={(screenWidth / 2) + 425} rx="0" ry="0" width={(screenWidth / 7) - 25} height="32" />
                <Rect x="363" y={(screenWidth / 2) + 425} rx="0" ry="0" width={(screenWidth / 7) - 25} height="31" />
            </ContentLoader>
        </>
    )
};

const componentStyles = StyleSheet.create({});

export default memo(CartLoading);