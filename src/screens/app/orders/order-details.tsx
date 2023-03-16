import React, { useEffect, useState } from 'react';
import { Container, Text, View, Card, CardItem, Left, Body, Button } from 'native-base';
import Header from '@app-components/header';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from 'navigation/navigation';
import { RouteProp } from '@react-navigation/native';
import { Alert, FlatList, ListRenderItemInfo, StyleSheet, Platform } from 'react-native';
import { IProduct } from '@app-interfaces/product.interface';
import FastImage from 'react-native-fast-image';
import { Config } from '@app-config/app.config';
import { formatCurrency } from '@app-utils/common-utils';
import customVariables from '@app-theme/native-base-theme/variables/material';
import format from 'date-fns/format';
import locale from 'date-fns/locale/es';
import { getQuantity } from '@app-utils/product-utils';
import OrderService from '@app-services/order.service';
import LoadingButton from '@app-components/loading-button';
import AlertText from '@app-components/alert-text';

type ScreenNavigationProp = StackNavigationProp<AppStackParamList, 'OrderDetails'>;
type ScreenRouteProp = RouteProp<AppStackParamList, 'OrderDetails'>;

interface IProps {
    navigation: ScreenNavigationProp,
    route: ScreenRouteProp
};

const orderDetailData = (title: string, value: string, total: boolean = false) => (
    <View style={{ flexDirection: 'row', marginHorizontal: 15 }}>
        <Text note style={total ? componentStyles.titleTotal : componentStyles.subTitle}>{title}</Text>
        <Text note style={[total ? componentStyles.titleTotal : componentStyles.subTitle, { textAlign: 'right' }]}>{value}</Text>
    </View>
);

const orange: string = '#ce613b';

const renderItem = (info: ListRenderItemInfo<IProduct>) => {

    const { item } = info;

    return (
        <Card transparent>
            <CardItem>
                <Left>
                    <FastImage style={{ width: 50, height: 50 }} source={{ uri: Config.apiUrl + info.item.pictureUrl }} />
                    <Body>
                        <Text style={componentStyles.bold}>{item.name}</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <Text note>{getQuantity(item)}</Text>
                            <Text note> {item.selectedPropertyOption}</Text>
                            <Text note> | {formatCurrency(item.subTotal)} MXN</Text>
                        </View>
                    </Body>
                </Left>
            </CardItem>
        </Card>
    )
};

