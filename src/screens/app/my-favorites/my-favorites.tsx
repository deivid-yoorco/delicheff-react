import React, { memo, useEffect, useState } from 'react';
import { FlatList, ListRenderItemInfo, RefreshControl, StyleSheet, View } from 'react-native';
import customVariables from '@app-theme/native-base-theme/variables/material';
import { IProduct } from '@app-interfaces/product.interface';
import ProductService from '@app-services/product.service';
import ProductCard from '@app-components/product-card';
import { Button, Container, Spinner, Text } from 'native-base';
import Header from '@app-components/header';
import MiniShoppingCart from '@app-components/mini-shopping-cart';
import ProductListLoading from '@app-components/product-list-loading';
import AlertText from '@app-components/alert-text';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AppStackParamList } from 'navigation/navigation';

type ScreenNavigationProp = StackNavigationProp<AppStackParamList, 'MyFavorites'>;
type ScreenRouteProp = RouteProp<AppStackParamList, 'MyFavorites'>;

interface IProps {
    navigation: ScreenNavigationProp,
    route: ScreenRouteProp
};

const elementsPerPage: number = 10;

const MyFavoritesScreen: React.FC<IProps> = (props) => {

    const { initialProducts } = props.route.params;

    const [page, setPage] = useState<number>(initialProducts.length > 0 ? 1 : 0);
    const [canLoadMore, setCanLoadMore] = useState<boolean>(true);
    const [loadingProducts, setLoadingProducts] = useState<boolean>(initialProducts.length > 0 ? false : true);
    const [products, setProducts] = useState<IProduct[]>(initialProducts || []);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);

    useEffect(() => {
        if (initialProducts.length > 0) return;
        getProducts(0);
    }, []);

    const getProducts = (currentPage: number) => {
        if (!canLoadMore || refreshing) return;
        setLoadingProducts(products.length === 0);
        setLoadingMore(currentPage > 0);
        ProductService.getCustomerFavoriteProducts(page, elementsPerPage)
            .then(({ data }) => {
                let current = currentPage === 0 ? [] : [...products];
                let updatedProducts = [...current, ...data];
                setProducts(updatedProducts);
                setPage(currentPage + 1);
                setCanLoadMore(data.length === elementsPerPage);
            })
            .catch((error) => {
                console.log('ERROR LOADING PRODUCTS:', error);
            })
            .finally(() => {
                setLoadingProducts(false);
                setRefreshing(false);
                setLoadingMore(false);
            })
    };

    const onRefresh = () => {
        setPage(0);
        setProducts([]);
        setRefreshing(true);
        setCanLoadMore(true);
        getProducts(0);
    };

    const renderItem = (info: ListRenderItemInfo<IProduct>) => {
        return (
            <View style={{ width: '50%' }}>
                <ProductCard product={info.item} shouldLoadProduct />
            </View>
        );
    };

    return (
        <Container>
            <Header canGoBack style={{ marginBottom: 0 }} rightCustomComponent={<MiniShoppingCart />}>
                Tus favoritos
            </Header>
            {loadingProducts ? <ProductListLoading /> :
                <FlatList
                    data={products}
                    refreshControl={
                        <RefreshControl
                            colors={[customVariables.brandPrimary]}
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                    renderItem={renderItem}
                    numColumns={2}
                    keyExtractor={(item) => item.id.toString()}
                    onEndReached={canLoadMore && !loadingProducts ? () => getProducts(page) : null}
                    initialNumToRender={elementsPerPage}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={
                        <>
                            {(products.length === 0 && !refreshing && !loadingMore && !loadingProducts) &&
                                <>
                                    <AlertText style={{ marginTop: 15 }}>
                                        No tienes productos favoritos. Crea y completa pedidos para poder encontrar productos en esta sección.
                                    </AlertText>
                                    <Button transparent onPress={() => props.navigation.goBack()}>
                                        <Text>
                                            Regresar
                                        </Text>
                                    </Button>
                                </>
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

export default memo(MyFavoritesScreen);