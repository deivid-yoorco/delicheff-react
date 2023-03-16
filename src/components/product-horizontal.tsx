import React, { memo } from 'react';
import { StyleSheet, FlatList, ListRenderItemInfo } from 'react-native';
import { IProduct } from '@app-interfaces/product.interface';
import ProductCard from './product-card';
import { View, Text, Button, H1 } from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';
import customVariables from '@app-theme/native-base-theme/variables/material';
import SeeMoreRoundButton from './see-more-button';

interface IProps {
    products: IProduct[],
    titleName: string,
    headerStyle?: any,
    titleStyle?: any,
    titleAction?: () => void,
    seeMoreButtonText?: string
};

const cardWidth: number = 175;

const getItemLayout = (data: IProduct[] | null | undefined, index: number) => ({
    length: cardWidth,
    offset: cardWidth * index,
    index
});

const ProductHorizontalList: React.FC<IProps> = (props) => {

    const { products, titleName, headerStyle, titleStyle, titleAction, seeMoreButtonText } = props;

    const renderItem = (info: ListRenderItemInfo<IProduct>): React.ReactElement => (
        <View style={{ width: cardWidth }}>
            <ProductCard product={info.item} />
        </View>
    );

    const renderFooter = (info: ListRenderItemInfo<IProduct>): React.ReactElement => (
        <SeeMoreRoundButton
            buttonText={seeMoreButtonText ?? 'Ver más de\neste pasillo'}
            goToAction={titleAction}
        />
    );

    return (
        <View>
            <View style={[headerStyle, { flexDirection: 'row', borderBottomColor: '#e8e8e8', borderBottomWidth: 1 }]}>
                <View style={{ width: '70%' }}>
                    <H1 style={titleStyle}>{titleName}</H1>
                </View>
                <View style={{ alignContent: 'flex-end', alignItems: 'flex-end', alignSelf: 'center', justifyContent: 'flex-end', flex: 1 }}>
                    <Button transparent iconRight onPress={titleAction}>
                        <Text>Ver más</Text>
                        <Icon size={24} color={customVariables.brandPrimary} name='keyboard-arrow-right' />
                    </Button>
                </View>
            </View>
            <FlatList
                contentContainerStyle={componentStyles.horizontalList}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                data={products}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                removeClippedSubviews={true}
                getItemLayout={getItemLayout}
                ListFooterComponent={renderFooter}
            />
        </View>
    )
};

const componentStyles = StyleSheet.create({
    horizontalList: {
        marginVertical: 16
    },
});

export default memo(ProductHorizontalList);