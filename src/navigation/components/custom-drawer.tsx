import React, { } from 'react';
import { StyleSheet, Image, Linking } from 'react-native';
import { Button, Text, Thumbnail, View } from 'native-base';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { CommonActions, DrawerActions, DrawerNavigationState, NavigationHelpers, useLinkBuilder } from '@react-navigation/native';
import { DrawerNavigationEventMap, DrawerDescriptorMap } from '@react-navigation/drawer/lib/typescript/src/types';
import customVariables from '@app-theme/native-base-theme/variables/material';
import Icon from 'react-native-vector-icons/FontAwesome5';
import AccordionCategories from './accordion-categories';
import DrawerShoppingCart from './shopping-cart';
import { getProfilePictureUrl } from '@app-utils/request-utils';
import AvatarPlaceholder from '@app-assets/images/avatar_placeholder.jpg';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { IAppUser, IAppUserReward } from '@app-interfaces/user.interface';
import DrawerRecentProducts from './recent-products';
import DrawerDiscountProducts from './discounted-products';
import DrawerWishlist from './wishlist';

interface IProps extends Omit<{
    //@ts-ignore
    state: DrawerNavigationState<any>;
    navigation: NavigationHelpers<Record<string, object | undefined>, DrawerNavigationEventMap>;
    descriptors: DrawerDescriptorMap;
}, 'children'> {
    appUser: IAppUser | null,
    appUserRewards: IAppUserReward | null,
};


//@ts-ignore
function ownKeys(object: any, enumerableOnly: any) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }
//@ts-ignore
function _objectSpread(target: any) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
function _defineProperty(obj: any, key: any, value: any) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const parseDrawerItems = (routes: any) => {
    const current = [...routes];
    current.splice(1, 0, {} as any);
    current.splice(2, 0, {} as any);
    current.splice(3, 0, {} as any);
    current.splice(4, 0, {} as any);
    current.splice(5, 0, {} as any);
    return current;
};

