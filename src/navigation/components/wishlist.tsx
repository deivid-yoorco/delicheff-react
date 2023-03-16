import React, { useContext } from 'react';
import { StyleSheet, TouchableWithoutFeedback, Platform } from 'react-native';
import { View, Text, Right, Button, Badge } from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList, RootStackParamList } from 'navigation/navigation';
import customVariables from '@app-theme/native-base-theme/variables/material';
import { AppContext } from '@app-context/app.context';
import { WishlistContext } from '@app-context/wishlist.context';
import EntypoIcon from 'react-native-vector-icons/Entypo';

type ScreenNavigationProp = CompositeNavigationProp<StackNavigationProp<AppStackParamList, 'Wishlist'>, StackNavigationProp<RootStackParamList, 'Auth'>>;
interface IProps { }

const colorTextTheme = 'rgba(28,28,30,0.68)';

const DrawerWishlist: React.FC<IProps> = (props) => {

    const navigation = useNavigation<ScreenNavigationProp>();
    const wishlistContext = useContext(WishlistContext);
    const appContext = useContext(AppContext);

    const goToWishlist = () => {
        if (!appContext.appUser) {
            navigation.navigate('Auth');
            return;
        }
        navigation.push('Wishlist');
    };

    return (
        <TouchableWithoutFeedback onPress={goToWishlist}>
            <View style={componentStyles.viewContent}>
                <EntypoIcon
                    name={"heart"}
                    size={24}
                    color={colorTextTheme}
                    style={componentStyles.iconItem}
                />
                <Text style={[componentStyles.titleTitle, componentStyles.bold]}>{'Mi wishlist'}</Text>
                <Right style={{ marginRight: 15 }}>
                    {wishlistContext.wishlistItems.length > 0 &&
                        <Badge style={componentStyles.badge}>
                            <Text>{wishlistContext.wishlistItems.length}</Text>
                        </Badge>
                    }
                </Right>
            </View>
        </TouchableWithoutFeedback>
    )
};

const componentStyles = StyleSheet.create({
    viewContent: {
        flexDirection: 'row',
        marginHorizontal: 10,
        paddingVertical: 10,
        marginTop: 5
    },
    iconItem: {
        marginLeft: '3%',
        marginRight: '12%',
        marginTop: 3,
        marginBottom: 2
    },
    titleTitle: {
        marginTop: 3,
        color: colorTextTheme,
        fontSize: 14.5
    },
    bold: {
        fontFamily: 'Quicksand-Bold'
    },
    badge: {
        transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }],
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? -12 : -15,
        right: -5,
        backgroundColor: customVariables.brandPrimary
    }
});

export default DrawerWishlist;