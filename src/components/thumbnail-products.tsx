import {Config} from '@app-config/app.config';
import {IProduct} from '@app-interfaces/product.interface';
import {Body, CardItem, Right, Text, Thumbnail, View} from 'native-base';
import React, { memo } from 'react';
import {StyleSheet, TouchableWithoutFeedback} from 'react-native';
import customVariables from '@app-theme/native-base-theme/variables/material';

interface IProps {
    productPictureUrls: string[];
    style?: any;
}

const ThumbnailProducts: React.FC<IProps> = (props) => {
    const {productPictureUrls, style} = props;
    return (
        <CardItem style={style}>
            <Body>
                <View style={{flexDirection: 'row', width: '100%'}}>
                    <View style={{flexDirection: 'row', marginLeft: 15}}>
                        {productPictureUrls?.slice(0, 5).map((x, i) => (
                            <Thumbnail
                                key={i}
                                style={{
                                    marginLeft: -15,
                                    borderWidth: 1,
                                    borderColor: '#CCCCCC',
                                }}
                                circular
                                source={{uri: Config.apiUrl + x}}
                            />
                        ))}
                    </View>
                </View>
            </Body>
            <Right>
                <Text style={[componentStyles.bold, {marginRight: 10}]}>
                    {productPictureUrls?.length}{' '}
                    {productPictureUrls?.length === 1 ? 'producto' : 'productos'}
                </Text>
            </Right>
        </CardItem>
    );
};

const componentStyles = StyleSheet.create({
    bold: {
        fontFamily: 'Quicksand-Bold',
    },
});

export default memo(ThumbnailProducts);