const CustomDrawer: React.FC<IProps> = (props) => {
    const buildLink = useLinkBuilder();
    const openWhatsapp = () => {
        Linking.openURL('https://wa.me/5215540729627').catch((error) => console.log('ERROR OPENING WHATSAPP LINK:', error));
    };
    
    return (
        <DrawerContentScrollView {...props}>
            {props.appUser ?
                <>
                {(props.appUserRewards && props.appUserRewards.rewardPoints && props.appUserRewards.rewardPoints.isActive) ?
                        <TouchableWithoutFeedback style={[componentStyles.headerContainer, {flexDirection: 'row'}]}
                            onPress={() => {
                                //@ts-ignore
                                props.navigation.dispatch(_objectSpread(_objectSpread({}, CommonActions.navigate("Settings")), {}, {
                                    target: props.state.key
                                }));
                            }}>
                        <Thumbnail
                            style={[componentStyles.avatar, { resizeMode: 'cover' }]}
                            source={props.appUser.profilePictureId && props.appUser.profilePictureId > 0 ?
                                { uri: getProfilePictureUrl(props.appUser.profilePictureId, props.appUser.profilePictureLastUpdate) } :
                                AvatarPlaceholder
                            }
                        />
                        <View style={{marginLeft: 10, marginBottom: 10}}>
                            <Text style={[componentStyles.bold, componentStyles.title]}>
                                ¡Hola {props.appUser.firstName}!
                            </Text>
                            {props.appUserRewards && props.appUserRewards.rewardPoints.isActive ? 
                                <Text>{props.appUserRewards.rewardPoints.points} puntos</Text> 
                            : null}
                        </View>
                    </TouchableWithoutFeedback> 
                :
                    <TouchableWithoutFeedback style={componentStyles.headerContainer}
                        onPress={() => {
                            //@ts-ignore
                            props.navigation.dispatch(_objectSpread(_objectSpread({}, CommonActions.navigate("Settings")), {}, {
                                target: props.state.key
                            }));
                        }}>
                        <Thumbnail
                            style={[componentStyles.avatar, { resizeMode: 'center' }]}
                            source={props.appUser.profilePictureId && props.appUser.profilePictureId > 0 ?
                                { uri: getProfilePictureUrl(props.appUser.profilePictureId, props.appUser.profilePictureLastUpdate) } :
                                AvatarPlaceholder
                            }
                        />
                        <View style={{marginLeft: 10, marginBottom: 10}}>
                            <Text style={[componentStyles.bold, componentStyles.title]}>
                                ¡Hola {props.appUser.firstName}!
                            </Text>
                        </View>
                    </TouchableWithoutFeedback>
                }</>
                :
                <View style={componentStyles.headerContainer}>
                    <Image
                        style={{ width: 115, height: 65 }}
                        source={require('@app-assets/images/logo_deli.jpg')}
                    />
                    <Text style={[componentStyles.bold, componentStyles.title]}>
                        {"¡Bienvenido a \nDeliclub!"}
                    </Text>
                </View>
            }
            {
                parseDrawerItems(props.state.routes).map((route: any, i: number) => {
                    if (i === 1) {
                        return <DrawerRecentProducts key={i} />
                    }
                    else if (i === 2) {
                        return <DrawerDiscountProducts key={i} />
                    }
                    else if (i === 3) {
                        return <AccordionCategories key={i} />
                    }
                    else if (i === 4 && props.appUser) {
                        return <DrawerShoppingCart key={i} />
                    }
                    else if (i === 5 && props.appUser) {
                        return <DrawerWishlist key={i} />
                    }
                    const focused = i === props.state.index + 5 || (props.state.index === 0 && i === 0);
                    if (!props.descriptors[route.key]?.options) return;
                    const {
                        title,
                        drawerLabel,
                        drawerIcon
                    } = props.descriptors[route.key].options;

                    return React.createElement(DrawerItem, {
                        key: route.key,
                        label: drawerLabel !== undefined ? drawerLabel : title !== undefined ? title : route.name,
                        icon: drawerIcon,
                        focused: focused,
                        activeTintColor: customVariables.brandPrimary,
                        labelStyle: componentStyles.bold,
                        style: componentStyles.item,
                        to: buildLink(route.name, route.params),
                        onPress: () => {
                            //@ts-ignore
                            props.navigation.dispatch(_objectSpread(_objectSpread({}, focused ? DrawerActions.closeDrawer() : CommonActions.navigate(route.name)), {}, {
                                target: props.state.key
                            }));
                        }
                    });
                })
            }
            {/* <DrawerItemList labelStyle={componentStyles.bold} itemStyle={componentStyles.item} activeTintColor={customVariables.brandPrimary} {...props} /> */}
            <View style={componentStyles.footerContainer}>
                <Button full iconLeft onPress={openWhatsapp}>
                    <Icon style={{ marginLeft: 15 }} color='#FFFFFF' size={24} name="whatsapp" />
                    <Text>
                        Contáctanos
                    </Text>
                </Button>
            </View>
        </DrawerContentScrollView>
    )
};

const componentStyles = StyleSheet.create({
    item: {
        backgroundColor: '#FFFFFF',
        color: '#a7a7a7'
    },
    bold: {
        fontFamily: 'Quicksand-Bold'
    },
    title: {
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 5,
        fontSize: 18,
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    },
    headerContainer: {
        marginTop: 20,
        alignItems: 'center',
        alignSelf: 'center'
    },
    footerContainer: {
        marginVertical: 30,
        alignItems: 'center',
        alignSelf: 'center',
    },
    viewContent: {
        flexDirection: 'row',
        marginHorizontal: 10,
        marginTop: 5,
        paddingVertical: 9
    },
    textTitle: {
        marginTop: 3,
        color: 'rgba(28,28,30,0.68)',
        fontSize: 14,
        fontFamily: 'Quicksand-Bold'
    },
    avatar: {
        margin: 5,
        width: 65,
        height: 65
    },
});

export default CustomDrawer;