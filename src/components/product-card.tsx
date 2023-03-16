import React, { memo, useState } from 'react';
import { PixelRatio, StyleSheet } from 'react-native';
import { Card, CardItem, Body, Text, View } from 'native-base';
import FastImage from 'react-native-fast-image';
import { commonProductCardWidth, formatCurrency } from '@app-utils/common-utils';
import { Config } from '@app-config/app.config';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { RootStackParamList, AppStackParamList } from 'navigation/navigation';
import { IProduct } from '@app-interfaces/product.interface';
import QuantityButton from './quantity-button';
import customVariables from '@app-theme/native-base-theme/variables/material';
import LikeButton from './like-button';

type ScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<AppStackParamList, 'Product'>,
  StackNavigationProp<RootStackParamList, 'Auth'>
>;

interface IProps {
  product: IProduct;
  shouldLoadProduct?: boolean;
  addingProduct?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProductCard: React.FC<IProps> = (props) => {
  const { product, shouldLoadProduct, addingProduct } = props;
  const navigation = useNavigation<ScreenNavigationProp>();

  const [currentProduct, setCurrenProduct] = useState<IProduct>(product);

  const goToProduct = () => {
    navigation.push('Product', { product: currentProduct, shouldLoadProduct });
  };

  return (
    <Card noShadow style={{ height: commonProductCardWidth(), borderColor: 'transparent' }}>
      <LikeButton
        product={currentProduct}
      />
      <TouchableWithoutFeedback onPress={goToProduct}>
        <CardItem cardBody style={{ alignSelf: 'center' }}>
          <FastImage
            source={{ uri: Config.apiUrl + currentProduct.pictureUrl }}
            style={{ height: 100, width: 100 }}
          />
        </CardItem>
        <CardItem style={{ paddingBottom: 0, paddingTop: 0, marginBottom: 5 }}>
          <Body style={{
            height: 150 * PixelRatio.getFontScale(),
            justifyContent: 'center', //Centered horizontally
            alignItems: 'center', //Centered vertically
            flex: 1
          }}>
            <Text
              style={{ fontSize: currentProduct.name.length > 90 ? 13 : 15,
              textAlign: 'center', alignSelf: 'center' }}>
              {
                // currentProduct.name.length > 20
                //   ? currentProduct.name.substring(0, 30) + '...'
                //   :
                currentProduct.name}
            </Text>
          </Body>
        </CardItem>
      </TouchableWithoutFeedback>
      <View>
        {currentProduct.discount > 0 || currentProduct.oldPrice > 0 ? (
          <View
            style={{
              flexDirection: 'row',
              margin: 0,
              paddingTop: 0,
              paddingBottom: 10,
              alignSelf: 'center',

            }}>
            <Text style={componentStyles.oldPrice}>
              {currentProduct.discount > 0 ? (
                <>${formatCurrency(currentProduct.price)}</>
              ) : (
                <>${formatCurrency(currentProduct.oldPrice)}</>
              )}
            </Text>
            <Text style={componentStyles.bold}>
              {currentProduct.discount > 0 ? (
                <>
                  $
                  {formatCurrency(
                    currentProduct.price - currentProduct.discount,
                  )}
                </>
              ) : (
                <>${formatCurrency(currentProduct.price)}</>
              )}
            </Text>
          </View>
        ) : (
          <View style={{ alignSelf: 'center', margin: 0, paddingTop: 0, paddingBottom: 10 }}>
            <Text style={componentStyles.bold}>
              ${formatCurrency(currentProduct.price)}
            </Text>
          </View>
        )}
      </View>
      <CardItem>
        <QuantityButton
          product={currentProduct}
          setProduct={setCurrenProduct}
          canGoToProductScreen
          addingProductEvent={addingProduct}
        />
      </CardItem>
    </Card>
  );
};

const componentStyles = StyleSheet.create({
  bold: {
    fontFamily: 'Quicksand-Bold',
  },
  oldPrice: {
    color: customVariables.brandDanger,
    textDecorationLine: 'line-through',
    marginRight: 15,
    alignSelf: 'center',
  },
});

export default memo(ProductCard);
