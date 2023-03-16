import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, Platform} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList, AppStackParamList} from 'navigation/navigation';
import {CompositeNavigationProp, RouteProp} from '@react-navigation/native';
import {Container, Content, View, Text, H1, H2, Toast} from 'native-base';
import Header from '@app-components/header';
import FastImage from 'react-native-fast-image';
import {Config} from '@app-config/app.config';
import customVariables from '@app-theme/native-base-theme/variables/material';
import ProductFooter from '@app-components/product-footer';
import {formatCurrency} from '@app-utils/common-utils';
import {IProduct} from '@app-interfaces/product.interface';
import ProductService from '@app-services/product.service';
import ProductLoading from './product-loading';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {getPriceExtraString} from '@app-utils/product-utils';

type ScreenNavigationProp = CompositeNavigationProp<
    StackNavigationProp<AppStackParamList, 'Product'>,
    StackNavigationProp<RootStackParamList, 'Auth'>
>;
type ScreenRouteProp = RouteProp<AppStackParamList, 'Product'>;

interface IProps {
    navigation: ScreenNavigationProp;
    route: ScreenRouteProp;
}

const ProductScreen: React.FC<IProps> = (props) => {
    const {product, shouldLoadProduct, onGoBack, productId} = props.route.params;
    const [currentProduct, setCurrentProduct] = useState<IProduct | undefined>(product);
    const [loadingProduct, setLoadinProduct] = useState<boolean>(
        shouldLoadProduct ? shouldLoadProduct : false,
    );
    let productRef = useRef(currentProduct);

    useEffect(() => {
        if (!onGoBack) return;
        const backAction = () => {
            if (productRef.current) onGoBack(productRef.current);
            return;
        };

        const unsubscribe = props.navigation.addListener('beforeRemove', backAction);

        return unsubscribe;
    }, []);

    useEffect(() => {
        productRef.current = currentProduct;
    }, [currentProduct]);

    useEffect(() => {
        if (shouldLoadProduct) getProduct();
    }, []);

    const getProduct = () => {
        if (!product && !productId) return;
        const id = product ? product.id : productId ? productId : 0;
        ProductService.getProduct(id)
            .then(({data}) => {
                data.cartItemId = currentProduct ? currentProduct.cartItemId : 0;
                data.warnings = currentProduct ? currentProduct.warnings : [];
                setCurrentProduct(data);
            })
            .catch((error) => {
                console.log('ERROR LOADING PRODUCT:', error);
                Toast.show({
                    text: 'Ocurrió un problema al cargar el producto. Por favor, inténtalo más tarde.',
                    buttonText: 'Ok',
                    type: 'danger',
                    duration: 5000,
                });
            })
            .finally(() => setLoadinProduct(false));
    };

    const goBackHandler = () => {
        props.navigation.goBack();
    };

    return (
        <Container>
            <Header customGoBackHandler={goBackHandler}>{currentProduct?.name}</Header>
            {loadingProduct || !currentProduct ? (
                <ProductLoading />
            ) : (
                <>
                    <Content>
                        <View style={{alignItems: 'center'}}>
                            <FastImage
                                source={{uri: Config.apiUrl + currentProduct.pictureUrl}}
                                style={{height: 300, width: 300}}
                            />
                        </View>
                        <View style={componentStyles.titleContainer}>
                            <H1>{currentProduct.name}</H1>
                            <Text>
                                {currentProduct.shortDescription ?? currentProduct.name} - Todos
                                nuestros precios incluyen IVA.
                            </Text>
                            {currentProduct.discount > 0 ? (
                                <>
                                    <View style={{flexDirection: 'row', marginTop: 5}}>
                                        <Text style={componentStyles.oldPrice}>
                                            ${formatCurrency(currentProduct.price)}
                                            {getPriceExtraString(currentProduct)}
                                        </Text>
                                        <Text style={componentStyles.price}>
                                            $
                                            {formatCurrency(
                                                currentProduct.price - currentProduct.discount,
                                            )}
                                            {getPriceExtraString(currentProduct)}
                                        </Text>
                                    </View>
                                    <View style={{flexDirection: 'row'}}>
                                        <Icon
                                            style={{alignSelf: 'center'}}
                                            size={24}
                                            name="thumb-up"
                                            color={customVariables.brandSuccess}
                                        />
                                        <Text style={componentStyles.saveAmount}>
                                            Estás ahorrando $
                                            {formatCurrency(currentProduct.discount)}
                                            {getPriceExtraString(currentProduct)}
                                        </Text>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <View style={{flexDirection: 'row'}}>
                                        {currentProduct.oldPrice > 0 && (
                                            <H2 style={componentStyles.oldPrice}>
                                                ${formatCurrency(currentProduct.oldPrice)}
                                            </H2>
                                        )}
                                        <H2>
                                            ${formatCurrency(currentProduct.price)}
                                            {getPriceExtraString(currentProduct)}
                                        </H2>
                                    </View>
                                    {currentProduct.oldPrice > 0 &&
                                        currentProduct.oldPrice > currentProduct.price && (
                                            <View style={{flexDirection: 'row'}}>
                                                <Icon
                                                    style={{alignSelf: 'center'}}
                                                    size={24}
                                                    name="thumb-up"
                                                    color={customVariables.brandSuccess}
                                                />
                                                <Text style={componentStyles.saveAmount}>
                                                    Estás ahorrando $
                                                    {formatCurrency(
                                                        currentProduct.oldPrice -
                                                            currentProduct.price,
                                                    )}
                                                    {getPriceExtraString(currentProduct)}
                                                </Text>
                                            </View>
                                        )}
                                </>
                            )}
                        </View>
                        <View style={{marginBottom: 30}}></View>
                    </Content>
                    <ProductFooter
                        mixed={currentProduct.equivalenceCoefficient > 0}
                        product={currentProduct}
                        setProduct={setCurrentProduct}
                    />
                </>
            )}
        </Container>
    );
};

const componentStyles = StyleSheet.create({
    titleContainer: {
        marginTop: 15,
    },
    picker: {
        width: undefined,
        fontFamily: 'Quicksand-Regular',
        marginTop: Platform.OS === 'ios' ? 0 : 15,
    },
    title: {
        fontSize: 25,
        fontFamily: 'Quicksand-Bold',
    },
    price: {
        fontSize: 25,
        alignSelf: 'center',
        fontFamily: 'Quicksand-Bold',
    },
    oldPrice: {
        color: customVariables.brandDanger,
        textDecorationLine: 'line-through',
        marginRight: 15,
        fontSize: 15,
        alignSelf: 'center',
    },
    saveAmount: {
        color: customVariables.brandSuccess,
        fontSize: 15,
        marginVertical: 10,
        fontFamily: 'Quicksand-Bold',
        alignSelf: 'center',
        marginLeft: 10,
    },
});

export default ProductScreen;
