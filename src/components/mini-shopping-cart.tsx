import React, { useContext, useEffect, memo } from 'react';
import { StyleSheet, Platform, TouchableWithoutFeedback } from 'react-native';
import { Button, Badge, Text, View } from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';
import customVariables from '@app-theme/native-base-theme/variables/material';
import { AppContext } from '@app-context/app.context';
import ShoppingCartService from '@app-services/shopping-cart.service';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList, RootStackParamList } from 'navigation/navigation';
import { ShoppingCartContext } from '@app-context/shopping-cart.context';
import WishlistService from '@app-services/wishlist.service';
import { WishlistContext } from '@app-context/wishlist.context';
import { IWishlistItem } from '@app-interfaces/shopping-cart.interface';

type ScreenNavigationProp = CompositeNavigationProp<StackNavigationProp<AppStackParamList, 'ShoppingCart'>, StackNavigationProp<RootStackParamList, 'Auth'>>;

interface IProps { }

const MiniShoppingCart: React.FC<IProps> = (props) => {

    const shoppingCartContext = useContext(ShoppingCartContext);
    const wishlistContext = useContext(WishlistContext);
    const appContext = useContext(AppContext);
    const navigation = useNavigation<ScreenNavigationProp>();

    useEffect(() => {
        if (appContext.appUser) {
            ShoppingCartService.getShoppingCartData()
                .then(({ data }) => {
                    shoppingCartContext.setShoppingCartItems(data);
                })
                .catch((error) => {
                    console.log('ERROR GETTING SHOPPING CART QUANTITY:', error);
                });
            WishlistService.getWishlistData()
                .then(({ data }) => {
                    setTimeout(() => {
                        wishlistContext.setWishlistItems(data);
                    }, 1000);
                })
                .catch((error) => {
                    console.log('ERROR GETTING SHOPPING CART QUANTITY:', error);
                });
        }
    }, [appContext.appUser]);

    const goToCart = () => {
        if (!appContext.appUser) {
            navigation.navigate('Auth');
            return;
        }
        navigation.push('ShoppingCart');
    };

    return (
        <Button transparent onPress={goToCart}>
            <Icon color={customVariables.brandPrimary}
                size={24}
                name='shopping-cart'
            />
            {shoppingCartContext.shoppingCartItems.length > 0 &&
                <Badge style={componentStyles.badge}>
                    <Text>{shoppingCartContext.shoppingCartItems.length}</Text>
                </Badge>
            }
        </Button>
    )
};

const componentStyles = StyleSheet.create({
    badge: {
        transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }],
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: customVariables.brandDanger
    }
});

export default memo(MiniShoppingCart);