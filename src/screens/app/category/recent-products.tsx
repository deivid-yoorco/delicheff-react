import React, { useEffect, useState, useRef, memo } from 'react';
import { View, Dimensions, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList, DrawerParamList } from 'navigation/navigation';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import {
    Container,
    Spinner,
    Button,
} from 'native-base';
import Header from '@app-components/header';
import CategoryService from '@app-services/category.service';
import ProductCard from '@app-components/product-card';
import { RecyclerListView, LayoutProvider, DataProvider } from 'recyclerlistview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import customVariables from '@app-theme/native-base-theme/variables/material';
import MiniShoppingCart from '@app-components/mini-shopping-cart';
import ButtonUp from '@app-components/button-up';
import { ScrollEvent } from 'recyclerlistview/dist/reactnative/core/scrollcomponent/BaseScrollView';
import ProductListLoading from '@app-components/product-list-loading';
import { commonProductCardWidth } from '@app-utils/common-utils';

type ScreenNavigationProp = CompositeNavigationProp<StackNavigationProp<AppStackParamList, 'Category'>, StackNavigationProp<DrawerParamList, 'Home'>>;
type ScreenRouteProp = RouteProp<AppStackParamList, 'RecentProducts'>;

interface IProps {
    navigation: ScreenNavigationProp;
    route: ScreenRouteProp;
}

const screenWidth = Dimensions.get('window').width;
const screenValue = Platform.OS === 'ios' ? 5 : 3;
const imageWidth = screenWidth / 2 - screenValue;
const imageHeight = 250 / (500 / imageWidth);

const dataProviderMaker = (data: any[]) =>
    new DataProvider((r1, r2) => r1.id !== r2.id).cloneWithRows(data);

const RecentProductsScreen: React.FC<IProps> = (props) => {

    const { settings } = props.route.params;

    const layoutMaker = () =>
        new LayoutProvider(
            (index) => {
                return 1;
            },
            (type, dim) => {
                dim.width = imageWidth + screenValue / 2;
                dim.height = imageHeight + (Platform.OS === 'ios' ? screenValue / 2 : 0);
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
        getProducts(page, canLoadMore);
    }, []);

    useEffect(() => {
        setDataProvider(dataProviderMaker(screenElements));
    }, [screenElements]);

    const getProducts = (
        page: number,
        canLoadMore: boolean,
        resetCurrent: boolean = false,
    ) => {
        if (!canLoadMore) return;
        setLoadingProducts(true);
        setLoadingMoreProducts(true);
        CategoryService.getRecentProducts(page)
            .then(({ data }) => {
                let currentData = !resetCurrent ? screenElements : [];
                let updatedProducts = [...currentData, ...data];
                setScreenElements(updatedProducts);
                setPage(page + 1);
                setCanLoadMore(data.length === settings?.productsPerPage);
            })
            .catch((error) => {
                console.log('ERROR LOADING RECENT PRODUCTS:', error);
            })
            .finally(() => {
                setLoadingMoreProducts(false);
                setLoadingProducts(false);
                setReloading(false);
            });
    };

    const renderScreenElement = (type: React.ReactText, data: any) => {
        return <ProductCard key={data.id} product={data} shouldLoadProduct />
    };

    const returnHome = () => {
        props.navigation.push('Home');
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
                    {settings?.textMenu == '' || settings?.textMenu == undefined ? 'Productos recientes' : settings?.textMenu}
                </Header>
                {((screenElements.length === 0 &&
                    loadingProducts) ||
                    reloading) && <ProductListLoading />}
                {screenElements.length > 0 && (
                    <RecyclerListView
                        dataProvider={dataProvider}
                        layoutProvider={layoutProvider}
                        rowRenderer={renderScreenElement}
                        onEndReached={
                            canLoadMore && !loadingMoreProducts
                                ? () => getProducts(page, true, false)
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
                )}
                <ButtonUp
                    onScroll={() =>
                        scrollRef.current?.scrollToOffset({ x: 0, y: 0, animated: true })
                    }
                    visible={visibleButton}
                />
            </Container>
        </View>
    );
};

export default memo(RecentProductsScreen);
