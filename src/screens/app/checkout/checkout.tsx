import React, {useState, useEffect, useContext, memo} from 'react';
import {StyleSheet, Platform, Linking} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, CompositeNavigationProp} from '@react-navigation/native';
import {AppStackParamList, RootStackParamList} from 'navigation/navigation';
import {
    Container,
    Content,
    Card,
    CardItem,
    Body,
    Text,
    View,
    Thumbnail,
    Right,
    H3,
    Button,
    List,
    ListItem,
    Spinner,
    Toast,
} from 'native-base';
import Header from '@app-components/header';
import {Config} from '@app-config/app.config';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import customVariables from '@app-theme/native-base-theme/variables/material';
import AddressService from '@app-services/address.service';
import {IUserAddress} from '@app-interfaces/address.interface';
import AddressCard from '@app-components/address-card';
import LoadingButton from '@app-components/loading-button';
import AlertText from '@app-components/alert-text';
import CheckoutService from '@app-services/checkout.service';
import {
    IShippingDate,
    IPaymentMethod,
    IOrderTotal,
    IPlaceOrder,
    IDiscount,
    ISavedCard,
    IStripePayment,
    ICustomerBalance,
} from '@app-interfaces/checkout.interface';
import {getShippingFormatedDate} from '@app-utils/date-utils';
import FastImage from 'react-native-fast-image';
import {format} from 'date-fns';
import AddressLoading from './components/address-loading';
import ShippingDateLoading from './components/shipping-date-loading';
import PaymentMethodLoading from './components/payment-method-loading';
import OrderTotalsLoading from './components/order-totals-loading';
import {ShoppingCartContext} from '@app-context/shopping-cart.context';
import locale from 'date-fns/locale/es';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconFA from 'react-native-vector-icons/FontAwesome5';
import {formatCurrency, generateUUID} from '@app-utils/common-utils';
import {AppContext} from '@app-context/app.context';
import analytics from '@react-native-firebase/analytics';
import ThumbnailProducts from '@app-components/thumbnail-products';
import VisaPaymentService from '@app-services/visa-payment.service';
import Modal from 'react-native-modal';
import TeedInput from '@app-components/input';
import TeedForm from '@app-components/form';
import DeviceFingerprint from './components/device-fingerprint';

type ScreenNavigationProp = CompositeNavigationProp<
    StackNavigationProp<AppStackParamList, 'Checkout'>,
    StackNavigationProp<RootStackParamList, 'DateSelection'>
>;
type ScreenRouteProp = RouteProp<AppStackParamList, 'Checkout'>;

interface IProps {
    navigation: ScreenNavigationProp;
    route: ScreenRouteProp;
}

const checkIfShouldCreateCard = (selectedPaymentMethod: IPaymentMethod): boolean => {
    return (
        selectedPaymentMethod.savedCard === null &&
        selectedPaymentMethod.paymentMethodSystemName === 'Payments.Visa'
    );
};

