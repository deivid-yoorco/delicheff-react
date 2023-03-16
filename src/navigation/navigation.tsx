import React, { useContext, useState, useEffect } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '@app-screens/auth/login';
import RecoverScreen from '@app-screens/auth/password-recovery';
import WelcomeScreen from '@app-screens/auth/welcome';
import RegisterScreen from '@app-screens/auth/register';
import HomeScreen from '@app-screens/app/home';
import { AppContext } from '@app-context/app.context';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawer from './components/custom-drawer';
import { useAxios } from '@app-utils/axios-instance';
import AuthService, { IRegisterDto } from '@app-services/auth.service';
import analytics from '@react-native-firebase/analytics';
import CategoryScreen from '@app-screens/app/category';
import RecentProductsScreen from '@app-screens/app/category/recent-products';
import DiscountedProductsScreen from '@app-screens/app/category/discounted-products';
import SearchScreen from '@app-screens/app/search';
import ProductScreen from '@app-screens/app/product';
import { IProduct } from '@app-interfaces/product.interface';
import OrderScreen from '@app-screens/app/orders';
import { IUserOrder } from '@app-interfaces/order.interface';
import OrderDetailsScreen from '@app-screens/app/orders/order-details';
import ShoppingCartScreen from '@app-screens/app/shopping-cart';
import CheckoutScreen from '@app-screens/app/checkout';
import { IUserAddress } from '@app-interfaces/address.interface';
import AddressListScreen from '@app-screens/app/address/list';
import AddressCreateScreen from '@app-screens/app/address/create';
import {
    IShippingDate,
    IPaymentMethod,
    IDiscount,
    ISavedCard,
} from '@app-interfaces/checkout.interface';
import DateSelectionScreen from '@app-screens/app/checkout/date-selection';
import PaymentSelectionScreen from '@app-screens/app/checkout/payment-selection/payment-selection';
import SuccessScreen from '@app-screens/app/checkout/success';
import CreateCardScreen from '@app-screens/app/checkout/card-create';
import AddDiscountScreen from '@app-screens/app/checkout/discount-add';
import Icon from 'react-native-vector-icons/MaterialIcons';
import customVariables from '@app-theme/native-base-theme/variables/material';
import SettingsScreen from '@app-screens/app/settings';
import TopicScreen from '@app-screens/app/settings/topic';
import { ITopic } from '@app-interfaces/setting.interface';
import ShareAndWinScreen from '@app-screens/app/share-win';
import CoverageScreen from '@app-screens/app/coverage';
import EditProfileScreen from '@app-screens/app/settings/profile';
import ListSearchScreen from '@app-screens/app/search/list-search';
import NotificationsScreen from '@app-screens/app/settings/notifications';
import PropertySelectionScreen from '@app-screens/app/product/property-selection';
import NotificationService from '@app-services/notification.service';
import MyFavoritesScreen from '@app-screens/app/my-favorites';
import { Spinner, Text, View } from 'native-base';
import OnboardingScreen from '@app-screens/app/onboarding';
import { IOnboarding } from '@app-interfaces/home.interface';
import CrossSellScreen from '@app-screens/app/checkout/cross-sell';
import TagScreen from '@app-screens/app/tag';
import {
    IDiscountedProductSettings,
    IRecentProductsSettings,
} from '@app-interfaces/category.interface';
import WishlistScreen from '@app-screens/app/wishlist/wishlist';
import RegistrationSuccessfulScreen from '@app-screens/auth/register/registration-successful';
import { IAppUser, IUpdateUser } from '@app-interfaces/user.interface';
import { default as FullSpinner } from 'react-native-loading-spinner-overlay';
import QuantitySelectionScreen from '@app-components/quantity-selector';
import SmsVerificarionScreen from '@app-screens/auth/register/sms-verification';

export type OnboardingStackParamList = {
    Onboarding: { onboardings: IOnboarding[] };
};
const OnboardingStackNavigator = createStackNavigator<OnboardingStackParamList>();
const OnboardingNavigator = () => (
    <OnboardingStackNavigator.Navigator headerMode="none">
        <OnboardingStackNavigator.Screen name="Onboarding" component={OnboardingScreen} />
    </OnboardingStackNavigator.Navigator>
);

