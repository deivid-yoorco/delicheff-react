import React, {useEffect, useState, useContext, useRef, memo} from 'react';
import {
    StyleSheet,
    ListRenderItemInfo,
    RefreshControl,
    Platform,
    Alert,
    Vibration,
} from 'react-native';
import {Container, Body, Toast, ListItem, View, Text, Button, Footer, H2} from 'native-base';
import Header from '@app-components/header';
import ShoppingCartService from '@app-services/shopping-cart.service';
import {FlatList} from 'react-native-gesture-handler';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppStackParamList, RootStackParamList} from 'navigation/navigation';
import {IProduct} from '@app-interfaces/product.interface';
import FastImage from 'react-native-fast-image';
import {Config} from '@app-config/app.config';
import customVariables from '@app-theme/native-base-theme/variables/material';
import {formatCurrency} from '@app-utils/common-utils';
import {getQuantity} from '@app-utils/product-utils';
import AlertText from '@app-components/alert-text';
import LoadingButton from '@app-components/loading-button';
import CartLoading from './cart-loading';
import {ShoppingCartContext} from '@app-context/shopping-cart.context';
import analytics from '@react-native-firebase/analytics';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconAwesome from 'react-native-vector-icons/FontAwesome5';
import {CompositeNavigationProp} from '@react-navigation/native';

type ScreenNavigationProp = CompositeNavigationProp<
    StackNavigationProp<AppStackParamList, 'ShoppingCart'>,
    StackNavigationProp<RootStackParamList>
>;

interface IProps {
    navigation: ScreenNavigationProp;
}

enum UpdateTypes {
    ADD,
    REMOVE,
}

