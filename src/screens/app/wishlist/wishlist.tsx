import React, { useEffect, useState, useRef, memo } from 'react';
import { StyleSheet, View, Dimensions, Platform, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from 'navigation/navigation';
import { RouteProp } from '@react-navigation/native';
import {
    Container,
    Spinner,
    Text,
    Button,
    Card,
    CardItem,
    Body,
    ListItem,
    Left,
    Right,
    Radio,
    Content,
    List,
    Form,
    Picker,
} from 'native-base';
import Header from '@app-components/header';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import FastImage from 'react-native-fast-image';
import ProductCard from '@app-components/product-card';
import { RecyclerListView, LayoutProvider, DataProvider } from 'recyclerlistview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import customVariables from '@app-theme/native-base-theme/variables/material';
import { IProduct } from '@app-interfaces/product.interface';
import MiniShoppingCart from '@app-components/mini-shopping-cart';
import ButtonUp from '@app-components/button-up';
import { ScrollEvent } from 'recyclerlistview/dist/reactnative/core/scrollcomponent/BaseScrollView';
import ProductListLoading from '@app-components/product-list-loading';
import Modal from 'react-native-modal';
import SortModal from '@app-components/sort-modal';
import WishlistService from '@app-services/wishlist.service';
import AlertText from '@app-components/alert-text';
import { commonProductCardWidth } from '@app-utils/common-utils';

type ScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Wishlist'>;
type ScreenRouteProp = RouteProp<AppStackParamList, 'Wishlist'>;

interface IProps {
    navigation: ScreenNavigationProp;
    route: ScreenRouteProp;
}

const screenWidth = Dimensions.get('window').width;
const screenValue = Platform.OS === 'ios' ? 5 : 3;
const imageWidth = screenWidth / 2 - screenValue;
const imageHeight = 250 / (500 / imageWidth);

const elementsPerPage = 20;

const dataProviderMaker = (data: any[]) =>
    new DataProvider((r1, r2) => r1.id !== r2.id).cloneWithRows(data);

const WishlistScreen: React.FC<IProps> = (props) => {
    const layoutMaker = () =>
        new LayoutProvider(
            (index) => {
                return 0;
            },
            (type, dim) => {
                dim.width = screenWidth / 2 - 1;
                dim.height = commonProductCardWidth();
            },
        );

    const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
    const [loadingMoreProducts, setLoadingMoreProducts] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);
    const [canLoadMore, setCanLoadMore] = useState<boolean>(true);
    const [visibleButton, setVisibleButton] = useState(false);
    const [isEnd, setIsEnd] = useState(false);
    const [screenElements, setScreenElements] = useState<any[]>([]);
    const [dataProvider, setDataProvider] = useState(dataProviderMaker(screenElements));

    const [reloading, setReloading] = useState<boolean>(false);

    const layoutProvider = useRef(layoutMaker()).current;
    const scrollRef: any = useRef(null);

    useEffect(() => {
        setLoadingProducts(true);
        getWishlistProductsData(0, true, true);
    }, []);

    useEffect(() => {
        setDataProvider(dataProviderMaker(screenElements));
    }, [screenElements]);

    const getWishlistProductsData = (
        page: number,
        canLoadMore: boolean,
        loadingNextPage: boolean = false,
    ) => {
        if (!canLoadMore) return;
        setLoadingMoreProducts(loadingNextPage);
        WishlistService.getWishlistProductData(
            page,
            elementsPerPage
        )
            .then(({ data }) => {
                setScreenElements(data);
                setPage(page + 1);
                setCanLoadMore(data.length === elementsPerPage);
            })
            .catch((error) => {
                console.log('ERROR LOADING WISHLIST PRODUCTS:', error);
            })
            .finally(() => {
                setLoadingMoreProducts(false);
                setLoadingProducts(false);
                setReloading(false);
            });
    };

    const renderScreenElement = (type: React.ReactText, data: any) => {
        return <ProductCard key={data.id} product={data} shouldLoadProduct />;
    };

    const goToSearch = () => {
        props.navigation.push('Search', { givenSearchTerm: undefined });
    };

    const handleScroll = (info: ScrollEvent) => {
        let validateScroll = info.nativeEvent.contentOffset.y > 0 ? true : false;
        setVisibleButton(validateScroll);
        setIsEnd(false);
    };

    return (
        <View style={{ flex: 1 }}>
            <Container>
                <Header
                    canGoBack
                    rightCustomComponent={
                        <>
                            <Button transparent onPress={goToSearch}>
                                <Icon
                                    color={customVariables.brandPrimary}
                                    size={24}
                                    name="search"
                                />
                            </Button>
                            <MiniShoppingCart />
                        </>
                    }>
                    Mi wishlist
                </Header>
                <>
                    {(screenElements.length === 0 &&
                        loadingProducts) ||
                        reloading ?
                        <ProductListLoading />
                        :
                        (
                            screenElements.length > 0 ? (
                                <RecyclerListView
                                    dataProvider={dataProvider}
                                    layoutProvider={layoutProvider}
                                    rowRenderer={renderScreenElement}
                                    onEndReached={
                                        canLoadMore && !loadingMoreProducts
                                            ? () => getWishlistProductsData(page, true, false)
                                            : () => setIsEnd(true)
                                    }
                                    onEndReachedThreshold={0.5}
                                    ref={scrollRef}
                                    style={{ marginBottom: isEnd === true ? 80 : 0 }}
                                    onScroll={(scroll) => handleScroll(scroll)}
                                    renderFooter={() => (
                                        <>
                                            {loadingMoreProducts && <Spinner />}
                                            {!loadingMoreProducts && (
                                                <View style={{ marginBottom: 90 }}></View>
                                            )}
                                        </>
                                    )}
                                />
                            ) :
                                <View>
                                    <AlertText>No tienes productos en tu wishlist.</AlertText>
                                </View>
                        )
                    }
                    <ButtonUp
                        onScroll={() =>
                            scrollRef.current?.scrollToOffset({ x: 0, y: 0, animated: true })
                        }
                        visible={visibleButton}
                    />
                </>
            </Container>
        </View>
    );
};

export default memo(WishlistScreen);
