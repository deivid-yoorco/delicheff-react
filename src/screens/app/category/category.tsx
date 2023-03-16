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
import { ICategory } from '@app-interfaces/category.interface';
import CategoryService from '@app-services/category.service';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import FastImage from 'react-native-fast-image';
import ProductCard from '@app-components/product-card';
import { RecyclerListView, LayoutProvider, DataProvider } from 'recyclerlistview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import customVariables from '@app-theme/native-base-theme/variables/material';
import { IProduct } from '@app-interfaces/product.interface';
import CategoryLoading from './category-loading';
import MiniShoppingCart from '@app-components/mini-shopping-cart';
import ButtonUp from '@app-components/button-up';
import { ScrollEvent } from 'recyclerlistview/dist/reactnative/core/scrollcomponent/BaseScrollView';
import ProductListLoading from '@app-components/product-list-loading';
import Modal from 'react-native-modal';
import SortModal from '@app-components/sort-modal';
import { commonProductCardWidth } from '@app-utils/common-utils';

type ScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Category'>;
type ScreenRouteProp = RouteProp<AppStackParamList, 'Category'>;

interface IProps {
    navigation: ScreenNavigationProp;
    route: ScreenRouteProp;
}

const ViewTypes = {
    CATEGORY: 0,
    PRODUCT: 1,
};

const screenWidth = Dimensions.get('window').width;
const screenValue = Platform.OS === 'ios' ? 5 : 3;
const imageWidth = screenWidth / 2 - screenValue;
const imageHeight = 250 / (500 / imageWidth);

const elementsPerPage = 20;

const dataProviderMaker = (data: any[]) =>
    new DataProvider((r1, r2) => r1.id !== r2.id).cloneWithRows(data);

let categoryCount: number = 0;

