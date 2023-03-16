import React, { useEffect, useState } from 'react';
import { StyleSheet, ListRenderItemInfo, Alert } from 'react-native';
import customVariables from '@app-theme/native-base-theme/variables/material';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { DrawerParamList, RootStackParamList } from 'navigation/navigation';
import { Container, ListItem, Body, View, Right, Text, Button, Spinner, Toast } from 'native-base';
import Header from '@app-components/header';
import { FlatList } from 'react-native-gesture-handler';
import { IPaymentMethod, ISavedCard } from '@app-interfaces/checkout.interface';
import Icon from 'react-native-vector-icons/MaterialIcons';
import analytics from '@react-native-firebase/analytics';
import FastImage from 'react-native-fast-image';
import { Config } from '@app-config/app.config';
import CheckoutService from '@app-services/checkout.service';
import VisaPaymentService from '@app-services/visa-payment.service';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import PaymentSelectionLoader from './payment-selection-loader';

type ScreenNavigationProp = CompositeNavigationProp<StackNavigationProp<RootStackParamList, 'PaymentSelection'>, DrawerNavigationProp<DrawerParamList, 'PaymentMethods'>>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'PaymentSelection'>;

interface IProps {
    navigation: ScreenNavigationProp,
    route: ScreenRouteProp
};