export type AuthStackParamList = {
    Welcome: undefined;
    Login: undefined;
    PasswordRecover: undefined;
    Register: undefined;
    SmsVerification: {
        registerData: IRegisterDto;
        verifyOnlyNumber: boolean;
        onGoBack?: (done: boolean) => void;
    };
    RegistrationSuccessful: { user: IAppUser; successNote: string };
};
const AuthStackNavigator = createStackNavigator<AuthStackParamList>();
const AuthNavigator = () => (
    <AuthStackNavigator.Navigator headerMode="none">
        <AuthStackNavigator.Screen
            options={{ animationEnabled: false }}
            name="Welcome"
            component={WelcomeScreen}
        />
        <AuthStackNavigator.Screen
            options={{ animationEnabled: false }}
            name="Login"
            component={LoginScreen}
        />
        <AuthStackNavigator.Screen
            options={{ animationEnabled: false }}
            name="PasswordRecover"
            component={RecoverScreen}
        />
        <AuthStackNavigator.Screen
            options={{ animationEnabled: false }}
            name="Register"
            component={RegisterScreen}
        />
        <AuthStackNavigator.Screen
            options={{ animationEnabled: false }}
            name="SmsVerification"
            component={SmsVerificarionScreen}
        />
        <AuthStackNavigator.Screen
            options={{ animationEnabled: false }}
            name="RegistrationSuccessful"
            component={RegistrationSuccessfulScreen}
        />
    </AuthStackNavigator.Navigator>
);

export type DrawerParamList = {
    Home: undefined;
    Orders: undefined;
    Settings: undefined;
    Address: undefined;
    PaymentMethods: undefined;
    ShareAndWin: undefined;
    Auth: undefined;
    Coverage: undefined;
};
const MainDrawerNavigator = createDrawerNavigator<DrawerParamList>();
const DrawerNavigator: React.FC = () => {
    const appContext = useContext(AppContext);
    return (
        <>
            <MainDrawerNavigator.Navigator
                initialRouteName="Home"
                drawerContent={(props) => (
                    <CustomDrawer
                        appUser={appContext.appUser}
                        appUserRewards={appContext.appUserRewards}
                        {...props}
                    />
                )}
                drawerType="back">
                <MainDrawerNavigator.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{
                        drawerLabel: 'Inicio',
                        drawerIcon: (props) => (
                            <Icon
                                color={customVariables.brandPrimary}
                                size={24}
                                style={{ color: props.color }}
                                name="home"
                            />
                        ),
                    }}
                />
                {appContext.appUser ? (
                    <>
                        <MainDrawerNavigator.Screen
                            name="Orders"
                            component={OrderScreen}
                            options={{
                                drawerLabel: 'Mis órdenes',
                                drawerIcon: (props) => (
                                    <Icon
                                        color={customVariables.brandPrimary}
                                        size={24}
                                        style={{ color: props.color }}
                                        name="receipt"
                                    />
                                ),
                            }}
                        />
                        <MainDrawerNavigator.Screen
                            name="Address"
                            component={AddressListScreen}
                            options={{
                                drawerLabel: 'Mis direcciones',
                                drawerIcon: (props) => (
                                    <Icon
                                        color={customVariables.brandPrimary}
                                        size={24}
                                        style={{ color: props.color }}
                                        name="near-me"
                                    />
                                ),
                            }}
                        />
                        <MainDrawerNavigator.Screen
                            name="PaymentMethods"
                            component={PaymentSelectionScreen}
                            options={{
                                drawerLabel: 'Métodos de pago',
                                drawerIcon: (props) => (
                                    <Icon
                                        color={customVariables.brandPrimary}
                                        size={24}
                                        style={{ color: props.color }}
                                        name="payment"
                                    />
                                ),
                            }}
                        />
                        <MainDrawerNavigator.Screen
                            name="Settings"
                            component={SettingsScreen}
                            options={{
                                drawerLabel: 'Mi cuenta',
                                drawerIcon: (props) => (
                                    <Icon
                                        color={customVariables.brandPrimary}
                                        size={24}
                                        style={{ color: props.color }}
                                        name="person"
                                    />
                                ),
                            }}
                        />
                    </>
                ) : (
                    <>
                        <MainDrawerNavigator.Screen
                            name="Auth"
                            component={AuthNavigator}
                            options={{
                                drawerLabel: 'Regístrate o inicia sesión',
                                drawerIcon: (props) => (
                                    <Icon
                                        color={customVariables.brandPrimary}
                                        size={24}
                                        style={{ color: props.color }}
                                        name="person"
                                    />
                                ),
                            }}
                        />
                    </>
                )}
                <MainDrawerNavigator.Screen
                    name="Coverage"
                    component={CoverageScreen}
                    options={{
                        drawerLabel: 'Zona de cobertura',
                        drawerIcon: (props) => (
                            <Icon
                                color={customVariables.brandPrimary}
                                size={24}
                                style={{ color: props.color }}
                                name="place"
                            />
                        ),
                    }}
                />
                {appContext.appUser && (
                    <MainDrawerNavigator.Screen
                        name="ShareAndWin"
                        component={ShareAndWinScreen}
                        options={{
                            drawerLabel: (props) => (
                                <Text
                                    style={{
                                        color: customVariables.brandDanger,
                                        fontFamily: 'Quicksand-Bold',
                                    }}>
                                    ¡Gana super gratis!
                                </Text>
                            ),
                            drawerIcon: (props) => (
                                <Icon
                                    color={customVariables.brandDanger}
                                    size={24}
                                    style={{ color: customVariables.brandDanger }}
                                    name="card-giftcard"
                                />
                            ),
                        }}
                    />
                )}
            </MainDrawerNavigator.Navigator>
        </>
    );
};

