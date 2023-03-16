import React, {memo, useContext, useEffect, useState} from 'react';
import {Platform, Pressable, StyleSheet, Vibration} from 'react-native';
import {IProduct} from '@app-interfaces/product.interface';
import {AppContext} from '@app-context/app.context';
import {CompositeNavigationProp, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppStackParamList, RootStackParamList} from 'navigation/navigation';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import customVariables from '@app-theme/native-base-theme/variables/material';
import WishlistService from '@app-services/wishlist.service';
import {Toast} from 'native-base';
import {WishlistContext} from '@app-context/wishlist.context';
import Animated from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

type ScreenNavigationProp = CompositeNavigationProp<
    StackNavigationProp<AppStackParamList, 'Product'>,
    StackNavigationProp<RootStackParamList, 'Auth'>
>;

interface IProps {
    product: IProduct;
}

let doneUpdatingInterval = 10;

const LikeButton: React.FC<IProps> = (props) => {
    const {product} = props;
    const appContext = useContext(AppContext);
    const wishlistContext = useContext(WishlistContext);
    const navigation = useNavigation<ScreenNavigationProp>();
    const [liked, setLiked] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            appContext.setLoading(loading);
        }, 10);
    }, [loading]);

    useEffect(() => {
        try {
            let index = wishlistContext.wishlistItems.map((x) => x.productId).indexOf(product.id);
            setLiked(index > -1 ? 1 : 0);
        } catch (error) {}
    }, [wishlistContext.wishlistItems]);

    const setOrUnsetLikedProduct = () => {
        if (appContext.appUser) {
            setLoading(true);
            WishlistService.setOrUnsetWishlistProduct(product.id)
                .then(({data}) => {
                    setTimeout(() => {
                        wishlistContext.updateWishlist([product], true);
                    }, doneUpdatingInterval);
                })
                .catch((error) => {
                    console.log('ERROR ADDING PRODUCT TO WISHLIST:', error);
                    Toast.show({
                        text: 'Ocurrió un problema y no pudimos agregar el producto a tu wishlist. Por favor, inténtalo más tarde.',
                        buttonText: 'Ok',
                        type: 'danger',
                        duration: 10000,
                    });
                })
                .finally(() => setLoading(false));
        } else {
            navigation.navigate('Auth');
            return;
        }
    };

    return (
        <>
            {/* <Pressable style={componentStyles.container} onPress={() => setLiked((isLiked) => !isLiked)}>
                <EntypoIcon
                    name={liked ? "heart" : "heart-outlined"}
                    size={32}
                    color={liked ? customVariables.brandPrimary : "grey"}
                />
            </Pressable> */}
            <Pressable style={componentStyles.container} onPress={() => setOrUnsetLikedProduct()}>
                <Animated.View
                    style={[StyleSheet.absoluteFillObject, {transform: [{scale: liked ? 0 : 1}]}]}>
                    <Icon name={'favorite-border'} size={32} color={'grey'} />
                </Animated.View>

                <Animated.View style={[{transform: [{scale: liked ? 1 : 0}]}]}>
                    <Icon name={'favorite'} size={32} color={customVariables.brandPrimary} />
                </Animated.View>
            </Pressable>
        </>
    );
};

const componentStyles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        right: 20,
        zIndex: 10,
    },
});

export default memo(LikeButton);