const PaymentSelectionScreen: React.FC<IProps> = (props) => {

    const { params } = props.route;
    const [currentPaymentMethods, setCurrentPaymentMethods] = useState<IPaymentMethod[]>(params?.paymentMethods || []);
    const [currentSelected, setCurrentSelected] = useState<IPaymentMethod | undefined>(params?.selectedPaymentMethod);
    const [deletingCard, setDeletingCard] = useState<boolean>(false);
    const [loadingPaymentMethods, setLoadingPaymentMethods] = useState<boolean>(false);

    useEffect(() => {
        if (params && Object.keys(params).length > 0) return;
        setLoadingPaymentMethods(true);
        CheckoutService.getPaymentMethods()
            .then(({ data }) => {
                setCurrentPaymentMethods(data);
            })
            .catch((error) => console.log("ERROR GETTING PAYMENT METHODS:", error))
            .finally(() => setLoadingPaymentMethods(false))
    }, []);

    const goBackHandler = (selected?: IPaymentMethod) => {
        let newPaymentMethod = selected || currentSelected;
        if (params?.onGoBack && newPaymentMethod)
            params?.onGoBack(newPaymentMethod);
        props.navigation.goBack();
    };

    const selectPaymentMethodHandler = async (selected: IPaymentMethod) => {
        if (!params) return;
        setCurrentSelected(selected);
        if (params) {
            let body = {
                checkout_step: 3,
                checkout_option: selected.paymentMethodSystemName
            };
            await analytics().logSetCheckoutOption(body);
            setTimeout(() => {
                goBackHandler(selected);
            }, 10);
        }
    };

    const deleteCard = (index: number) => {
        Alert.alert(
            'Eliminar tarjeta',
            '¿Confirmas que deseas eliminar esta tarjeta?',
            [{ text: "No" }, { text: "Si", onPress: () => confirmDeleteCard(index) }],
            { cancelable: false }
        );
    };

    const confirmDeleteCard = (index: number) => {
        setDeletingCard(true);
        let current = [...currentPaymentMethods];
        switch (current[index].paymentMethodSystemName) {
            case "Payments.Stripe":
                deleteStripeCard(index);
            case "Payments.Visa":
                deleteVisaCard(index)
        }
    };

    const deleteVisaCard = (index: number) => {
        let current = [...currentPaymentMethods];
        let selectedCard = current[index];
        if (!selectedCard.savedCard) return;
        VisaPaymentService.deleteVisaCard(selectedCard.savedCard.serviceCustomerId)
            .then(() => {
                current[index].savedCard = undefined;
                setCurrentPaymentMethods(current);

                if (currentSelected && currentSelected.paymentMethodSystemName === current[index].paymentMethodSystemName)
                    setCurrentSelected(current[index]);
            })
            .catch((error) => {
                console.log('ERROR DELETING CARD:', error);
                Toast.show({
                    text: 'Ocurrió un problema y no pudimos borrar tu tarjeta. Por favor, inténtalo más tarde.',
                    buttonText: "Ok",
                    type: 'danger',
                    duration: 5000
                });
            })
            .finally(() => setDeletingCard(false))
    };

    const deleteStripeCard = (index: number) => {
        CheckoutService.deleteStripeCard()
            .then(() => {
                let current = [...currentPaymentMethods];
                current[index].savedCard = undefined;
                setCurrentPaymentMethods(current);

                if (currentSelected && currentSelected.paymentMethodSystemName === current[index].paymentMethodSystemName)
                    setCurrentSelected(current[index]);
            })
            .catch((error) => {
                console.log('ERROR DELETING CARD:', error);
                Toast.show({
                    text: 'Ocurrió un problema y no pudimos borrar tu tarjeta. Por favor, inténtalo más tarde.',
                    buttonText: "Ok",
                    type: 'danger',
                    duration: 5000
                });
            })
            .finally(() => setDeletingCard(false))
    };

    const renderItem = (info: ListRenderItemInfo<IPaymentMethod>) => {

        const { item } = info;
        let isSelected = currentSelected && currentSelected.paymentMethodSystemName === item.paymentMethodSystemName && params;
        let isCard = item.paymentMethodSystemName === "Payments.Visa";

        return (
            <ListItem iconRight onPress={() => selectPaymentMethodHandler(item)}>
                <Body>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {item.savedCard ?
                            <>
                                <FastImage
                                    resizeMode='contain'
                                    source={{ uri: Config.appUrl + item.savedCard.cardLogoUrl }}
                                    style={{ height: 20, width: 30 }}
                                />
                                <View style={{ marginLeft: 10 }}>
                                    <Text style={isSelected ? [componentStyles.selected, componentStyles.bold] : undefined}>
                                        {item.savedCard.cardOwnerName}
                                    </Text>
                                    <Text note style={isSelected ? [componentStyles.bold] : undefined}>
                                        ****{item.savedCard.lastFourDigits}
                                    </Text>
                                </View>
                            </>
                            :
                            <>
                                <FastImage resizeMode='contain' source={{ uri: item.logoUrl }} style={{ height: 20, width: 30 }} />
                                <Text style={[isSelected ? [componentStyles.selected, componentStyles.bold] : null, { marginLeft: 10 }]}>
                                    {item.name}
                                </Text>
                            </>
                        }
                    </View>
                </Body>
                <Right>
                    <View style={{ flexDirection: 'row' }}>
                        {item.savedCard ?
                            <>
                                {deletingCard ? <Spinner size={24} style={{ height: 24, marginRight: 15 }} /> :
                                    <Icon onPress={() => deleteCard(info.index)} size={24} color={customVariables.brandDanger} name='delete' style={{ marginRight: 15 }} />
                                }
                            </> :
                            (isCard && !params) &&
                            <Icon onPress={() => goToCreateCard(info.item.paymentMethodSystemName)} size={24} color={customVariables.brandPrimary} name='add-circle' style={{ marginRight: 15 }} />
                        }
                        {isSelected && <Icon size={24} color={customVariables.brandPrimary} name='check' />}
                    </View>
                </Right>
            </ListItem>
        );
    };

    const goToCreateCard = (paymentMethodSystemName: string) => {
        props.navigation.navigate('CardCreate', {
            paymentMethodSystemName: paymentMethodSystemName,
            onGoBack: (newCard: ISavedCard) => {
                if (!newCard) return;
                let current = [...currentPaymentMethods];
                let index = current.map(x => x.paymentMethodSystemName).indexOf("Payments.Visa");
                if (index === -1) return;
                current[index].savedCard = newCard;
                setCurrentPaymentMethods(current);
            }
        });
    };

    const toggleDrawer = () => {
        props.navigation.toggleDrawer();
    };

    return (
        <Container>
            {params ?
                <Header customGoBackHandler={() => goBackHandler()} customBackIcon='close'>
                    Método de pago
                </Header>
                :
                <Header leftIconName='menu' leftPressHandler={toggleDrawer} style={{ marginBottom: 0 }}>
                    Métodos de pago
                </Header>
            }
            {loadingPaymentMethods ? <PaymentSelectionLoader /> :
                <FlatList
                    data={currentPaymentMethods}
                    keyExtractor={(item) => item.paymentMethodSystemName}
                    renderItem={renderItem}
                    ListHeaderComponent={(
                        <>
                            {!params ?
                                <View style={{ margin: 15 }}>
                                    <Text>Estos son los métodos de pago disponibles para tus compras:</Text>
                                </View> : null}
                        </>
                    )}
                />
            }
        </Container>
    )
};

const componentStyles = StyleSheet.create({
    bold: {
        fontFamily: 'Quicksand-Bold'
    },
    disabled: {
        color: customVariables.brandLight
    },
    selected: {
        color: customVariables.brandPrimary
    }
});

export default PaymentSelectionScreen;