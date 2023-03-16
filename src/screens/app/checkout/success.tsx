import React, { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import customVariables from '@app-theme/native-base-theme/variables/material';
import { Container, Content, H1, H3, Text, View, Card, Button } from 'native-base';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, DrawerParamList, AppStackParamList } from 'navigation/navigation';
import { RouteProp, CommonActions, CompositeNavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

type ScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Success'>;
type ScreenRouteProp = RouteProp<AppStackParamList, 'Success'>;

interface IProps {
    navigation: ScreenNavigationProp,
    route: ScreenRouteProp
};

const orderDetailData = (title: string, value: string) => (
    <View style={{ flexDirection: 'row', marginHorizontal: 15 }}>
        <Text style={[componentStyles.bold, { width: '50%', textAlign: 'right', color: customVariables.brandPrimary }]}>{title}</Text>
        <Text style={{ width: '50%', textAlign: 'left', marginLeft: 15 }}>{value}</Text>
    </View>
);

const SuccessScreen: React.FC<IProps> = (props) => {

    const { orderId, selectedShippingDate, selectedShippingTime, successNote, paymentMethd } = props.route.params;

    useEffect(() => {
        props.navigation.addListener('beforeRemove', (e) => {
            if (e.data.action.type !== "GO_BACK")
                return;
            e.preventDefault();
        });
    }, []);

    const continueHandler = () => {
        props.navigation.popToTop();
    };

    return (
        <Container>
            <View style={componentStyles.container}>
                <H1>¡Gracias!</H1>
                <H3 style={{ textAlign: 'center' }}>Tu orden ha sido creada correctamente.</H3>
                <Icon size={100} name='check-circle' color={customVariables.brandPrimary} style={{ marginBottom: 15 }} />
                {orderDetailData('Número de orden', orderId)}
                {orderDetailData('Fecha de entrega', selectedShippingDate)}
                {orderDetailData('Horario de entrega', selectedShippingTime)}
                {orderDetailData('Método de pago', paymentMethd)}
                {successNote &&
                    <Text style={{ marginTop: 15, textAlign: 'center' }}>
                        {successNote}
                    </Text>
                }
                <Button style={{ marginTop: 30 }} onPress={continueHandler}>
                    <Text>
                        Continuar
                    </Text>
                </Button>
            </View>
        </Container>
    )
};

const componentStyles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 15
    },
    bold: {
        fontFamily: 'Quicksand-Bold'
    }
});

export default memo(SuccessScreen);