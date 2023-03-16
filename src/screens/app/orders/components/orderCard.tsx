import React from 'react';
import {
    StyleSheet,
    Dimensions,
    Image,
    FlatList,
    ListRenderItemInfo,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';
import {Text, Card, CardItem, View} from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {IUserOrder} from '@app-interfaces/order.interface';
import format from 'date-fns/format';
import spainLocale from 'date-fns/locale/es';
import customVariables from '@app-theme/native-base-theme/variables/material';
import {formatCurrency} from '@app-utils/common-utils';
import ThumbnailProducts from '@app-components/thumbnail-products';

const {width, height} = Dimensions.get('window');

interface IProps {
    data: IUserOrder;
    goToDetails: () => void;
}

const orange: string = '#ce613b';

const OrderCard: React.FC<IProps> = (props) => {
    const date = new Date(props.data.selectedShippingDate);
    const formattedDate = format(date, 'dd MMMM, yyyy', {locale: spainLocale});
    const notSend =
        props.data.shippingStatus === 'No enviado' ? orange : customVariables.brandPrimary;
    const notPayment =
        props.data.paymentStatus === 'Pendiente' ? orange : customVariables.brandPrimary;

    return (
        <TouchableWithoutFeedback onPress={props.goToDetails} style={{flex: 1}}>
            <Card style={componentStyles.card}>
                <CardItem>
                    <View style={componentStyles.viewTitle}>
                        <Text style={[componentStyles.textOrder, componentStyles.bold]}>
                            {'Orden #' + props.data.orderNumber}
                        </Text>
                        <Text note>{formattedDate}</Text>
                    </View>
                    <View style={componentStyles.viewIcons}>
                        <Icon
                            name="monetization-on"
                            size={18}
                            color={customVariables.brandLight}
                            style={componentStyles.iconDollar}
                        />
                        {!props.data.isCancelled ? (
                            <>
                                <Icon
                                    name="local-shipping"
                                    size={18}
                                    color={notSend}
                                    style={componentStyles.iconTruck}
                                />
                                <Icon
                                    name="credit-card"
                                    size={18}
                                    color={notPayment}
                                    style={componentStyles.iconCredit}
                                />
                            </>
                        ) : (
                            <Icon
                                name="delete"
                                size={18}
                                color="#FFFFFF"
                                style={componentStyles.iconCredit}
                            />
                        )}
                    </View>
                    <View style={{width: '33%'}}>
                        <Text>
                            {' '}
                            $ {formatCurrency(props.data.orderTotal)} {}
                        </Text>
                        {!props.data.isCancelled ? (
                            <>
                                <Text style={{color: notSend}}> {props.data.shippingStatus}</Text>
                                <Text style={{color: notPayment}}> {props.data.paymentStatus}</Text>
                            </>
                        ) : (
                            <Text style={[{color: orange}, componentStyles.bold]}> Cancelada</Text>
                        )}
                    </View>
                </CardItem>
                <ThumbnailProducts
                    style={{marginBottom: 15}}
                    productPictureUrls={props.data.orderItems.map((x) => x.pictureUrl)}
                />
            </Card>
        </TouchableWithoutFeedback>
    );
};

const componentStyles = StyleSheet.create({
    card: {
        marginRight: 10,
        marginLeft: 10,
    },
    viewTitle: {
        flexDirection: 'column',
        width: '55%',
    },
    textOrder: {
        color: customVariables.brandPrimary,
        fontSize: 22,
    },
    viewIcons: {
        width: '10%',
        marginLeft: 7,
        marginTop: 3,
    },
    iconDollar: {
        textAlign: 'center',
        marginBottom: 3,
    },
    iconTruck: {
        textAlign: 'center',
        marginBottom: 5,
    },
    iconCredit: {
        textAlign: 'center',
    },
    imageProduct: {
        width: 55,
        height: 55,
        borderRadius: 55,
        borderColor: customVariables.brandLight,
        borderWidth: 1,
    },
    imageWhite: {
        width: 55,
        height: 55,
        borderRadius: 55,
        borderColor: customVariables.brandLight,
        borderWidth: 1,
        marginLeft: -12,
        backgroundColor: 'white',
        justifyContent: 'center',
    },
    textImageWhite: {
        textAlign: 'center',
        textAlignVertical: 'center',
        fontWeight: 'bold',
    },
    bold: {
        fontFamily: 'Quicksand-Bold',
    },
});

export default OrderCard;