const OrderDetailsScreen: React.FC<IProps> = (props) => {

    const [notDeliveredProducts, setNotDeliveredProducts] = useState<IProduct[]>([]);
    const [loadingReOrder, setLoadingReOrder] = useState<boolean>(false);
    const [alert, setAlert] = useState<boolean>(false);

    const data = props.route.params.order;
    const address = props.route.params.address;

    const date = new Date(data.creationDate);
    const deliveryDate = new Date(data.selectedShippingDate);
    const formattedDate = format(date, 'dd MMMM, yyyy h:mm a', { locale: locale });
    const formatedDeliveryDate = format(deliveryDate, 'dd MMMM, yyyy', { locale: locale });

    useEffect(() => {
        getNotDeliveredProducts();
    }, []);

    const getNotDeliveredProducts = () => {
        OrderService.getNotDeliveredProducts(Number(props.route.params.order.orderNumber))
            .then((result) => {
                setNotDeliveredProducts(result.data)
            })
            .catch((error) => {
                console.log('ERROR GET NOT DELIVERED PRODUCTS', error)
            })
    };

    const alertReOrder = (orderId: string) => {
        console.log('orderId', orderId)
        Alert.alert(
            'Agregar productos al carrito',
            '¿Confirmas que deseas agregar los productos de esta orden a tu carrito?',
            [{ text: "No" }, { text: "Si", onPress: () => addProducts(orderId) }],
            { cancelable: false }
        );
    };

    const addProducts = (orderId: string) => {
        setLoadingReOrder(true)
        OrderService.reOrder(Number(orderId))
            .then(() => {
                setAlert(true);
            })
            .catch((error) => {
                console.log('ERROR IN RE-ORDER', error);
            })
            .finally(() => setLoadingReOrder(false))
    };

    const goToCart = () => {
        props.navigation.push('ShoppingCart');
    };

    return (
        <Container>
            <Header leftIconName='menu' canGoBack style={{ marginBottom: 0 }}>
                {'Orden #' + data.orderNumber}
            </Header>
            <FlatList
                ListHeaderComponent={(<>
                    <Text style={componentStyles.titleDetails}>Detalles de la orden</Text>
                    <Text style={componentStyles.divider}></Text>
                    {data.isCancelled &&
                        <>
                            <Text style={[componentStyles.bold, componentStyles.cancelledText]}>
                                Cancelada
                            </Text>
                            <Text style={componentStyles.divider}></Text>
                        </>
                    }
                    {orderDetailData('Dirección de envío:', address)}
                    {orderDetailData('Fecha de creación:', formattedDate)}
                    {orderDetailData('Fecha de entrega:', formatedDeliveryDate)}
                    {orderDetailData('Horario de entrega:', data.selectedShippingTime)}
                    {orderDetailData('Estado del envío:', data.shippingStatus)}
                    {orderDetailData('Estado del pago:', data.paymentStatus)}
                    {orderDetailData('Subtotal:', '$' + formatCurrency(data.orderSubtotal))}
                    {orderDetailData('Costo de envío:', '$' + formatCurrency(data.orderShipping))}
                    {orderDetailData('Total:', '$' + formatCurrency(data.orderTotal), true)}
                    <Text style={componentStyles.titleProducts}>Productos</Text>
                    <Text style={componentStyles.divider}></Text>
                </>)}
                data={data.orderItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                ListFooterComponent={
                    <FlatList
                        data={notDeliveredProducts}
                        renderItem={renderItem}
                        ListHeaderComponent={(<>
                            <Text style={componentStyles.titleProducts}>Productos no entregados</Text>
                            <Text style={componentStyles.divider}></Text>
                        </>)}
                        ListEmptyComponent={<Text note style={componentStyles.emptyText}>Todos los productos fueron entregados</Text>}
                        ListFooterComponent={(<>
                            {!alert ?
                                <LoadingButton
                                    textStyle={{ textAlign: 'center' }}
                                    isLoading={loadingReOrder}
                                    loadingText='Agregando productos'
                                    disabled={loadingReOrder}
                                    style={componentStyles.textButton}
                                    onPress={() => alertReOrder(data.orderNumber)}
                                >
                                    Agregar estos productos a mi carrito otra vez
                                </LoadingButton>
                                :
                                <View style={{ marginBottom: 30 }}>
                                    <AlertText style={{ color: customVariables.brandPrimary }}>
                                        ¡Los productos de han agregado correctamente a tu carrito!
                                    </AlertText>
                                    <Button style={{ width: '80%', alignSelf: 'center' }} onPress={goToCart}>
                                        <Text>
                                            Ir al carrito
                                        </Text>
                                    </Button>
                                </View>
                            }
                        </>)}
                    />
                }
            />
        </Container>
    )
};

const componentStyles = StyleSheet.create({
    titleDetails: {
        paddingLeft: 15,
        fontSize: 20,
        color: orange
    },
    divider: {
        backgroundColor: '#d5d6da',
        height: 0.8,
        marginBottom: 7,
        marginLeft: 15,
        marginRight: 15,
        marginTop: 7
    },
    viewTitles: {
        width: '50%',
        paddingLeft: 15
    },
    subTitle: {
        marginTop: 5,
        width: '50%'
    },
    titleTotal: {
        color: customVariables.brandPrimary,
        fontFamily: 'Quicksand-Bold',
        width: '50%',
        fontSize: 20
    },
    viewContents: {
        width: '50%',
        alignItems: 'flex-end',
        paddingRight: 15
    },
    titleProducts: {
        marginLeft: 15,
        marginTop: 15,
        fontSize: 20,
        color: orange
    },
    image: {
        marginLeft: 5,
        height: 50,
        width: 50,
        alignSelf: 'center'
    },
    viewText: {
        marginLeft: 2
    },
    textName: {
        marginTop: 10,
        fontSize: 17
    },
    bold: {
        fontFamily: 'Quicksand-Bold'
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 6,
        marginBottom: 50
    },
    textButton: {
        marginHorizontal: 35,
        padding: 5,
        marginBottom: 20
    },
    cancelledText: {
        color: orange,
        textAlign: 'center',
        fontSize: 20,
        marginBottom: Platform.OS == 'ios' ? 3 : 7
    }
});

export default OrderDetailsScreen;