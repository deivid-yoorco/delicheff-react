import React, {memo} from 'react';
import {StyleSheet, Dimensions} from 'react-native';
import ContentLoader, {Rect} from 'react-content-loader/native';

interface IProps {}
const screenWidth = Dimensions.get('window').width;
const elementHeight = 40;

const PaymentMethodLoading: React.FC<IProps> = (props) => {
    return (
        <>
            <ContentLoader
                speed={0.5}
                width={screenWidth}
                height={elementHeight}
                backgroundColor="#f3f3f3"
                foregroundColor="#ecebeb"
                {...props}>
                <Rect x="0" y="0" rx="0" ry="0" width={screenWidth / 1.7} height={elementHeight} />
            </ContentLoader>
        </>
    );
};

export default memo(PaymentMethodLoading);
