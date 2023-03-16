import React from "react";
import { StyleSheet, Dimensions } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";
import { Card, CardItem, Body } from "native-base";

interface IProps { }
const screenWidth = Dimensions.get("window").width;
const elementHeight = 170;

const AddressLoading: React.FC<IProps> = (props) => {
    return (
        <Card>
            <CardItem>
                <Body>
                    <ContentLoader
                        speed={0.5}
                        width={screenWidth}
                        height={elementHeight}
                        backgroundColor="#f3f3f3"
                        foregroundColor="#ecebeb"
                        {...props}
                    >
                        <Rect x="0" y="5" rx="0" ry="0" width={screenWidth / 2} height="30" />
                        <Rect x="0" y="50" rx="0" ry="0" width={screenWidth - 75} height="10" />
                        <Rect x="0" y="70" rx="0" ry="0" width={screenWidth / 1.5} height="10" />
                        <Rect x="0" y="90" rx="0" ry="0" width={screenWidth - 75} height="10" />
                        <Rect x="0" y="110" rx="0" ry="0" width={screenWidth / 1.5} height="10" />
                        <Rect x="0" y="130" rx="0" ry="0" width={screenWidth - 75} height="10" />
                    </ContentLoader>
                </Body>
            </CardItem>
        </Card>
    )
};

export default AddressLoading;