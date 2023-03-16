import React, {memo, useContext, useEffect, useState} from 'react';
import {
    View,
    Tabs,
    Tab,
    Footer,
    Text,
    Card,
    CardItem,
    Button,
    Right,
    Body,
    Toast,
    Spinner,
} from 'native-base';
import {StyleSheet, Platform} from 'react-native';
import QuantityButton from './quantity-button';
import customVariables from '@app-theme/native-base-theme/variables/material';
import {IProduct} from '@app-interfaces/product.interface';
import {ShoppingCartContext} from '@app-context/shopping-cart.context';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from 'navigation/navigation';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppContext} from '@app-context/app.context';
import ShoppingCartService from '@app-services/shopping-cart.service';
import {default as FullSpinner} from 'react-native-loading-spinner-overlay';

type ScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PropertySelection'>;

interface IProps {
    product: IProduct;
    setProduct: React.Dispatch<React.SetStateAction<IProduct | undefined>>;
    mixed?: boolean;
}

const ProductFooter: React.FC<IProps> = (props) => {
    const {mixed, product, setProduct} = props;
    const shoppingCartContext = useContext(ShoppingCartContext);
    const navigation = useNavigation<ScreenNavigationProp>();
    const appContext = useContext(AppContext);
    const [updating, setUpdating] = useState<boolean>(false);

    const changeTabHandler = (event: any) => {
        setUpdating(true);
        const updatedProduct = {...product, buyingBySecondary: event.i === 1};
        setProduct(updatedProduct);
        updateProductInServer(updatedProduct);
    };

    const QtyButtons = () => (
        <View style={componentStyles.buttonsContainer}>
            <QuantityButton
                canGoToProductScreen={false}
                setProduct={setProduct}
                product={product}
                displayContinueButton
            />
        </View>
    );

    const changePropertyHandler = () => {
        if (!appContext.appUser) {
            navigation.navigate('Auth');
            return;
        }
        navigation.push('PropertySelection', {
            productProperties: product.propertyOptions,
            product: product,
            onGoBack: (newProperty: string) => {
                const updated = {...product, selectedPropertyOption: newProperty};
                setProduct(updated);
            },
        });
    };

    const updateProductInServer = (updatedProduct: IProduct) => {
        let body = ShoppingCartService.prepareUpdateShoppingCart([updatedProduct]);
        ShoppingCartService.updateShoppingCart(body)
            .then(() => {
                shoppingCartContext.updateShoppingCart([updatedProduct]);
            })
            .catch((error) => {
                console.log('ERROR UPDATING SHOPPING CART PRODUCT:', error);
                Toast.show({
                    text: 'Ocurrió un problema y no pudimos actualizar tu carrito. Por favor, inténtalo de nuevo.',
                    buttonText: 'Ok',
                    type: 'danger',
                    duration: 10000,
                });
            })
            .finally(() => setUpdating(false));
    };

    return (
        <>
            {product.propertyOptions && product.propertyOptions.length > 0 && (
                <Card
                    transparent
                    style={{
                        borderTopWidth: 1,
                        marginTop: 0,
                        marginRight: 0,
                        marginBottom: 0,
                        marginLeft: 0,
                    }}>
                    <CardItem style={{paddingTop: 0, paddingBottom: Platform.OS === 'ios' ? 0 : 5}}>
                        <Body style={{alignSelf: 'center'}}>
                            <Text>
                                {product.selectedPropertyOption || product.propertyOptions[0]}
                            </Text>
                        </Body>
                        <Right>
                            <Button transparent onPress={changePropertyHandler}>
                                <Text style={{color: customVariables.brandPrimary}}>Cambiar</Text>
                            </Button>
                        </Right>
                    </CardItem>
                </Card>
            )}
            <Footer style={[componentStyles.footer, mixed ? {height: 130} : {height: 90}]}>
                {mixed ? (
                    <View style={{flex: 1, width: '100%'}}>
                        <Tabs
                            locked
                            initialPage={product.buyingBySecondary ? 1 : 0}
                            onChangeTab={changeTabHandler}
                            scrollWithoutAnimation
                            tabBarBackgroundColor="#FFFFFF"
                            tabBarUnderlineStyle={{backgroundColor: customVariables.brandPrimary}}
                            style={{width: '100%'}}>
                            <Tab
                                heading="Por pieza"
                                tabStyle={componentStyles.tabStyle}
                                activeTabStyle={componentStyles.activeTabStyle}
                                activeTextStyle={componentStyles.activeTextStyle}
                                textStyle={componentStyles.textStyle}>
                                {QtyButtons()}
                            </Tab>
                            <Tab
                                heading="Por peso"
                                tabStyle={componentStyles.tabStyle}
                                activeTabStyle={componentStyles.activeTabStyle}
                                activeTextStyle={componentStyles.activeTextStyle}
                                textStyle={componentStyles.textStyle}>
                                {QtyButtons()}
                            </Tab>
                        </Tabs>
                    </View>
                ) : (
                    <View style={componentStyles.buttonsContainer}>{QtyButtons()}</View>
                )}
                <FullSpinner
                    visible={updating}
                    customIndicator={
                        <View
                            style={{
                                width: 100,
                                height: 100,
                                borderRadius: 10,
                                backgroundColor: '#FFFFFF',
                                paddingTop: 10,
                            }}>
                            <Spinner />
                        </View>
                    }
                />
            </Footer>
        </>
    );
};

const componentStyles = StyleSheet.create({
    footer: {
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: customVariables.brandLight,
    },
    activeTabStyle: {backgroundColor: '#FFFFFF'},
    activeTextStyle: {color: customVariables.brandPrimary, fontFamily: 'Quicksand-Bold'},
    textStyle: {fontFamily: 'Quicksand-Bold', color: customVariables.brandPrimary},
    tabStyle: {backgroundColor: '#FFFFFF'},
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        flex: 1,
    },
    addToCartButton: {
        alignSelf: 'center',
        width: '45%',
    },
});

export default memo(ProductFooter);
