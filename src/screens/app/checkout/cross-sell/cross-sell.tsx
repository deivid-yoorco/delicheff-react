import React, {memo, useEffect, useState} from 'react';
import {FlatList, ListRenderItemInfo, StyleSheet} from 'react-native';
import customVariables from '@app-theme/native-base-theme/variables/material';
import {Container, View, Text, Footer, H2} from 'native-base';
import Header from '@app-components/header';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppStackParamList} from 'navigation/navigation';
import {RouteProp} from '@react-navigation/native';
import {IProduct} from '@app-interfaces/product.interface';
import ProductCard from '@app-components/product-card';
import {useContext} from 'react';
import {AppContext} from '@app-context/app.context';
import LoadingButton from '@app-components/loading-button';
import {formatCurrency} from '@app-utils/common-utils';
import {ShoppingCartContext} from '@app-context/shopping-cart.context';
import {boolean} from 'yup';

type ScreenNavigationProp = StackNavigationProp<AppStackParamList, 'CrossSellProducts'>;
type ScreenRouteProp = RouteProp<AppStackParamList, 'CrossSellProducts'>;

interface IProps {
    navigation: ScreenNavigationProp;
    route: ScreenRouteProp;
}

const CrossSellScreen: React.FC<IProps> = (props) => {
    const {crossSellProducts, onBackToCart} = props.route.params;

    const [addingProduct, setAddingProduct] = useState<boolean>(false);

    const context = useContext(AppContext);

    useEffect(() => {
        props.navigation.addListener('beforeRemove', (e) => {
            if (e.data.action.type === 'GO_BACK') onBackToCart();
        });
    }, []);

    const renderItem = (info: ListRenderItemInfo<IProduct>) => {
        return (
            <View style={{width: '50%'}}>
                <ProductCard
                    product={info.item}
                    shouldLoadProduct
                    addingProduct={setAddingProduct}
                />
            </View>
        );
    };

    const goToCheckout = () => {
        props.navigation.push('Checkout', {onBackToCart});
    };

    return (
        <Container>
            <Header canGoBack={true}>¿Olvidaste algo?</Header>
            <FlatList
                data={crossSellProducts}
                renderItem={renderItem}
                numColumns={2}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={
                    <View style={{marginHorizontal: 15, marginBottom: 15}}>
                        <Text style={{fontFamily: 'Quicksand-Bold'}}>
                            {context.appUser?.firstName}, en esta ocasión no estás llevando estos
                            productos que siempre compras. ¿Gustas agregarlos a tu carrito?
                        </Text>
                    </View>
                }
            />
            <Footer style={componentStyles.footer}>
                <View style={componentStyles.buttonsContainer}>
                    <LoadingButton
                        isLoading={addingProduct}
                        loadingText=""
                        disabled={addingProduct}
                        iconLeft
                        full
                        style={componentStyles.continueButton}
                        onPress={goToCheckout}>
                        Continuar al checkout
                    </LoadingButton>
                </View>
            </Footer>
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
    subTotal: {
        alignSelf: 'center',
        width: '50%',
    },
    continueButton: {
        alignSelf: 'center',
        width: '100%',
    },
});

export default memo(CrossSellScreen);
