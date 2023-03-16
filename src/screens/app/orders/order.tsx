import React, { useEffect, useContext, useState, useRef } from 'react';
import { StyleSheet, FlatList, ListRenderItemInfo, Dimensions, RefreshControl } from 'react-native';
import { Button, Container, Spinner, View, Text } from 'native-base';
import { StackNavigationProp } from '@react-navigation/stack';
import OrderService from '@app-services/order.service';
import { AppContext } from '@app-context/app.context';
import { IUserOrder } from '@app-interfaces/order.interface';
import Header from '@app-components/header';
import OrderLoading from '../orders/order-loader';
import OrderCard from './components/orderCard';
import AlertText from '@app-components/alert-text';
import { CompositeNavigationProp } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerParamList, AppStackParamList } from 'navigation/navigation';
import customVariables from '@app-theme/native-base-theme/variables/material';
import Icon from 'react-native-vector-icons/MaterialIcons';

type ScreenNavigationProp = CompositeNavigationProp<DrawerNavigationProp<DrawerParamList, 'Orders'>, StackNavigationProp<AppStackParamList>>;

interface IProps {
    navigation: ScreenNavigationProp
};

const elementsPerPage = 10;

const OrderScreen: React.FC<IProps> = (props) => {

    const context = useContext(AppContext);
    const [customerOrders, setCustomerOrders] = useState<IUserOrder[]>([]);
    const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);
    const [canLoadMore, setCanLoadMore] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);

    useEffect(() => {
        loadOrders(0);
    }, []);

    const loadOrders = (currentPage: number) => {
        if (!canLoadMore || refreshing) return;
        setOrdersLoading(customerOrders.length === 0);
        setLoadingMore(currentPage > 0);
        OrderService.getUserOrders(currentPage, elementsPerPage)
            .then(({ data }) => {
                let current = currentPage === 0 ? [] : [...customerOrders];
                let updatedDates = [...current, ...data];
                setCustomerOrders(updatedDates);

                setPage(currentPage + 1);
                setCanLoadMore(data.length === elementsPerPage);
            })
            .catch((error) => {
                console.log('ERROR LOADING ORDERS: ', error);
            })
            .finally(() => { setOrdersLoading(false); setRefreshing(false); setLoadingMore(false); });
    };

    const toggleDrawer = () => {
        props.navigation.toggleDrawer();
    };

    const goToDetails = (item: IUserOrder) => {
        props.navigation.push('OrderDetails', { order: item, address: item.shippingAddress.address1 });
    };

    const renderItem = (info: ListRenderItemInfo<IUserOrder>) => (
        <OrderCard data={info.item} goToDetails={() => goToDetails(info.item)} />
    );

    const onRefresh = () => {
        setPage(0);
        setCustomerOrders([]);
        setRefreshing(true);
        setCanLoadMore(true);
        loadOrders(0);
    };

    return (
        <Container>
            <Header leftIconName='menu' leftPressHandler={toggleDrawer} style={{ marginBottom: 0 }}>
                Mis órdenes
            </Header>
            {ordersLoading ? <OrderLoading /> :
                <FlatList
                    data={customerOrders}
                    refreshControl={
                        <RefreshControl
                            colors={[customVariables.brandPrimary]}
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    onEndReached={canLoadMore && !ordersLoading ? () => loadOrders(page) : null}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={
                        <>
                            {(customerOrders.length === 0 && !refreshing) &&
                                <View>
                                    <AlertText>
                                        No tienes órdenes.
                                    </AlertText>
                                    <Button transparent iconLeft onPress={onRefresh}>
                                        <Icon name='refresh' size={24} color={customVariables.brandPrimary} />
                                        <Text>
                                            Refrescar
                                        </Text>
                                    </Button>
                                </View>
                            }
                            {loadingMore && <Spinner />}
                        </>
                    }
                />
            }
        </Container>
    )
};

const componentStyles = StyleSheet.create({});

export default OrderScreen;