const CategoryScreen: React.FC<IProps> = (props) => {
    const layoutMaker = () =>
        new LayoutProvider(
            (index) => {
                return categoryCount > index && !props.route.params.isChild ? 0 : 1;
            },
            (type, dim) => {
                switch (type) {
                    case ViewTypes.CATEGORY:
                        dim.width = imageWidth + screenValue / 2;
                        dim.height = imageHeight + (Platform.OS === 'ios' ? screenValue / 2 : 0);
                        break;
                    case ViewTypes.PRODUCT:
                        dim.width = screenWidth / 2 - 1;
                        dim.height = commonProductCardWidth();
                        break;
                    default:
                        break;
                }
            },
        );

    const [loadingChildCategories, setLoadingChildCategories] = useState<boolean>(false);
    const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
    const [loadingMoreProducts, setLoadingMoreProducts] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);
    const [canLoadMore, setCanLoadMore] = useState<boolean>(true);
    const [visibleButton, setVisibleButton] = useState(false);
    const [isEnd, setIsEnd] = useState(false);
    const [screenElements, setScreenElements] = useState<any[]>([]);
    const [dataProvider, setDataProvider] = useState(dataProviderMaker(screenElements));

    const [sortModalVisible, setSortModalVisible] = useState<boolean>(false);
    const [sortBy, setSortBy] = useState<number>(0);
    const [reloading, setReloading] = useState<boolean>(false);

    const layoutProvider = useRef(layoutMaker()).current;
    const scrollRef: any = useRef(null);

    useEffect(() => {
        if (props.route.params.isChild) {
            getProducts(sortBy, page, canLoadMore);
        } else {
            getChildCategories();
        }
    }, []);

    useEffect(() => {
        setDataProvider(dataProviderMaker(screenElements));
    }, [screenElements]);

    const getChildCategories = () => {
        setLoadingChildCategories(screenElements.length === 0);
        CategoryService.getChildCategories(props.route.params.categoryId)
            .then(({ data }) => {
                if (data.length % 2 !== 0) data.push({} as ICategory);
                categoryCount = data.length;
                getProducts(sortBy, page, canLoadMore, false, false, data);
                setScreenElements(data);
            })
            .catch((error) => {
                console.log('ERROR LOADING CHILD CATEGORIES:', error);
            })
            .finally(() => setLoadingChildCategories(false));
    };

    const getProducts = (
        sortBy: number,
        page: number,
        canLoadMore: boolean,
        resetCurrent: boolean = false,
        loadingNextPage: boolean = false,
        categoryData: any[] = [],
    ) => {
        if (!canLoadMore) return;
        setLoadingProducts(screenElements.length === 0 || resetCurrent);
        setLoadingMoreProducts(loadingNextPage);
        CategoryService.getProductsInCategory(
            props.route.params.categoryId,
            page,
            elementsPerPage,
            sortBy,
        )
            .then(({ data }) => {
                let currentData =
                    categoryData.length > 0 ? categoryData : !resetCurrent ? screenElements : [];
                let updatedProducts = [...currentData, ...data];
                setScreenElements(updatedProducts);
                setPage(page + 1);
                setCanLoadMore(data.length === elementsPerPage);
            })
            .catch((error) => {
                console.log('ERROR LOADING CATEGORY PRODUCTS:', error);
            })
            .finally(() => {
                setLoadingMoreProducts(false);
                setLoadingProducts(false);
                setReloading(false);
            });
    };

    const toggleModal = () => {
        setSortModalVisible((x) => !x);
    };

    const renderScreenElement = (type: React.ReactText, data: any) => {
        switch (type) {
            case ViewTypes.CATEGORY:
                return (
                    <TouchableWithoutFeedback
                        key={data.id}
                        style={{ padding: 4, justifyContent: 'flex-end' }}
                        onPress={data.id ? () => goToCategory(data) : undefined}>
                        <FastImage
                            source={{ uri: data.pictureUrl }}
                            style={{
                                height: imageHeight - (Platform.OS === 'ios' ? 0 : 5),
                                width: imageWidth - (Platform.OS === 'ios' ? 0 : 3),
                                borderRadius: 8,
                            }}
                        />
                    </TouchableWithoutFeedback>
                );
            case ViewTypes.PRODUCT:
                return <ProductCard key={data.id} product={data} shouldLoadProduct />;
            default:
                return null;
        }
    };

    const goToCategory = (category: ICategory) => {
        props.navigation.push('Category', {
            categoryId: category.id,
            categoryName: category.name,
            isChild: true,
        });
    };

    const goToSearch = () => {
        props.navigation.push('Search', { givenSearchTerm: undefined });
    };

    const handleScroll = (info: ScrollEvent) => {
        let validateScroll = info.nativeEvent.contentOffset.y > 0 ? true : false;
        setVisibleButton(validateScroll);
        setIsEnd(false);
    };

    const updateSortValue = (itemValue: React.ReactText) => {
        setSortBy(parseInt(itemValue.toString()));
    };

    const saveSortByHandler = () => {
        setCanLoadMore(true);
        setPage(0);
        toggleModal();
        setReloading(true);
        getProducts(sortBy, 0, true, true);
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
                            {props.route.params.isChild && (
                                <Button transparent onPress={toggleModal}>
                                    <Icon
                                        color={customVariables.brandPrimary}
                                        size={24}
                                        name="sort"
                                    />
                                </Button>
                            )}
                            <MiniShoppingCart />
                        </>
                    }>
                    {props.route.params.categoryName}
                </Header>
                {loadingChildCategories ? (
                    <CategoryLoading />
                ) : (
                    <>
                        {(screenElements.length === 0 &&
                            loadingProducts &&
                            !loadingChildCategories) ||
                            reloading ? <ProductListLoading /> : (
                            screenElements.length > 0 && (
                                <RecyclerListView
                                    dataProvider={dataProvider}
                                    layoutProvider={layoutProvider}
                                    rowRenderer={renderScreenElement}
                                    onEndReached={
                                        canLoadMore && !loadingMoreProducts
                                            ? () => getProducts(sortBy, page, true, false)
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
                            )
                        )}
                        <ButtonUp
                            onScroll={() =>
                                scrollRef.current?.scrollToOffset({ x: 0, y: 0, animated: true })
                            }
                            visible={visibleButton}
                        />
                    </>
                )}
            </Container>
            <SortModal
                sortModalVisible={sortModalVisible}
                toggleModal={toggleModal}
                sortBy={sortBy}
                updateSortValue={updateSortValue}
                saveSortByHandler={saveSortByHandler}
            />
        </View>
    );
};

export default memo(CategoryScreen);
