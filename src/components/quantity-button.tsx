import React, {memo, useContext, useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {View, Button, Text} from 'native-base';
import {IProduct} from '@app-interfaces/product.interface';
import {getQuantity} from '@app-utils/product-utils';
import {AppContext} from '@app-context/app.context';
import {CompositeNavigationProp, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppStackParamList, RootStackParamList} from 'navigation/navigation';
import {ShoppingCartContext} from '@app-context/shopping-cart.context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LoadingButton from './loading-button';

type ScreenNavigationProp = CompositeNavigationProp<
    StackNavigationProp<AppStackParamList, 'Product'>,
    StackNavigationProp<RootStackParamList>
>;

interface IProps {
    product: IProduct;
    setProduct: React.Dispatch<React.SetStateAction<IProduct | undefined>>;
    canGoToProductScreen: boolean;
    displayContinueButton?: boolean;
    addingProductEvent?: React.Dispatch<React.SetStateAction<boolean>>;
}

const QuantityButton: React.FC<IProps> = (props) => {
    const {product, setProduct, canGoToProductScreen, displayContinueButton} = props;
    const appContext = useContext(AppContext);
    const shoppingCartContext = useContext(ShoppingCartContext);
    const navigation = useNavigation<ScreenNavigationProp>();

    useEffect(() => {
        updateQuantityFromContext();
    }, [shoppingCartContext.shoppingCartItems]);

    const updateQuantityFromContext = () => {
        let index = shoppingCartContext.shoppingCartItems
            .map((x) => x.productId)
            .indexOf(product.id);

        let qty = 0;
        let buyingBySecondary = false;
        let selectedPropertyOption = undefined;

        if (index > -1) {
            qty = shoppingCartContext.shoppingCartItems[index].quantity;
            buyingBySecondary = shoppingCartContext.shoppingCartItems[index].buyingBySecondary;
            selectedPropertyOption =
                shoppingCartContext.shoppingCartItems[index].selectedPropertyOption;
        }

        setProduct({
            ...product,
            currentCartQuantity: qty,
            buyingBySecondary: buyingBySecondary,
            selectedPropertyOption: selectedPropertyOption,
        });
    };

    const addProductToCart = () => {
        if (!appContext.appUser) {
            navigation.navigate('Auth');
            return;
        }

        if (
            (product.equivalenceCoefficient > 0 || product.propertyOptions?.length > 0) &&
            canGoToProductScreen
        ) {
            goToProduct();
            return;
        }

        navigation.push('QuantitySelection', {
            product,
            onGoBack(updatedProduct: IProduct) {
                setProduct({
                    ...product,
                    currentCartQuantity: updatedProduct.currentCartQuantity,
                    buyingBySecondary: updatedProduct.buyingBySecondary,
                    selectedPropertyOption: updatedProduct.selectedPropertyOption,
                });
            },
        });
    };

    const goToProduct = () => {
        if (canGoToProductScreen) navigation.push('Product', {product: product});
    };

    const goBack = () => {
        navigation.goBack();
    };

    return (
        <>
            {product.currentCartQuantity > 0 ? (
                <View
                    style={{
                        flexDirection: 'row',
                        alignSelf: 'center',
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                    <Button onPress={addProductToCart}>
                        <Text style={componentStyles.bold}>-</Text>
                    </Button>
                    <Text style={[{paddingHorizontal: 5}, componentStyles.bold]}>
                        {getQuantity(product)}
                    </Text>
                    <Button onPress={addProductToCart}>
                        <Text style={componentStyles.bold}>+</Text>
                    </Button>
                    {displayContinueButton && (
                        <LoadingButton
                            disabled={false}
                            onPress={goBack}
                            isLoading={false}
                            loadingText="Continuar"
                            style={{paddingHorizontal: 10}}>
                            Continuar
                        </LoadingButton>
                    )}
                </View>
            ) : (
                <View style={{flex: 1, alignSelf: 'center'}}>
                    <Button iconLeft full onPress={addProductToCart} style={{width: '100%'}}>
                        <Icon color="white" size={24} name="shopping-cart" />
                        <Text>Agregar</Text>
                    </Button>
                </View>
            )}
        </>
    );
};

const componentStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignSelf: 'center',
        width: '50%',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: 30,
    },
    bold: {
        fontFamily: 'Quicksand-Bold',
    },
});

export default memo(QuantityButton);
