import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import customVariables from '@app-theme/native-base-theme/variables/material';
import { Container, Content, View, Button, Text, Spinner } from 'native-base';
import Header from '@app-components/header';
import TeedInput from '@app-components/input';
import CheckoutService from '@app-services/checkout.service';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from 'navigation/navigation';
import AlertText from '@app-components/alert-text';

type ScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DiscountAdd'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'DiscountAdd'>;

interface IProps {
    navigation: ScreenNavigationProp,
    route: ScreenRouteProp
};

const AddDiscountScreen: React.FC<IProps> = (props) => {

    const [couponCode, setCouponCode] = useState<string>();
    const [validating, setValidating] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>();

    const goBackHandler = () => {
        props.navigation.goBack();
    };

    const validateCoupon = () => {
        if (!couponCode) return;
        setErrorMessage(undefined);
        setValidating(true);
        CheckoutService.applyDiscountCoupon(couponCode)
            .then(({ data }) => {
                props.route.params.setSelectedCoupons(prev => [...prev, data]);
                goBackHandler();
            })
            .catch((error) => {
                console.log('ERROR VALIDATING COUPON:', error.result);
                setValidating(false);
                setErrorMessage('El cupón ingresado no es válido o no puede ser aplicado a tu orden.')
            })
    };

    return (
        <Container>
            <Header customGoBackHandler={goBackHandler} customBackIcon='close'>
                Agregar cupón
            </Header>
            <Content>
                <View style={{ flexDirection: 'row' }}>
                    <TeedInput containerStyles={{ marginTop: 0, flex: 1 }} label='Ingresa tu cupón' onChangeText={(text) => setCouponCode(text)} />
                    {validating ?
                        <Spinner style={{ marginHorizontal: 28 }} /> :
                        <Button disabled={validating || !couponCode} transparent style={{ alignSelf: 'center' }} onPress={validateCoupon}>
                            <Text>
                                Validar
                            </Text>
                        </Button>
                    }
                </View>
                {errorMessage &&
                    <AlertText style={{ color: customVariables.brandDanger, marginTop: 15 }}>
                        {errorMessage}
                    </AlertText>
                }
            </Content>
        </Container>
    )
};

const componentStyles = StyleSheet.create({});

export default AddDiscountScreen;