import React, {memo, useContext, useEffect, useRef, useState} from 'react';
import {StyleSheet, ListRenderItemInfo, Vibration, Alert} from 'react-native';
import customVariables from '@app-theme/native-base-theme/variables/material';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from 'navigation/navigation';
import {Container, ListItem, Body, View, Right, Text, Spinner, Toast} from 'native-base';
import Header from '@app-components/header';
import {FlatList} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {ISelectListItem} from '@app-interfaces/common.interface';
import ProductService from '@app-services/product.service';
import {default as FullSpinner} from 'react-native-loading-spinner-overlay';
import {IProduct} from '@app-interfaces/product.interface';
import ShoppingCartService from '@app-services/shopping-cart.service';
import {ShoppingCartContext} from '@app-context/shopping-cart.context';
import {formatCurrency} from '@app-utils/common-utils';

type ScreenNavigationProp = StackNavigationProp<RootStackParamList, 'QuantitySelection'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'QuantitySelection'>;

interface IProps {
    navigation: ScreenNavigationProp;
    route: ScreenRouteProp;
}

const getItemLayout = (data: number[] | null | undefined, index: number) => {
    return {
        length: componentStyles.listItem.height,
        offset: componentStyles.listItem.height * index,
        index,
    };
};

const elementsPerPage = 20;
const QuantitySelectionScreen: React.FC<IProps> = (props) => {
    const {product, onGoBack} = props.route.params;
    const shoppingCartContext = useContext(ShoppingCartContext);
    const [page, setPage] = useState<number>(0);
    const [canLoadMore, setCanLoadMore] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentSelected, setCurrentSelected] = useState<number>(product.currentCartQuantity);
    const [productQuantities, setProductQuantities] = useState<ISelectListItem[]>([]);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);

    const flatListRef = useRef<any>();

    useEffect(() => {
        loadQuantity(0);
    }, []);

    const loadQuantity = (currentPage: number) => {
        if (!canLoadMore) return;
        setLoadingMore(currentPage > 0);
        let elementsQty =
            product.currentCartQuantity > elementsPerPage
                ? elementsPerPage + product.currentCartQuantity
                : elementsPerPage;
        ProductService.getProductQuantityList(
            product.stock,
            product.buyingBySecondary,
            product.equivalenceCoefficient,
            product.weightInterval,
            currentPage,
            elementsQty,
        )
            .then(({data}) => {
                let current =
                    currentPage === 0
                        ? product.currentCartQuantity > 0
                            ? [{text: '    Eliminar producto del carrito', value: '0'}]
                            : []
                        : [...productQuantities];
                let updatedQty = [...current, ...data];
                setProductQuantities(updatedQty);
                setPage(currentPage + 1);
                setCanLoadMore(data.length <= elementsPerPage);

                if (currentPage == 0 && product.currentCartQuantity > 0)
                    scrollToSelected(updatedQty);
                else setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
                console.log('ERROR LOADING QUANTITY LIST', error);
            })
            .finally(() => {
                setLoadingMore(false);
            });
    };

    const scrollToSelected = (values: ISelectListItem[]) => {
        let index = values.map((x) => x.value).indexOf(product.currentCartQuantity.toString());
        if (index > 3) {
            setTimeout(() => {
                flatListRef.current.scrollToIndex({index: index - 3});
                setLoading(false);
            }, 500);
        } else setLoading(false);
    };

    const goBackHandler = () => {
        props.navigation.goBack();
    };

    const selectedQuantityHandler = (selected: ISelectListItem) => {
        let updatedProduct = {...product};
        const selectedValue = parseInt(selected.value);
        updatedProduct.currentCartQuantity = selectedValue;
        setCurrentSelected(selectedValue);
        if (selected.value == '0') deleteItemAlert(updatedProduct);
        else updateCartInServer(updatedProduct);
    };

    const deleteItemAlert = (updatedProduct: IProduct) => {
        Alert.alert(
            'Eliminar producto',
            '¿Confirmas que deseas eliminar el producto "' + product.name + '" de tu carrito?',
            [
                {text: 'No'},
                {
                    text: 'Si',
                    onPress: () => updateCartInServer(updatedProduct),
                },
            ],
            {cancelable: false},
        );
    };

    const updateCartInServer = (updatedProduct: IProduct) => {
        setLoading(true);
        let body = ShoppingCartService.prepareUpdateShoppingCart([updatedProduct]);
        ShoppingCartService.updateShoppingCart(body)
            .then(() => {
                updateLocalShoppingCart(updatedProduct);
            })
            .catch((error) => {
                console.log('ERROR UPDATING SHOPPING CART PRODUCT:', error);
                Vibration.vibrate(400);
                Toast.show({
                    text: 'Ocurrió un problema y no pudimos actualizar tu carrito. Por favor, inténtalo de nuevo.',
                    buttonText: 'Ok',
                    type: 'danger',
                    duration: 10000,
                });
                setLoading(false);
            });
    };

    const updateLocalShoppingCart = (updatedProduct: IProduct) => {
        shoppingCartContext.updateShoppingCart([updatedProduct]);
        onGoBack(updatedProduct);
        props.navigation.goBack();
    };

    const renderItem = (info: ListRenderItemInfo<ISelectListItem>) => {
        const {item} = info;
        let isSelected = currentSelected.toString() === item.value;
        return (
            <ListItem
                style={componentStyles.listItem}
                iconRight
                onPress={() => selectedQuantityHandler(item)}>
                <Body>
                    {item.value == '0' && product.currentCartQuantity > 0 ? (
                        <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                            <Icon size={24} name="close" color={componentStyles.remove.color} />
                            <Text style={componentStyles.remove}>{item.text}</Text>
                        </View>
                    ) : (
                        <View>
                            <Text
                                style={
                                    isSelected
                                        ? [componentStyles.selected, componentStyles.bold]
                                        : null
                                }>
                                Comprar {item.text}
                            </Text>
                            {product.unitPrice > 0 && (
                                <Text style={{color: '#afafaf'}}>
                                    Precio: ${getSubtotal(product, parseInt(item.value))}
                                </Text>
                            )}
                        </View>
                    )}
                </Body>
                <Right>
                    {isSelected && (
                        <Icon size={24} color={customVariables.brandPrimary} name="check" />
                    )}
                </Right>
            </ListItem>
        );
    };

    const getSubtotal = (product: IProduct, qty: number) => {
        let discount =
            product.currentCartQuantity == 0
                ? 0
                : (product.itemDiscount / product.currentCartQuantity) * qty;
        // We use price for products with weigth interval > 0, and unit price for others
        let subtotal = product.unitPrice * qty;
        if (product.equivalenceCoefficient > 0 && product.buyingBySecondary)
            subtotal = (qty * product.price) / product.equivalenceCoefficient - discount;
        else if (product.weightInterval > 0)
            subtotal = (qty * product.weightInterval * product.price) / 1000 - discount;
        return formatCurrency(subtotal);
    };

    return (
        <Container>
            <Header customGoBackHandler={goBackHandler} customBackIcon="close">
                ¿Cuánto producto quieres?
            </Header>
            <FlatList
                data={productQuantities}
                ref={flatListRef}
                keyExtractor={(item) => item.value}
                renderItem={renderItem}
                onEndReached={canLoadMore && !loadingMore ? () => loadQuantity(page) : null}
                onEndReachedThreshold={0.3}
                getItemLayout={getItemLayout}
                ListHeaderComponent={
                    <Text style={{marginHorizontal: 10}}>
                        Selecciona la cantidad del producto{' '}
                        <Text style={componentStyles.bold}>{product.name}</Text> que deseas agregar
                        a tu carrito:
                    </Text>
                }
                ListFooterComponent={
                    <>{loadingMore ? <Spinner /> : <View style={{marginBottom: 80}}></View>}</>
                }
            />
            <FullSpinner
                visible={loading}
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
        </Container>
    );
};

const componentStyles = StyleSheet.create({
    bold: {
        fontFamily: 'Quicksand-Bold',
    },
    selected: {
        color: customVariables.brandPrimary,
    },
    remove: {
        color: customVariables.brandDanger,
        paddingBottom: 3,
    },
    listItem: {
        height: 70,
    },
});

export default memo(QuantitySelectionScreen);