const CheckoutScreen: React.FC<IProps> = (props) => {
    const shoppingCartContext = useContext(ShoppingCartContext);
    const appContext = useContext(AppContext);

    const [addresses, setAddresses] = useState<IUserAddress[]>([]);
    const [availableDates, setAvailableDates] = useState<IShippingDate[]>([]);
    const [paymentMethods, setPaymentMenthods] = useState<IPaymentMethod[]>([]);
    const [selectedDate, setSelectedDate] = useState<IShippingDate>();
    const [selectedAddress, setSelectedAddress] = useState<IUserAddress>();
    const [selectedCoupons, setSelectedCoupons] = useState<IDiscount[]>([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<IPaymentMethod>();
    const [orderTotals, setOrderTotals] = useState<IOrderTotal>();
    const [loadingAddresses, setLoadingAddresses] = useState<boolean>(true);
    const [loadingDates, setLoadingDates] = useState<boolean>(true);
    const [loadingPaymentMethods, setLoadingPaymentMethods] = useState<boolean>(true);
    const [loadingOrderTotals, setLoadingOrderTotals] = useState<boolean>(true);
    const [loadingAppliedDiscounts, setLoadingAppliedDiscounts] = useState<boolean>(true);
    const [checkingPostalCode, setCheckingPostalCode] = useState<boolean>(false);
    const [checkoutError, setCheckoutError] = useState<string>();
    const [paymentError, setPaymentError] = useState<string>();
    const [addressIsValid, setAddressIsValid] = useState<boolean>(true);
    const [placingOrder, setPlacingOrder] = useState<boolean>(false);
    const [shouldCreateCard, setShouldCreateCard] = useState<boolean>(false);
    const [removingDiscountId, setRemovingDiscountId] = useState<number>(0);
    const [orderMinimumErrorMessage, setOrderMinimumErrorMessage] = useState<string>('');
    const [loadingOrderMinimumErrorMessage, setLoadingOrderMinimumErrorMessage] =
        useState<boolean>(false);

    const [cvvModalVisible, setCvvModalVisible] = useState<boolean>(false);
    const [cardCvv, setCardCvv] = useState<string>('');
    const [shouldRequestCvv, setShouldRequestCvv] = useState<boolean>(true);
    const [cvvFocus, setCvvFocus] = useState<boolean>(false);

    const [loadDeviceFingerprint, setLoadDeviceFingerprint] = useState<boolean>(false);
    const [deviceFingerprintSessionId] = useState<string>(generateUUID());

    const [loadingBalance, setLoadingBalance] = useState<boolean>(false);
    const [loadingActiveBalance, setLoadingActiveBalance] = useState<boolean>(false);
    const [activeBalanceForCheckBox, setActiveBalanceForCheckBox] = useState<boolean>(false);
    const [customerBalance, setCustomerBalance] = useState<ICustomerBalance>();

    const [paymentIsZero, setPaymentIsZero] = useState<boolean>(false);

    useEffect(() => {
        appContext.setLoading(loadingOrderTotals || loadingActiveBalance);
    }, [loadingOrderTotals, loadingActiveBalance]);

    useEffect(() => {
        async function logBeginCheckout() {
            await analytics().logBeginCheckout();
        }
        logBeginCheckout();
    }, []);

    useEffect(() => {
        getAddresses();
        getPaymentMethods();
        getOrderTotals();
        getAppliedDiscount();
        getCustomerBalance();
        applyGiftProduct();
    }, []);

    useEffect(() => {
        setPaymentError(undefined);
        if (!selectedPaymentMethod) return;
        let createCard = checkIfShouldCreateCard(selectedPaymentMethod);
        setShouldCreateCard(createCard);
        if (createCard) goToCreateCard(selectedPaymentMethod.paymentMethodSystemName);
        setLoadDeviceFingerprint(selectedPaymentMethod.paymentMethodSystemName == 'Payments.Visa');
    }, [selectedPaymentMethod]);

    useEffect(() => {
        getOrderTotals();
    }, [selectedCoupons]);

    useEffect(() => {
        setAddressIsValid(true);
        if (!selectedAddress) return;
        setCheckingPostalCode(true);
        AddressService.isPostalCodeValid(selectedAddress?.zipPostalCode)
            .then(({data}) => {
                setAddressIsValid(data);
                getDates(selectedAddress?.zipPostalCode);
            })
            .catch((error) => {
                console.log('ERROR CHECKING POSTAL CODE:', error);
                setCheckoutError(
                    '¡Oh no! Ocurrió un problema mientras preparábamos la información. Por favor, inténtalo de nuevo más tarde. (ERROR: VPC01)',
                );
            })
            .finally(() => setCheckingPostalCode(false));
    }, [selectedAddress]);

    useEffect(() => {
        if (selectedDate != undefined) {
            setLoadingOrderMinimumErrorMessage(true);
            CheckoutService.getOrderMinimumPedidoCheck(selectedDate.date)
                .then(({data}) => {
                    setOrderMinimumErrorMessage(data);
                })
                .catch((error) => {
                    console.log('ERROR CHECKING ORDER MINIMUM MESSAGE:', error);
                })
                .finally(() => setLoadingOrderMinimumErrorMessage(false));
        }
    }, [selectedDate]);

    const applyGiftProduct = () => {
        CheckoutService.applyGiftProduct().catch((error) => {
            console.log('ERROR APPLTING GIFT PRODUCT:', error);
        });
    };

    const goToCreateCard = (paymentMethodSystemName: string) => {
        props.navigation.navigate('CardCreate', {
            shippingAddress: selectedAddress,
            paymentMethodSystemName: paymentMethodSystemName,
            onGoBack: (newCard: ISavedCard, cvv: string) => {
                if (!newCard || !selectedPaymentMethod) return;
                setSelectedPaymentMethod({
                    ...selectedPaymentMethod,
                    savedCard: newCard,
                });

                let current = [...paymentMethods];
                let index = current.map((x) => x.paymentMethodSystemName).indexOf('Payments.Visa');
                if (index === -1) return;
                current[index].savedCard = newCard;
                setPaymentMenthods(current);
                setCardCvv(cvv);
                setShouldRequestCvv(false);
            },
        });
    };

    const getOrderTotals = () => {
        setLoadingOrderTotals(true);
        CheckoutService.getOrderTotals()
            .then(({data}) => {
                setOrderTotals(data);
                setPaymentIsZero(data.orderTotal == 0);
            })
            .catch((error) => {
                console.log('ERROR GETTING TOTALS:', error);
                setCheckoutError(
                    '¡Oh no! Ocurrió un problema mientras preparábamos la información. Por favor, inténtalo de nuevo más tarde. (ERROR: GOT01)',
                );
            })
            .finally(() => setLoadingOrderTotals(false));
    };

    const getAppliedDiscount = () => {
        setLoadingAppliedDiscounts(true);
        CheckoutService.getAppliedDiscounts()
            .then(({data}) => {
                setSelectedCoupons(data);
            })
            .catch((error) => {
                console.log('ERROR GETTING APPLIED DISCOUNTS:', error);
                setCheckoutError(
                    '¡Oh no! Ocurrió un problema mientras preparábamos la información. Por favor, inténtalo de nuevo más tarde. (ERROR: GAD01)',
                );
            })
            .finally(() => setLoadingAppliedDiscounts(false));
    };

    const getCustomerBalance = () => {
        setLoadingBalance(true);
        CheckoutService.getCustomerBalance()
            .then(({data}) => {
                setCustomerBalance(data);
                setActiveBalanceForCheckBox(data.balanceIsActive);
            })
            .catch((error) => {
                console.log('ERROR GETTING CUSTOMER BALANCE:', error);
                setCheckoutError(
                    '¡Oh no! Ocurrió un problema mientras preparábamos la información. Por favor, inténtalo de nuevo más tarde. (ERROR: GCB01)',
                );
            })
            .finally(() => {
                setLoadingBalance(false);
                appContext.setLoading(false);
            });
    };

    const setBalanceActive = (isActive: boolean) => {
        setActiveBalanceForCheckBox(isActive);
        setTimeout(() => {
            setLoadingActiveBalance(true);
            CheckoutService.setBalanceActive(isActive)
                .then(({data}) => {
                    getOrderTotals();
                    getCustomerBalance();
                })
                .catch((error) => {
                    console.log('ERROR GETTING CUSTOMER BALANCE:', error);
                    setCheckoutError(
                        '¡Oh no! Ocurrió un problema mientras preparábamos la información. Por favor, inténtalo de nuevo más tarde. (ERROR: SBA01)',
                    );
                })
                .finally(() => setLoadingActiveBalance(false));
        }, 100);
    };

    const getDates = (postalCode?: string) => {
        setLoadingDates(true);
        CheckoutService.getAvailableDays(postalCode || selectedAddress?.zipPostalCode || '')
            .then(({data}) => {
                setAvailableDates(data);
                let valid = data.filter((x) => !x.disabled && x.isActive);
                if (valid.length === 0) return;
                setSelectedDate(valid[0]);
            })
            .catch((error) => {
                console.log('ERROR GETTING AVAILABLE DAYS:', error);
                setCheckoutError(
                    '¡Oh no! Ocurrió un problema mientras preparábamos la información. Por favor, inténtalo de nuevo más tarde. (ERROR: GD01)',
                );
            })
            .finally(() => setLoadingDates(false));
    };

    const getPaymentMethods = () => {
        setLoadingPaymentMethods(true);
        CheckoutService.getPaymentMethods()
            .then(({data}) => {
                setPaymentMenthods(data);
                if (data.length > 0) {
                    let selected = data.filter((x) => x.selected);
                    setSelectedPaymentMethod(selected.length > 0 ? selected[0] : data[0]);
                }
            })
            .catch((error) => {
                console.log('ERROR GETTING PAYMENT METHODS:', error);
                setCheckoutError(
                    '¡Oh no! Ocurrió un problema mientras preparábamos la información. Por favor, inténtalo de nuevo más tarde. (ERROR: GPM01)',
                );
            })
            .finally(() => setLoadingPaymentMethods(false));
    };

    const getAddresses = () => {
        setLoadingAddresses(addresses.length === 0);
        AddressService.getAddresses()
            .then(({data}) => {
                if (data.length === 0) goToAddressList();
                setAddresses(data);
                if (data.length > 0) setSelectedAddress(data[0]);
            })
            .catch((error) => {
                console.log('ERROR LOADING ADDRESSES:', error);
            })
            .finally(() => setLoadingAddresses(false));
    };

    const goToAddressList = () => {
        props.navigation.push('AddressList', {
            addresses: addresses,
            setSelectedAddress,
            selectedId: selectedAddress?.id,
            setAddresses,
            fromCheckout: true,
        });
    };

    const selectDateHandler = () => {
        if (!selectedDate) return;
        props.navigation.navigate('DateSelection', {
            availableDates: availableDates,
            selectedDate: selectedDate,
            onGoBack: (newDate: IShippingDate) => {
                setSelectedDate(newDate);
            },
        });
    };

    const selectPaymentMethodHandler = () => {
        if (!selectedPaymentMethod) return;
        props.navigation.navigate('PaymentSelection', {
            paymentMethods: paymentMethods,
            selectedPaymentMethod: selectedPaymentMethod,
            onGoBack: (newPaymentMethod: IPaymentMethod) => {
                setSelectedPaymentMethod(newPaymentMethod);
                // setShouldCreateCard(checkIfShouldCreateCard(newPaymentMethod));
            },
        });
    };

    const processPayment = () => {
        if (!selectedPaymentMethod || !orderTotals) return;
        setPlacingOrder(true);
        setPaymentError(undefined);
        if (orderTotals.orderTotal === 0) {
            placeOrder('Orden con total 0');
            return;
        }

        switch (selectedPaymentMethod.paymentMethodSystemName) {
            case 'Payments.CardOnDelivery':
            case 'Payments.CashOnDelivery':
            case 'Payments.Benefits':
                placeOrder();
                break;
            case 'Payments.Visa':
                setPlacingOrder(false);
                if (shouldRequestCvv) requestCardCvv();
                else captureVisaPayment();
                break;
            default:
                break;
        }
    };

    // const excecuteDecisionManager = () => {
    //     if (!selectedPaymentMethod?.savedCard) return;
    //     VisaPaymentService.excecuteDecisionManager(selectedPaymentMethod.savedCard)
    //         .then(({ data }) => {
    //             let approvedByDM = data;
    //             if (!approvedByDM) {
    //                 setPlacingOrder(false);
    //                 setPaymentError('La transacción no fue aprobada. Por favor, selecciona otro método de pago.');
    //                 return;
    //             }
    //             else captureVisaPayment();
    //         })
    //         .catch((error) => {
    //             console.log('ERROR EXCECUTING DECISION MANAGER:', error);
    //             setPaymentError('No fue posible completar la transacción. Por favor, selecciona otro método de pago.');
    //             setPlacingOrder(false);
    //         })
    // };

    const captureVisaPayment = () => {
        if (!selectedPaymentMethod?.savedCard || !cardCvv) return;
        setCvvModalVisible(false);
        setPlacingOrder(true);
        selectedPaymentMethod.savedCard.customerEnteredSecurityCode = cardCvv;
        selectedPaymentMethod.savedCard.selectedShippingAddressId = selectedAddress?.id;
        selectedPaymentMethod.savedCard.deviceFingerprintSessionId = deviceFingerprintSessionId;
        VisaPaymentService.capturePayment(selectedPaymentMethod.savedCard)
            .then(({data}) => {
                placeOrder(data);
            })
            .catch((error) => {
                console.log('ERROR PROCESSING VISA PAYMENT TOKEN:', error);
                setPaymentError(
                    'La transacción no fue aprobada. Por favor, selecciona otro método de pago.',
                );
                setPlacingOrder(false);
            });
    };

    // const mercadoPagoPayment = () => {
    //     if (!appContext.appUser) return;
    //     setPlacingOrder(true);
    //     CheckoutService.getMercadopagoPreference(parseInt(appContext.appUser.id))
    //         .then(({ data }) => {
    //             MercadoPagoCheckout.createPayment({
    //                 publicKey: data.publicKey,
    //                 preferenceId: data.preferenceId,
    //                 language: 'es-MX'
    //             })
    //                 .then((result) => {
    //                     placeOrder(JSON.stringify(result));
    //                 })
    //                 .catch((error) => {
    //                     console.log('ERROR MERCADOPAGO PAYMENT:', error);
    //                     setPaymentError('No fue posible completar la transacción. Por favor, selecciona otro método de pago.');
    //                     setPlacingOrder(false);
    //                 })
    //         })
    //         .catch((error) => {
    //             console.log('ERROR GETTING MERCADOPAGO PREFERENCEID:', error);
    //             setPaymentError('No fue posible completar la transacción. Por favor, selecciona otro método de pago.');
    //             setPlacingOrder(false);
    //         })
    // };

    // const stripePayment = () => {
    //     if (!appContext.appUser) return;
    //     if (!selectedPaymentMethod || !selectedPaymentMethod.savedCard) return;

    //     setPlacingOrder(true);

    //     let body: IStripePayment = {
    //         userId: parseInt(appContext.appUser.id),
    //         stripeCustomerId: selectedPaymentMethod.savedCard.stripeCustomerId
    //     };

    //     CheckoutService.processStripePayment(body)
    //         .then(({ data }) => {
    //             placeOrder(data);
    //         })
    //         .catch((error) => {
    //             console.log('ERROR STRIPE PAYMENT:', error);
    //             setPaymentError('No fue posible completar la transacción. Por favor, selecciona otro método de pago.');
    //             setPlacingOrder(false);
    //         })
    // };

    // const paypalPayment = async () => {
    //     CheckoutService.getPaypalToken()
    //         .then(({ data }) => {
    //             requestOneTimePayment(
    //                 data,
    //                 {
    //                     amount: orderTotals?.orderTotal.toString(),
    //                     currency: 'MXN',
    //                     localeCode: 'es_ES',
    //                     shippingAddressRequired: false,
    //                     userAction: 'commit',
    //                     intent: 'sale',
    //                 }
    //             )
    //                 .then((result: any) => {
    //                     placeOrder(JSON.stringify(result));
    //                 })
    //                 .catch((error: any) => {
    //                     console.log('ERROR PAYPAL PAYMENT:', error);
    //                     setPaymentError('No fue posible completar la transacción. Por favor, selecciona otro método de pago.');
    //                     setPlacingOrder(false);
    //                 });
    //         })
    //         .catch((error) => {
    //             console.log('ERROR GETTING BRAINTREE TOKEN:', error);
    //         })
    // };

    const placeOrder = (paymentResult?: string) => {
        if (
            !selectedPaymentMethod ||
            !selectedDate ||
            !selectedAddress ||
            !orderTotals ||
            !customerBalance
        )
            return;
        let body: IPlaceOrder = {
            selectedPaymentMethodSystemName:
                orderTotals.orderTotal == 0 && customerBalance.balanceIsActive
                    ? ''
                    : selectedPaymentMethod.paymentMethodSystemName,
            selectedShippingDate: format(new Date(selectedDate.date), 'dd-MM-yyyy'),
            selectedShippingTime: selectedDate.shippingTime,
            addressId: selectedAddress.id,
            paymentResult: paymentResult,
            shoppingCartItemIds: orderTotals.shoppingCartItemIds,
        };
        console.log(body);
        CheckoutService.placeOrder(body)
            .then(async ({data}) => {
                shoppingCartContext.clearShoppingCart();
                let logBody = {
                    currency: 'mxn',
                    transaction_id: data.toString(),
                    shipping: orderTotals.shipping,
                    value: orderTotals.orderTotal,
                    coupon:
                        selectedCoupons.length > 0
                            ? selectedCoupons.map((x) => x.couponCode).join(', ')
                            : undefined,
                };
                await analytics().logPurchase(logBody);
                props.navigation.push('Success', {
                    orderId: data.toString(),
                    selectedShippingDate: format(
                        new Date(selectedDate.date),
                        "EEEE, dd 'de' LLLL",
                        {locale},
                    ),
                    selectedShippingTime: body.selectedShippingTime,
                    successNote: selectedPaymentMethod.successNote,
                    paymentMethd:
                        orderTotals.orderTotal == 0 && customerBalance.balanceIsActive
                            ? 'No necesario'
                            : selectedPaymentMethod.name,
                });
            })
            .catch((error) => {
                console.log('ERROR PLACING ORDER:', error);
                if (error.response && error.response.status == 400 && error.response.data) {
                    setCheckoutError(error.response.data);
                } else
                    setCheckoutError(
                        'No fue posible crear la orden, por favor inténtalo más tarde.',
                    );
                setPlacingOrder(false);
            });
    };

    const addCoupon = () => {
        props.navigation.navigate('DiscountAdd', {setSelectedCoupons});
    };

    const removeDiscount = (index: number) => {
        setRemovingDiscountId(selectedCoupons[index].discountId);
        CheckoutService.removeCoupon(selectedCoupons[index].discountId)
            .then(() => {
                let current = [...selectedCoupons];
                current.splice(index, 1);
                setSelectedCoupons(current);
            })
            .catch((error) => {
                console.log('ERROR REMOVING DISCOUNT:', error);
                Toast.show({
                    text: 'No fue posible quitar el cupón. Por favor, inténtalo más tarde.',
                    buttonText: 'Ok',
                    type: 'danger',
                    duration: 5000,
                });
            })
            .finally(() => setRemovingDiscountId(0));
    };

    const requestCardCvv = () => {
        setCvvModalVisible(true);
    };

    const closeCvvModal = () => {
        setCvvModalVisible(false);
        setCvvFocus(false);
    };

    const openWhatsapp = () => {
        Linking.openURL('https://wa.me/5215540729627').catch((error) =>
            console.log('ERROR OPENING WHATSAPP LINK:', error),
        );
    };

    return (
        <Container>
            <Header canGoBack>Checkout</Header>
            <Content>
                {loadingAddresses ? (
                    <AddressLoading />
                ) : (
                    <>
                        {selectedAddress ? (
                            <AddressCard
                                validatingAddress={checkingPostalCode}
                                notValidAddress={!addressIsValid}
                                title="Dirección de entrega"
                                address={selectedAddress}
                                updateHandler={goToAddressList}
                            />
                        ) : (
                            <View style={{flex: 1}}>
                                <Button
                                    iconLeft
                                    transparent
                                    onPress={goToAddressList}
                                    style={{
                                        alignSelf: 'center',
                                        width: '100%',
                                        marginBottom: 15,
                                    }}>
                                    <Icon
                                        size={24}
                                        name="add-location"
                                        color={customVariables.brandDanger}
                                    />
                                    <Text style={{color: customVariables.brandDanger}}>
                                        Selecciona la dirección de entrega
                                    </Text>
                                </Button>
                            </View>
                        )}
                    </>
                )}
                <Card>
                    <ThumbnailProducts
                        productPictureUrls={shoppingCartContext.shoppingCartItems.map(
                            (x) => x.pictureUrl,
                        )}
                    />
                </Card>
                <Card>
                    <CardItem style={{paddingTop: 0}}>
                        <Body>
                            <H3 style={componentStyles.cardTitle}>Fecha y hora de entrega</H3>
                            <Text note>
                                Seleccionamos por ti la fecha y hora disponible más cercana. Puedes
                                cambiarla si así lo deseas.
                            </Text>
                            {loadingDates ? (
                                <ShippingDateLoading />
                            ) : (
                                <View
                                    style={{
                                        width: '100%',
                                        borderWidth: 1,
                                        height: 70,
                                        borderColor: customVariables.brandLight,
                                        marginTop: 15,
                                        padding: 10,
                                    }}>
                                    <TouchableWithoutFeedback
                                        disabled={!selectedDate}
                                        onPress={selectDateHandler}>
                                        {selectedDate && (
                                            <View>
                                                <Text style={componentStyles.bold}>
                                                    {getShippingFormatedDate(selectedDate.date)}
                                                </Text>
                                                <Text>{selectedDate.shippingTime}</Text>
                                            </View>
                                        )}
                                    </TouchableWithoutFeedback>
                                </View>
                            )}
                        </Body>
                    </CardItem>
                </Card>
                <Card>
                    <View style={[componentStyles.cardPaymentMethodTitle]}>
                        <H3>Método de pago</H3>
                    </View>
                    <CardItem style={{paddingTop: 0}}>
                        <Body style={{alignSelf: 'center'}}>
                            {!paymentIsZero ? (
                                <>
                                    {loadingPaymentMethods ? (
                                        <PaymentMethodLoading />
                                    ) : (
                                        <TouchableWithoutFeedback
                                            disabled={!selectedDate}
                                            onPress={selectPaymentMethodHandler}>
                                            {selectedPaymentMethod &&
                                            selectedPaymentMethod.savedCard ? (
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                        alignSelf: 'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center',
                                                    }}>
                                                    <FastImage
                                                        resizeMode="contain"
                                                        source={{
                                                            uri:
                                                                Config.appUrl +
                                                                selectedPaymentMethod.savedCard
                                                                    .cardLogoUrl,
                                                        }}
                                                        style={{height: 20, width: 30}}
                                                    />
                                                    <View style={{marginLeft: 10}}>
                                                        <Text>
                                                            {
                                                                selectedPaymentMethod.savedCard
                                                                    .cardOwnerName
                                                            }
                                                        </Text>
                                                        <Text note>
                                                            ****
                                                            {
                                                                selectedPaymentMethod.savedCard
                                                                    .lastFourDigits
                                                            }
                                                        </Text>
                                                    </View>
                                                </View>
                                            ) : (
                                                <View
                                                    style={{
                                                        alignSelf: 'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center',
                                                        flexDirection: 'row',
                                                    }}>
                                                    <FastImage
                                                        resizeMode="contain"
                                                        source={{
                                                            uri: selectedPaymentMethod?.logoUrl,
                                                        }}
                                                        style={{height: 20, width: 30}}
                                                    />
                                                    <Text style={{marginLeft: 5}}>
                                                        {selectedPaymentMethod?.name}
                                                    </Text>
                                                </View>
                                            )}
                                        </TouchableWithoutFeedback>
                                    )}
                                </>
                            ) : (
                                <Text>
                                    No necesitas seleccionar un método de pago para tu orden. Da
                                    clic en pagar para completar tu pedido.
                                </Text>
                            )}
                        </Body>
                        {!paymentIsZero && (
                            <Right>
                                <Button transparent onPress={selectPaymentMethodHandler}>
                                    <Text style={{color: customVariables.brandPrimary}}>
                                        Cambiar
                                    </Text>
                                </Button>
                            </Right>
                        )}
                    </CardItem>
                    {shouldCreateCard && (
                        <CardItem>
                            <View style={{flex: 1}}>
                                <Button
                                    iconLeft
                                    transparent
                                    onPress={() =>
                                        goToCreateCard(
                                            selectedPaymentMethod
                                                ? selectedPaymentMethod?.paymentMethodSystemName
                                                : '',
                                        )
                                    }
                                    style={{alignSelf: 'center', width: '100%'}}>
                                    <Icon
                                        size={24}
                                        name="add-circle"
                                        color={customVariables.brandDanger}
                                    />
                                    <Text style={{color: customVariables.brandDanger}}>
                                        Agregar nueva tarjeta
                                    </Text>
                                </Button>
                            </View>
                        </CardItem>
                    )}
                </Card>
                {customerBalance && !loadingBalance && customerBalance.currentBalance > 0 && (
                    <Card>
                        <CardItem
                            onPress={() => setBalanceActive(!customerBalance.balanceIsActive)}>
                            <Body>
                                <View style={{flexDirection: 'row', width: '100%'}}>
                                    <Text style={componentStyles.bold}>
                                        Utilizar saldo disponible
                                    </Text>
                                </View>
                            </Body>
                            <Right style={{flexDirection: 'row', marginLeft: '30%', width: '100%'}}>
                                <Text
                                    style={[
                                        componentStyles.bold,
                                        {color: customVariables.brandPrimary},
                                    ]}>
                                    ${formatCurrency(customerBalance.currentBalance)}
                                </Text>
                                <TeedInput
                                    inputType="checkbox"
                                    check={activeBalanceForCheckBox}
                                    disabled={loadingActiveBalance}
                                    onPress={() =>
                                        setBalanceActive(!customerBalance.balanceIsActive)
                                    }
                                />
                            </Right>
                        </CardItem>
                    </Card>
                )}
                <Card>
                    <CardItem style={{paddingTop: 0}}>
                        <Body>
                            <List style={{width: '100%'}}>
                                {selectedCoupons.map((x, i) => (
                                    <ListItem key={x.discountId}>
                                        <Body>
                                            <Text>{x.name}</Text>
                                            <Text note>{x.couponCode}</Text>
                                        </Body>
                                        <Right>
                                            {removingDiscountId === x.discountId ? (
                                                <Spinner style={{height: 20}} size={24} />
                                            ) : (
                                                <Button
                                                    transparent
                                                    icon
                                                    onPress={() => removeDiscount(i)}>
                                                    <Icon
                                                        size={24}
                                                        name="delete"
                                                        color={customVariables.brandDanger}
                                                    />
                                                </Button>
                                            )}
                                        </Right>
                                    </ListItem>
                                ))}
                            </List>

                            <Button
                                onPress={addCoupon}
                                transparent
                                iconLeft
                                style={{marginTop: 15, alignSelf: 'flex-start'}}>
                                <Icon
                                    size={24}
                                    name="receipt"
                                    color={customVariables.brandPrimary}
                                />
                                <Text style={{color: customVariables.brandPrimary}}>
                                    Agrega un cupón
                                </Text>
                            </Button>
                        </Body>
                    </CardItem>
                </Card>
                {loadingOrderTotals ? (
                    <OrderTotalsLoading />
                ) : (
                    <>
                        {orderTotals && (
                            <Card>
                                <CardItem
                                    style={{
                                        alignContent: 'flex-end',
                                        alignItems: 'flex-end',
                                        alignSelf: 'flex-end',
                                    }}>
                                    <Body>
                                        <Text style={[componentStyles.bold, {marginBottom: 15}]}>
                                            Subtotal:{' '}
                                        </Text>
                                        <Text style={[componentStyles.bold, {marginBottom: 15}]}>
                                            Envío:{' '}
                                        </Text>
                                        {customerBalance != undefined &&
                                            customerBalance.orderUsableBalance > 0 && (
                                                <Text
                                                    style={[
                                                        componentStyles.bold,
                                                        {marginBottom: 15},
                                                    ]}>
                                                    Saldo aplicado:{' '}
                                                </Text>
                                            )}
                                        {orderTotals.orderTotalDiscount > 0 && (
                                            <Text
                                                style={[componentStyles.bold, {marginBottom: 15}]}>
                                                Descuento:{' '}
                                            </Text>
                                        )}
                                        {orderTotals.orderItemsDiscount > 0 && (
                                            <Text
                                                style={[
                                                    componentStyles.bold,
                                                    {
                                                        marginBottom: 15,
                                                        color: customVariables.brandSuccess,
                                                    },
                                                ]}>
                                                Ahorro en productos:{' '}
                                            </Text>
                                        )}
                                        <Text
                                            style={[
                                                componentStyles.bold,
                                                componentStyles.totalSummary,
                                            ]}>
                                            TOTAL:{' '}
                                        </Text>
                                    </Body>
                                    <Right>
                                        <Text style={[{marginBottom: 15}]}>
                                            ${formatCurrency(orderTotals.subTotal)}
                                        </Text>
                                        <Text style={[{marginBottom: 15}]}>
                                            {orderTotals.shipping > 0
                                                ? '$' + formatCurrency(orderTotals.shipping)
                                                : 'GRATIS'}
                                        </Text>
                                        {customerBalance != undefined &&
                                            customerBalance.orderUsableBalance > 0 && (
                                                <Text
                                                    style={[
                                                        {
                                                            marginBottom: 15,
                                                            color: customVariables.brandPrimary,
                                                            fontFamily: 'Quicksand-Bold',
                                                        },
                                                    ]}>
                                                    $
                                                    {formatCurrency(
                                                        customerBalance.orderUsableBalance,
                                                    )}
                                                </Text>
                                            )}
                                        {orderTotals.orderTotalDiscount > 0 ? (
                                            <Text style={[{marginBottom: 15}]}>
                                                -${formatCurrency(orderTotals.orderTotalDiscount)}
                                            </Text>
                                        ) : null}
                                        {orderTotals.orderItemsDiscount > 0 ? (
                                            <Text
                                                style={[
                                                    componentStyles.bold,
                                                    {
                                                        marginBottom: 15,
                                                        color: customVariables.brandSuccess,
                                                    },
                                                ]}>
                                                -${formatCurrency(orderTotals.orderItemsDiscount)}
                                            </Text>
                                        ) : null}
                                        <Text
                                            style={[
                                                componentStyles.totalSummary,
                                                componentStyles.bold,
                                            ]}>
                                            ${formatCurrency(orderTotals.orderTotal)}
                                        </Text>
                                    </Right>
                                </CardItem>
                                {customerBalance != undefined &&
                                    customerBalance.balanceIsActive &&
                                    customerBalance.orderUsableBalance > 0 && (
                                        <Text
                                            note
                                            style={{
                                                color: customVariables.brandDanger,
                                                marginVertical: 15,
                                                fontWeight: 'bold',
                                                textAlign: 'center',
                                            }}>
                                            Utilizarás $
                                            {formatCurrency(customerBalance.orderUsableBalance)} MXN
                                            de tu saldo
                                        </Text>
                                    )}
                            </Card>
                        )}
                    </>
                )}
                {orderMinimumErrorMessage != '' && (
                    <Text
                        note
                        style={{
                            color: customVariables.brandDanger,
                            marginVertical: 15,
                            fontWeight: 'bold',
                            fontSize: 18,
                            textAlign: 'center',
                        }}>
                        {orderMinimumErrorMessage}
                    </Text>
                )}
                {/* <Text note style={{color: 'black', marginVertical: 15}}>
                    Nuestro servicio consiste en la compra de productos en centrales de abasto y
                    consumo con base en una negociación diaria con diferentes proveedores, por lo
                    que la disponibilidad y existencias de inventarios de lo productos no está
                    garantizada al ser ajena a nuestro servicio. En caso de no conseguir algún
                    producto, este será descontado de su pedido. Por esto mismo, todas las imágenes
                    dentro de nuestro catálogo son de referencia y con fines ilustrativos
                    únicamente; los productos pudieran tener variaciones al momento de conseguirlos
                    con los proveedores. Al continuar con su pedido usted acepta estas condiciones y
                    los demás términos de nuestro servicio.
                </Text> */}
                {checkoutError && (
                    <AlertText style={{color: customVariables.brandDanger}}>
                        {checkoutError}
                        {'\n'}
                        {'\n'}
                        Por favor comunícate con nosotros para ayudarte con tu pedido. {'\n'}
                        {'\n'}
                        <Button full iconLeft onPress={openWhatsapp}>
                            <IconFA
                                style={{marginLeft: 15}}
                                color="#FFFFFF"
                                size={24}
                                name="whatsapp"
                            />
                            <Text>Escríbenos por Whatsapp</Text>
                        </Button>
                    </AlertText>
                )}
                {paymentError && (
                    <AlertText style={{color: customVariables.brandDanger}}>
                        {paymentError}
                    </AlertText>
                )}
                <LoadingButton
                    isLoading={placingOrder}
                    loadingText=""
                    disabled={
                        checkingPostalCode ||
                        !selectedAddress ||
                        !selectedDate ||
                        !selectedPaymentMethod ||
                        !orderTotals ||
                        checkoutError !== undefined ||
                        !addressIsValid ||
                        loadingAddresses ||
                        loadingDates ||
                        removingDiscountId > 0 ||
                        loadingAppliedDiscounts ||
                        loadingOrderTotals ||
                        loadingPaymentMethods ||
                        shouldCreateCard ||
                        orderMinimumErrorMessage != '' ||
                        loadingOrderMinimumErrorMessage ||
                        loadingBalance ||
                        loadingActiveBalance
                    }
                    iconLeft
                    full
                    style={componentStyles.continueButton}
                    onPress={processPayment}>
                    Pagar
                </LoadingButton>
                {loadDeviceFingerprint && (
                    <DeviceFingerprint sessionId={deviceFingerprintSessionId} />
                )}
            </Content>
            <Modal
                isVisible={cvvModalVisible}
                onBackdropPress={closeCvvModal}
                onBackButtonPress={closeCvvModal}>
                <View style={{backgroundColor: 'white', alignItems: 'center'}}>
                    <Card noShadow transparent style={{width: '100%'}}>
                        <CardItem header>
                            <Text
                                style={{
                                    color: customVariables.brandPrimary,
                                    fontWeight: 'bold',
                                }}>
                                Por favor ingresa el código de seguridad de tu tarjeta para poder
                                procesar el pago.
                            </Text>
                        </CardItem>
                        <CardItem style={{display: cvvFocus ? 'none' : 'flex'}}>
                            <Text>
                                Si tienes{' '}
                                <Text style={componentStyles.bold}>Visa o MasterCard</Text> ingresa
                                el CVV de 3 dígitos ubicado al reverso de tu tarjeta. Si tu tarjeta
                                es <Text style={componentStyles.bold}>American Express</Text>, el
                                CSC de 4 dígitos estará en la parte delantera.
                            </Text>
                        </CardItem>
                        <CardItem>
                            <Body>
                                <TeedForm style={{width: '100%'}}>
                                    <TeedInput
                                        inputType="text"
                                        keyboardType="number-pad"
                                        value={cardCvv}
                                        label="Ingresa aquí el código de seguridad de tu tarjeta:"
                                        onChangeText={setCardCvv}
                                        onFocus={() => setCvvFocus(true)}
                                        onBlur={() => setCvvFocus(false)}
                                    />
                                </TeedForm>
                            </Body>
                        </CardItem>
                        <CardItem footer style={{alignSelf: 'flex-end'}}>
                            <Button transparent onPress={closeCvvModal}>
                                <Text>Cancelar</Text>
                            </Button>
                            <Button full onPress={captureVisaPayment}>
                                <Text>Pagar</Text>
                            </Button>
                        </CardItem>
                    </Card>
                </View>
            </Modal>
        </Container>
    );
};

const componentStyles = StyleSheet.create({
    bold: {
        fontFamily: 'Quicksand-Bold',
    },
    continueButton: {
        marginVertical: 10,
    },
    cardTitle: {
        height: Platform.OS === 'ios' ? undefined : 30,
        marginTop: Platform.OS === 'ios' ? undefined : 20,
    },
    cardPaymentMethodTitle: {
        marginTop: Platform.OS === 'ios' ? undefined : 10,
        marginLeft: Platform.OS === 'ios' ? undefined : 20,
    },
    totalSummary: {
        fontSize: 20,
    },
});

export default memo(CheckoutScreen);
