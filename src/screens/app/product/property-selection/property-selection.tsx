import React, {useContext, useState} from 'react';
import {FlatList, ListRenderItemInfo, StyleSheet} from 'react-native';
import customVariables from '@app-theme/native-base-theme/variables/material';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from 'navigation/navigation';
import {RouteProp} from '@react-navigation/native';
import {Body, ListItem, View, Text, Right, Container, Toast, Spinner} from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '@app-components/header';
import {IProduct} from '@app-interfaces/product.interface';
import ShoppingCartService from '@app-services/shopping-cart.service';
import {ShoppingCartContext} from '@app-context/shopping-cart.context';
import {default as FullSpinner} from 'react-native-loading-spinner-overlay';

type ScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PropertySelection'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'PropertySelection'>;

interface IProps {
    navigation: ScreenNavigationProp;
    route: ScreenRouteProp;
}

const PropertySelectionScreen: React.FC<IProps> = (props) => {
    const {onGoBack, product, productProperties} = props.route.params;
    const shoppingCartContext = useContext(ShoppingCartContext);
    const [currentSelected, setCurrentSelected] = useState<string>(
        product.selectedPropertyOption || productProperties[0],
    );
    const [loading, setLoading] = useState<boolean>(false);

    const goBackHandler = (selected?: string) => {
        let newProperty = selected || currentSelected;
        onGoBack(newProperty);
        props.navigation.goBack();
    };

    const selectedPropertyHandler = (selected: string) => {
        let updatedProduct = {...product};
        updatedProduct.selectedPropertyOption = selected;
        setCurrentSelected(selected);
        updateProductInServer(updatedProduct);
    };

    const updateProductInServer = (updatedProduct: IProduct) => {
        setLoading(true);
        let body = ShoppingCartService.prepareUpdateShoppingCart([updatedProduct]);
        ShoppingCartService.updateShoppingCart(body)
            .then(() => {
                updateLocalShoppingCart(updatedProduct);
            })
            .catch((error) => {
                console.log('ERROR UPDATING SHOPPING CART PRODUCT:', error);
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
        goBackHandler(updatedProduct.selectedPropertyOption);
    };

    const renderItem = (info: ListRenderItemInfo<string>) => {
        const {item} = info;
        let isSelected = currentSelected === item;
        return (
            <ListItem iconRight onPress={() => selectedPropertyHandler(item)}>
                <Body>
                    <View>
                        <Text
                            style={
                                isSelected ? [componentStyles.selected, componentStyles.bold] : null
                            }>
                            {item}
                        </Text>
                    </View>
                </Body>
                <Right>
                    {isSelected && (
                        <Icon size={24} color={customVariables.brandPrimary} name="check" />
                    )}
                </Right>
            </ListItem>
        );
    };

    return (
        <Container>
            <Header customGoBackHandler={() => goBackHandler()} customBackIcon="close">
                ¿Cómo quieres tu producto?
            </Header>
            <FlatList
                data={productProperties}
                keyExtractor={(item) => item}
                renderItem={renderItem}
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
});

export default PropertySelectionScreen;