export type AppStackParamList = {
    Drawer: undefined;
    Category: { categoryName: string; categoryId: number; isChild?: boolean };
    RecentProducts: { settings: IRecentProductsSettings | undefined };
    DiscountedProducts: { settings: IDiscountedProductSettings | undefined };
    Search: { givenSearchTerm: string | undefined };
    OrderDetails: { order: IUserOrder; address: string };
    ShoppingCart: undefined;
    Wishlist: undefined;
    Checkout: { onBackToCart?: () => void };
    CrossSellProducts: {
        crossSellProducts: IProduct[];
        finalProducts: IProduct[];
        onBackToCart: () => void;
    };
    Success: {
        orderId: string;
        selectedShippingDate: string;
        selectedShippingTime: string;
        paymentMethd: string;
        successNote?: string;
    };
    Product: {
        product?: IProduct;
        shouldLoadProduct?: boolean;
        productId?: number;
        onGoBack?: (updatedProduct: IProduct) => void;
    };
    ListSearch: { searchTerm: string };
    Tag: { tagId: number; tagName: string };
    MyFavorites: { initialProducts: IProduct[] };
};

const MainAppStack = createStackNavigator<AppStackParamList>();
const MainAppNavigator = () => (
    <MainAppStack.Navigator headerMode="none">
        <MainAppStack.Screen
            options={{ animationEnabled: false }}
            name="Drawer"
            component={DrawerNavigator}
        />
        <MainAppStack.Screen
            options={{ animationEnabled: false }}
            name="Category"
            component={CategoryScreen}
        />
        <MainAppStack.Screen
            options={{ animationEnabled: false }}
            name="RecentProducts"
            component={RecentProductsScreen}
        />
        <MainAppStack.Screen
            options={{ animationEnabled: false }}
            name="DiscountedProducts"
            component={DiscountedProductsScreen}
        />
        <MainAppStack.Screen
            options={{ animationEnabled: false }}
            name="ShoppingCart"
            component={ShoppingCartScreen}
        />
        <MainAppStack.Screen
            options={{ animationEnabled: false }}
            name="Wishlist"
            component={WishlistScreen}
        />
        <MainAppStack.Screen
            options={{ animationEnabled: false }}
            name="Checkout"
            component={CheckoutScreen}
        />
        <MainAppStack.Screen
            name="Search"
            component={SearchScreen}
            options={{ animationEnabled: false }}
        />
        <MainAppStack.Screen
            options={{ animationEnabled: false }}
            name="OrderDetails"
            component={OrderDetailsScreen}
        />
        <MainAppStack.Screen
            options={{ animationEnabled: false }}
            name="Success"
            component={SuccessScreen}
        />
        <MainAppStack.Screen
            options={{ animationEnabled: false }}
            name="Product"
            component={ProductScreen}
        />
        <MainAppStack.Screen
            options={{ animationEnabled: false }}
            name="ListSearch"
            component={ListSearchScreen}
        />
        <MainAppStack.Screen
            options={{ animationEnabled: false }}
            name="MyFavorites"
            component={MyFavoritesScreen}
        />
        <MainAppStack.Screen
            options={{ animationEnabled: false }}
            name="CrossSellProducts"
            component={CrossSellScreen}
        />
        <MainAppStack.Screen options={{ animationEnabled: false }} name="Tag" component={TagScreen} />
    </MainAppStack.Navigator>
);

export type RootStackParamList = {
    Main: undefined;
    Auth: undefined;
    Onboarding: { onboardings: IOnboarding[] };
    Topic: { topic: ITopic };
    EditProfile: undefined;
    AddressCreate: { onGoBack?: (newAddress: IUserAddress) => void };
    DateSelection: {
        availableDates: IShippingDate[];
        selectedDate: IShippingDate;
        onGoBack: (newDate: IShippingDate) => void;
    };
    PaymentSelection: {
        paymentMethods?: IPaymentMethod[];
        selectedPaymentMethod?: IPaymentMethod;
        onGoBack?: (newPatmentMethod: IPaymentMethod) => void;
    };
    CardCreate: {
        onGoBack: (newCard: ISavedCard, cvv: string) => void;
        shippingAddress?: IUserAddress;
        paymentMethodSystemName: string;
    };
    DiscountAdd: { setSelectedCoupons: React.Dispatch<React.SetStateAction<IDiscount[]>> };
    Notifications: undefined;
    PropertySelection: {
        productProperties: string[];
        product: IProduct;
        onGoBack: (newProperty: string) => void;
    };
    QuantitySelection: {
        product: IProduct;
        onGoBack: (updatedProduct: IProduct) => void;
    };
    AddressList: {
        addresses?: IUserAddress[];
        setAddresses?: React.Dispatch<React.SetStateAction<IUserAddress[]>>;
        setSelectedAddress?: React.Dispatch<React.SetStateAction<IUserAddress | undefined>>;
        selectedId?: number;
        fromCheckout?: boolean;
    };
    SmsVerification: {
        registerData: IRegisterDto;
        verifyOnlyNumber: boolean;
        onGoBack?: (done: boolean) => void;
    };
};