let doneUpdatingInterval = 1000;
const ShoppingCartScreen: React.FC<IProps> = (props) => {
    const [loadingCart, setLoadingCart] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [updatingProduct, setUpdatingProduct] = useState<boolean>(false);
    const [updatingCart, setUpdatingCart] = useState<boolean>(false);
    const [minOrderAmountOk, setMinOrderAmountOk] = useState<boolean>(false);
    const [minOrderAmountErrorMessage, setMinOrderAmountErrorMessage] = useState<string>('');
    const [shoppingCartItems, setShoppingCartItems] = useState<IProduct[]>([]);
    const [extraCartProducts, setExtraCartProducts] = useState<IProduct[]>([]);
    const [crossSellingProducts, setCrossSellingProducts] = useState<IProduct[]>([]);
    const [updatingTimer, setUpdatingTimer] = useState<any>();
    const shoppingCartContext = useContext(ShoppingCartContext);

    const [productsPendingToUpdate, setProductsPendingToUpdate] = useState<IProduct[]>([]);
    const productsPendingToUpdateRef = useRef(productsPendingToUpdate);

    useEffect(() => {
        loadShoppingCart();
        getExtraCartProducts();
        getCrossSellingProducts();
        getMinOrderAmountErrorMessage();
    }, []);

    useEffect(() => {
        productsPendingToUpdateRef.current = productsPendingToUpdate;
    }, [productsPendingToUpdate]);

    const onRefresh = () => {
        setRefreshing(true);
        loadShoppingCart(true);
        getExtraCartProducts();
    };

    const loadShoppingCart = (refreshing: boolean = false) => {
        setLoadingCart(shoppingCartItems.length === 0 && !refreshing);
        ShoppingCartService.getUserShoppingCart()
            .then(async ({data}) => {
                setShoppingCartItems(data);
                overrideShoppingCartContext(data);
                let body = {
                    items: data.map((x) => {
                        return {
                            item_id: x.sku,
                            item_name: x.name,
                        };
                    }),
                };
                await analytics().logViewCart(body);
            })
            .catch((error) => {
                console.log('ERROR LOADING SHOPPING CART:', error);
                Toast.show({
                    text: 'No fue posible cargar el carrito. Por favor, inténtalo de nuevo más tarde.',
                    buttonText: 'Ok',
                    type: 'danger',
                    duration: 5000,
                });
            })
            .finally(() => {
                setLoadingCart(false);
                setRefreshing(false);
                setUpdatingCart(false);
            });
    };

    const getExtraCartProducts = () => {
        ShoppingCartService.getExtraCartProducts()
            .then(({data}) => {
                setExtraCartProducts(data);
            })
            .catch((error) => console.log('ERROR GETTING EXTRA CART PRODUCTS:', error));
    };

    const getCrossSellingProducts = () => {
        ShoppingCartService.getCrossSellingProducts()
            .then(({data}) => {
                setCrossSellingProducts(data);
            })
            .catch((error) => console.log('ERROR GETTING CROSS SELLING PRODUCTS:', error));
    };

    const getMinOrderAmountErrorMessage = () => {
        ShoppingCartService.getMinOrderAmountErrorMessage()
            .then(({data}) => {
                if (data.trim() != '') setMinOrderAmountOk(false);
                else setMinOrderAmountOk(true);
                setMinOrderAmountErrorMessage(data);
            })
            .catch((error) => console.log('ERROR GETTING MIN ORDER AMOUNT:', error))
            .finally(() => setUpdatingProduct(false));
    };

    const overrideShoppingCartContext = (data: IProduct[]) => {
        shoppingCartContext.setShoppingCartItems(
            data.map((x) => {
                return {
                    productId: x.id,
                    quantity: x.currentCartQuantity,
                    buyingBySecondary: x.buyingBySecondary,
                    selectedPropertyOption: x.selectedPropertyOption,
                    pictureUrl: x.pictureUrl,
                };
            }),
        );
    };

    const updateShoppingCart = (index: number, isExtraCartProduct: boolean) => {
        let currentItems = isExtraCartProduct ? [...extraCartProducts] : [...shoppingCartItems];
        let originalItem = currentItems[index];
        let originalQty = originalItem.currentCartQuantity;
        let originalSubtotal = originalItem.subTotal;
        props.navigation.push('QuantitySelection', {
            product: originalItem,
            onGoBack(updatedProduct: IProduct) {
                if (updatedProduct.currentCartQuantity === 0 && isExtraCartProduct) {
                    updatedProduct.subTotal = 0;
                    updatedProduct.itemDiscount = 0;
                    currentItems[index] = updatedProduct;
                } else if (updatedProduct.currentCartQuantity <= 0) {
                    updatedProduct.currentCartQuantity = 0;
                    currentItems.splice(index, 1);
                } else {
                    updatedProduct.subTotal =
                        originalQty > 0
                            ? (updatedProduct.currentCartQuantity * originalSubtotal) / originalQty
                            : updatedProduct.price;
                    updatedProduct.itemDiscount =
                        originalQty > 0
                            ? (updatedProduct.currentCartQuantity * updatedProduct.itemDiscount) /
                              originalQty
                            : updatedProduct.itemDiscount;
                    currentItems[index] = updatedProduct;
                }

                isExtraCartProduct
                    ? setExtraCartProducts(currentItems)
                    : setShoppingCartItems(currentItems);

                getMinOrderAmountErrorMessage();
            },
        });
    };

    const updatePendingToUpdateProducts = (elementToUpdate: IProduct) => {
        let currentPending = [...productsPendingToUpdate];
        let index = currentPending.map((x) => x.id).indexOf(elementToUpdate.id);
        if (index === -1) currentPending.push(elementToUpdate);
        else currentPending[index] = elementToUpdate;
        setProductsPendingToUpdate(currentPending);
    };

    const updateDbCart = (items: IProduct[]) => {
        let body = ShoppingCartService.prepareUpdateShoppingCart(items);
        ShoppingCartService.updateShoppingCart(body)
            .then(() => console.log('PRODUCT CART UPDATED'))
            .catch((error) => {
                Vibration.vibrate(400);
                console.log('ERROR UPDATING SHOPPING CART PRODUCT:', error);
                onRefresh();
                Toast.show({
                    text: 'Ocurrió un problema y no pudimos actualizar tu carrito. Por favor, inténtalo de nuevo.',
                    buttonText: 'Ok',
                    type: 'danger',
                    duration: 10000,
                });
            })
            .finally(() => getMinOrderAmountErrorMessage());
    };

    const onBackToCart = () => {
        setCrossSellingProducts([]);
        onRefresh();
    };

    const goToProduct = (product: IProduct) => {
        if (product.warnings?.length > 0) return;
        props.navigation.push('Product', {
            product,
            shouldLoadProduct: true,
            onGoBack: (updatedProduct: IProduct) => {
                let current = [...shoppingCartItems];
                let index = current.map((x) => x.cartItemId).indexOf(updatedProduct.cartItemId);
                if (index === -1) return;
                current[index] = updatedProduct;
                setShoppingCartItems(current);
                setUpdatingCart(true);
                setTimeout(() => {
                    loadShoppingCart(true);
                }, 500);
            },
        });
    };

    const renderItem = (info: ListRenderItemInfo<IProduct>) => {
        const {item} = info;
        let discount =
            item.itemDiscount > 0
                ? item.itemDiscount
                : item.oldPrice > 0
                ? (item.oldPrice - item.price) * item.currentCartQuantity
                : 0;
        let price =
            item.isExtraCartProduct && item.currentCartQuantity === 0 ? item.price : item.subTotal;
        return (
            <ListItem
                iconRight
                style={{marginRight: 15}}
                onPress={() => (!item.giftProductEnable ? goToProduct(item) : {})}>
                <Body>
                    <View style={{flexDirection: 'row'}}>
                        <View style={{width: '40%', flexDirection: 'row', marginRight: 50}}>
                            <View style={{alignSelf: 'center'}}>
                                <FastImage
                                    source={{uri: Config.apiUrl + item.pictureUrl}}
                                    style={{height: 50, width: 50}}
                                />
                            </View>
                            <View style={{alignSelf: 'center', marginLeft: 15}}>
                                <Text>{item.name}</Text>
                                {item.selectedPropertyOption !== null &&
                                    item.selectedPropertyOption !== '' && (
                                        <Text note numberOfLines={1}>
                                            {item.selectedPropertyOption}
                                        </Text>
                                    )}
                                <Text style={{fontFamily: 'Quicksand-Bold'}} numberOfLines={1}>
                                    {item.giftProductEnable
                                        ? 'GRATIS'
                                        : price == 0 && updatingCart
                                        ? '...'
                                        : '$' + formatCurrency(price)}
                                </Text>
                            </View>
                        </View>
                        <View style={{width: '50%', paddingLeft: 15, alignSelf: 'center'}}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    width: '100%',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}>
                                <Button
                                    disabled={refreshing || item.giftProductEnable}
                                    onPress={() =>
                                        updateShoppingCart(info.index, item.isExtraCartProduct)
                                    }>
                                    <Text style={componentStyles.bold}>-</Text>
                                </Button>
                                <Text
                                    style={{
                                        fontFamily: 'QuickSand-Bold',
                                        width: '50%',
                                        textAlign: 'center',
                                        paddingHorizontal: 5,
                                    }}>
                                    {getQuantity(item)}
                                </Text>
                                <Button
                                    disabled={refreshing || item.giftProductEnable}
                                    onPress={() =>
                                        updateShoppingCart(info.index, item.isExtraCartProduct)
                                    }>
                                    <Text style={componentStyles.bold}>+</Text>
                                </Button>
                            </View>
                        </View>
                    </View>
                    {item.warnings?.length > 0 && (
                        <Text style={componentStyles.warningText} note>
                            {item.warnings.join(', ')}
                        </Text>
                    )}
                    {discount > 0 && item.warnings?.length === 0 && (
                        <View
                            style={{
                                flexDirection: 'row',
                                alignSelf: 'center',
                                marginTop: 10,
                                width: '100%',
                            }}>
                            <Icon
                                style={{alignSelf: 'center'}}
                                size={18}
                                name="thumb-up"
                                color={customVariables.brandSuccess}
                            />
                            <Text style={componentStyles.saveAmount}>
                                Estás ahorrando ${formatCurrency(discount)} en este producto
                            </Text>
                        </View>
                    )}
                </Body>
            </ListItem>
        );
    };

    const getSubTotal = () => {
        let subtotal = 0;
        if (shoppingCartItems.length > 0)
            subtotal += shoppingCartItems.map((x) => x.subTotal).reduce((a, b) => a + b);

        if (extraCartProducts.length > 0)
            subtotal += extraCartProducts.map((x) => x.subTotal).reduce((a, b) => a + b);

        return subtotal;
    };

    const goToCheckout = () => {
        let products = shoppingCartItems;
        if (
            extraCartProducts.length > 0 &&
            extraCartProducts.filter((x) => x.currentCartQuantity > 0).length > 0
        )
            products = shoppingCartItems.concat(extraCartProducts);

        if (crossSellingProducts.length > 0) {
            props.navigation.push('CrossSellProducts', {
                crossSellProducts: crossSellingProducts,
                finalProducts: products,
                onBackToCart,
            });
        } else {
            props.navigation.push('Checkout', {});
        }
    };

    const deleteAllItemsAlert = () => {
        Alert.alert(
            'Eliminar productos del carrito',
            '¿Confirmas que deseas eliminar todos los productos de tu carrito?',
            [{text: 'No'}, {text: 'Si', onPress: deleteAllItems}],
            {cancelable: false},
        );
    };

    const deleteAllItems = () => {
        setLoadingCart(true);
        ShoppingCartService.deleteShopingCart()
            .then(() => {
                shoppingCartContext.clearShoppingCart();
                setShoppingCartItems([]);
            })
            .catch((error) => console.log('ERROR DELETING SHOPPING CART', error))
            .finally(() => setLoadingCart(false));
    };

    return (
        <Container>
            <Header canGoBack>Mi carrito</Header>
            {loadingCart ? (
                <CartLoading />
            ) : (
                <FlatList
                    ListHeaderComponent={
                        <>
                            {shoppingCartItems.length === 0 && !refreshing && (
                                <AlertText>No tienes productos en el carrito.</AlertText>
                            )}
                            {!minOrderAmountOk && (
                                <AlertText style={componentStyles.warningText}>
                                    {minOrderAmountErrorMessage}
                                </AlertText>
                            )}
                        </>
                    }
                    refreshControl={
                        <RefreshControl
                            colors={[customVariables.brandPrimary]}
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                    data={shoppingCartItems}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    ListFooterComponent={
                        <>
                            {shoppingCartItems.length > 1 && (
                                <Button
                                    style={{width: '80%'}}
                                    transparent
                                    onPress={deleteAllItemsAlert}>
                                    <Icon
                                        size={15}
                                        name="close"
                                        color={customVariables.brandPrimary}
                                    />
                                    <Text style={{fontSize: 10}}>
                                        Borrar todos los productos del carrito
                                    </Text>
                                </Button>
                            )}
                            {extraCartProducts.length > 0 && (
                                <FlatList
                                    ListHeaderComponent={
                                        <View style={componentStyles.extraProductTitleContainer}>
                                            <Text
                                                style={[
                                                    componentStyles.extraProductTitle,
                                                    componentStyles.bold,
                                                ]}>
                                                Recibe tu pedido en bolsa ecológica. Agrégala a tu
                                                pedido.
                                            </Text>
                                            <IconAwesome name="leaf" size={20} color="#FFFFFF" />
                                        </View>
                                    }
                                    data={extraCartProducts}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={renderItem}
                                    ListFooterComponent={
                                        <>
                                            {!minOrderAmountOk && (
                                                <AlertText style={componentStyles.warningText}>
                                                    {minOrderAmountErrorMessage}
                                                </AlertText>
                                            )}
                                        </>
                                    }
                                />
                            )}
                        </>
                    }
                />
            )}
            {shoppingCartItems.length > 0 && (
                <Footer style={componentStyles.footer}>
                    <View style={componentStyles.buttonsContainer}>
                        <View style={componentStyles.subTotal}>
                            <H2 style={{textAlign: 'center'}}>
                                {updatingCart ? '...' : `$${formatCurrency(getSubTotal())}`}
                            </H2>
                        </View>
                        <LoadingButton
                            isLoading={updatingProduct || refreshing || updatingCart}
                            loadingText=""
                            disabled={
                                updatingProduct ||
                                shoppingCartItems.map((x) => x.warnings).filter((x) => x.length > 0)
                                    .length > 0 ||
                                refreshing ||
                                !minOrderAmountOk
                            }
                            iconLeft
                            full
                            style={componentStyles.continueButton}
                            onPress={goToCheckout}>
                            Continuar
                        </LoadingButton>
                    </View>
                </Footer>
            )}
        </Container>
    );
};

const componentStyles = StyleSheet.create({
    footer: {
        height: 90,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: customVariables.brandLight,
    },
    buttonsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        flex: 1,
    },
    continueButton: {
        alignSelf: 'center',
        width: '50%',
    },
    subTotal: {
        alignSelf: 'center',
        width: '50%',
    },
    warningText: {
        color: customVariables.brandDanger,
        marginTop: 10,
        textAlign: 'center',
        fontFamily: 'Quicksand-Bold',
    },
    bold: {
        fontFamily: 'Quicksand-Bold',
    },
    saveAmount: {
        color: customVariables.brandSuccess,
        fontSize: 14,
        marginVertical: 10,
        fontFamily: 'Quicksand-Bold',
        marginLeft: 10,
    },
    extraProductTitleContainer: {
        backgroundColor: customVariables.brandPrimary,
        alignSelf: 'center',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        width: '90%',
        height: 70,
        marginTop: 15,
        borderRadius: 10,
        flexDirection: 'row',
    },
    extraProductTitle: {
        color: '#FFFFFF',
        marginRight: 10,
        paddingBottom: Platform.OS === 'ios' ? 0 : 5,
        width: '80%',
    },
});

export default memo(ShoppingCartScreen);