const RootStack = createStackNavigator<RootStackParamList>();
const RootNavigator = () => (
    <RootStack.Navigator headerMode="none">
        <RootStack.Screen
            options={{ animationEnabled: false }}
            name="Onboarding"
            component={OnboardingNavigator}
        />
        <RootStack.Screen
            options={{ animationEnabled: false }}
            name="Main"
            component={MainAppNavigator}
        />
        <RootStack.Screen
            options={{ animationEnabled: false }}
            name="Auth"
            component={AuthNavigator}
        />
        <RootStack.Screen
            options={{ animationEnabled: false }}
            name="AddressCreate"
            component={AddressCreateScreen}
        />
        <RootStack.Screen
            options={{ animationEnabled: false }}
            name="DateSelection"
            component={DateSelectionScreen}
        />
        <RootStack.Screen
            options={{ animationEnabled: false }}
            name="PaymentSelection"
            component={PaymentSelectionScreen}
        />
        <RootStack.Screen
            options={{ animationEnabled: false }}
            name="CardCreate"
            component={CreateCardScreen}
        />
        <RootStack.Screen
            options={{ animationEnabled: false }}
            name="Topic"
            component={TopicScreen}
        />
        <RootStack.Screen
            options={{ animationEnabled: false }}
            name="EditProfile"
            component={EditProfileScreen}
        />
        <RootStack.Screen
            options={{ animationEnabled: false }}
            name="SmsVerification"
            component={SmsVerificarionScreen}
        />
        <RootStack.Screen
            options={{ animationEnabled: false }}
            name="DiscountAdd"
            component={AddDiscountScreen}
        />
        <RootStack.Screen
            options={{ animationEnabled: false }}
            name="Notifications"
            component={NotificationsScreen}
        />
        <RootStack.Screen
            options={{ animationEnabled: false }}
            name="PropertySelection"
            component={PropertySelectionScreen}
        />
        <RootStack.Screen
            options={{ animationEnabled: false }}
            name="QuantitySelection"
            component={QuantitySelectionScreen}
        />
        <RootStack.Screen
            options={{ animationEnabled: false }}
            name="AddressList"
            component={AddressListScreen}
        />
    </RootStack.Navigator>
);

let tokenSaved: boolean = false;
const AppNavigator: React.FC = () => {
    const [] = useAxios();
    const context = useContext(AppContext);
    const [loadingInitialData, setLoadingInitialData] = useState<boolean>(true);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    const navigationRef = React.useRef<NavigationContainerRef>(null);
    let routeNameRef = React.useRef<string>();

    useEffect(() => {
        AuthService.getUser().then((result) => {
            setLoadingInitialData(false);
            if (!context.appUser) context.setAppUser(result);
            setIsLoggedIn(result !== null);
            if (result !== null && !tokenSaved) {
                tokenSaved = true;
                NotificationService.saveNotificationTokenInServer().catch((error) =>
                    console.log('ERROR SAVING FIREBASE TOKEN IN SERVER:', error),
                );
            }
        });
    }, [context.appUser]);

    return (
        <>
            {!loadingInitialData && (
                <NavigationContainer
                    ref={navigationRef}
                    onReady={() => {
                        if (!navigationRef.current) return;
                        routeNameRef.current = navigationRef.current.getCurrentRoute()?.name;
                    }}
                    onStateChange={async (state) => {
                        if (!navigationRef.current) return;
                        const previousRouteName = routeNameRef.current;
                        const currentRouteName = navigationRef.current.getCurrentRoute()?.name;

                        if (
                            currentRouteName &&
                            previousRouteName !== currentRouteName &&
                            analytics().logScreenView
                        ) {
                            let body = {
                                screen_class: currentRouteName,
                                screen_name: currentRouteName,
                            };
                            analytics()
                                .logScreenView(body)
                                .catch((error) => console.log('ERROR LOGGING SCREEN VIEW:', error));
                        }

                        routeNameRef.current = currentRouteName;
                    }}>
                    <RootNavigator />
                    <FullSpinner
                        visible={context.loading}
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
                </NavigationContainer>
            )}
        </>
    );
};

export default AppNavigator;
