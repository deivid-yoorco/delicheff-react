import React, { useState, useEffect, useContext, memo } from 'react';
import { StyleSheet, FlatList, ListRenderItemInfo, Image, Dimensions, Linking } from 'react-native';
import { Container, View, H1, Item, Input } from 'native-base';
import Header from '@app-components/header';
import { DrawerParamList, AppStackParamList, RootStackParamList } from 'navigation/navigation';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import {
    ISliderPicture,
    IHomeProducts,
    IHomeCategory,
    ITaggableBox,
} from '@app-interfaces/home.interface';
import customVariables from '@app-theme/native-base-theme/variables/material';
import { AppContext } from '@app-context/app.context';
import HomeService from '@app-services/home.service';
import ProductCard from '@app-components/product-card';
import ProductHorizontalList from '@app-components/product-horizontal';
import Slider from '@app-components/slider';
import HomeLoading from './home-loading';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import MiniShoppingCart from '@app-components/mini-shopping-cart';
import { IProduct } from '@app-interfaces/product.interface';
import logo from '@app-assets/images/logo.jpg';
import CategoryService from '@app-services/category.service';
import { ICategory, IParentCategory } from '@app-interfaces/category.interface';
import HorizontalCategoryButtons from './components/horizontal-category-buttons';
import useNotifications from './../../../notifications';
import ProductService from '@app-services/product.service';
import FastImage from 'react-native-fast-image';
import Modal from 'react-native-modal';
import CodeSearch from '@app-screens/app/coverage/components/code-search';
import CoverageService from '@app-services/coverage.service';
import AuthService from '@app-services/auth.service';
import Popup from './components/popup';
import TaggableBoxes from '@app-components/taggable-boxes';
import RewardService from '@app-services/reward.service';
import WebView from 'react-native-webview';

type ScreenNavigationProp = CompositeNavigationProp<
    DrawerNavigationProp<DrawerParamList, 'Home'>,
    CompositeNavigationProp<
        StackNavigationProp<AppStackParamList>,
        StackNavigationProp<RootStackParamList, 'AddressCreate'>
    >
>;

interface IProps {
    navigation: ScreenNavigationProp;
}

const screenWidth = Dimensions.get('window').width;
const categoryImageWidth = screenWidth / 2 - 7;
const categoryImageHeight = 250 / (500 / categoryImageWidth);

const renderFeaturedItem = (info: ListRenderItemInfo<IProduct>) => {
    return (
        <View style={{ width: '50%' }}>
            <ProductCard product={info.item} />
        </View>
    );
};

const HomeScreen: React.FC<IProps> = (props) => {
    const appContext = useContext(AppContext);
    const [] = useNotifications();

    const [loadingSlider, setLoadingSlider] = useState<boolean>(true);
    const [sliderPictures, setSliderPictures] = useState<ISliderPicture[]>([]);
    const [topTaggableBoxes, setTopTaggableBoxes] = useState<ITaggableBox[]>([]);
    const [bottomTaggableBoxes, setBottomTaggableBoxes] = useState<ITaggableBox[]>([]);
    const [loadingHomeProducts, setLoadingHomeProducts] = useState<boolean>(true);
    const [homeProducts, setHomeProducts] = useState<IHomeProducts>();
    const [categoryProducts, setCategoryProducts] = useState<IHomeCategory[]>([]);
    const [featuredCategories, setFeaturedCategories] = useState<ICategory[]>([]);
    const [parentCategories, setParentCategories] = useState<IParentCategory[]>([]);

    const [favoriteProducts, setFavorityProducts] = useState<IProduct[]>([]);

    const [cpValidationModalVisible, setCpValidationModalVisible] = useState<boolean>(false);

    useEffect(() => {
        AuthService.getUser().then((user) => {
            if (user) return;
            CoverageService.cpValidationAlreadyRequested().then((result) => {
                if (!result) setCpValidationModalVisible(true);
            });
        });
    }, []);

    useEffect(() => {
        if (!appContext.appUser || favoriteProducts.length > 0) return;
        getFavoriteProducts();
        getCustomerPoints();
        getProfilePicture();
    }, [appContext.appUser]);

    const getCustomerPoints = () => {
        RewardService.getCurrentUserPoints()
            .then(({ data }) => {
                appContext.updateUserPoints(data);
            })
            .catch((error) => console.log('ERROR GETTING REWARD USER POINTS:', error));
    };

    const getFavoriteProducts = () => {
        ProductService.getCustomerFavoriteProducts(0, 10)
            .then(({ data }) => {
                setFavorityProducts(data);
            })
            .catch((error) => console.log('ERROR GETTING USER FAVORITE PRODUCTS:', error));
    };

    const getProfilePicture = () => {
        AuthService.getProfilePicture()
            .then(({ data }) => {
                if (data === appContext.appUser?.profilePictureId) return;
                appContext.updateProfilePicture(data);
            })
            .catch((error) => console.log('ERROR GETTING PROFILE PICTURE ID:', error));
    };

    useEffect(() => {
        loadHomeData();
    }, []);

    const loadHomeData = () => {
        loadSlider();
        loadCategoriesActive();
        loadHomeProducts();
        loadFeaturedCategories();
        loadTaggableBoxes();
        setTimeout(() => {
            loadCategoryProducts();
        }, 500);
    };

    const loadTaggableBoxes = () => {
        HomeService.getTaggableBoxes()
            .then(({ data }) => {
                if (data.length === 0) return;
                setTopTaggableBoxes(data.filter((x) => x.position === 0));
                setBottomTaggableBoxes(data.filter((x) => x.position === 1));
            })
            .catch((error) => console.log('ERROR GETTING TAGGABLE BOXES', error));
    };

    const loadSlider = () => {
        setLoadingSlider(sliderPictures.length === 0);
        HomeService.getSliderPictures()
            .then(({ data }) => {
                setSliderPictures(data);
            })
            .catch((error) => {
                console.log('ERROR GETTING SLIDER:', error);
            })
            .finally(() => setLoadingSlider(false));
    };

    const loadHomeProducts = () => {
        setLoadingHomeProducts(homeProducts === undefined);
        HomeService.getHomeProducts()
            .then(({ data }) => {
                setHomeProducts(data);
            })
            .catch((error) => {
                console.log('ERROR GETTING HOME PRODUCTS:', error);
            })
            .finally(() => setLoadingHomeProducts(false));
    };

    const loadFeaturedCategories = () => {
        HomeService.getFeaturedCategories()
            .then(({ data }) => {
                console.log(data);
                setFeaturedCategories(data);
            })
            .catch((error) => console.log('ERROR LOADING FEATURED CATEGORIES:', error));
    };

    const loadCategoryProducts = () => {
        HomeService.getCategoryProducts()
            .then(({ data }) => {
                setCategoryProducts(data);
            })
            .catch((error) => {
                console.log('ERROR GETTING CATEGORY PRODUCTS:', error);
            });
    };

    const loadCategoriesActive = () => {
        CategoryService.getParentCategories()
            .then(({ data }) => {
                setParentCategories(data);
            })
            .catch((error) => {
                console.log('ERROR LOADING PARENT CATEGORIES:', error);
            });
    };

    const toggleDrawer = () => {
        props.navigation.toggleDrawer();
    };

    const renderCategoryItem = (info: ListRenderItemInfo<IHomeCategory>) => {
        return (
            <ProductHorizontalList
                key={info.item.category.id}
                products={info.item.products}
                titleName={info.item.category.name}
                titleStyle={componentStyles.title}
                titleAction={() => goToCategory(info.item.category)}
                headerStyle={{ margin: 15 }}
            />
        );
    };

    const goToCategory = (category: ICategory) => {
        props.navigation.push('Category', {
            categoryId: category.id,
            categoryName: category.name,
            isChild: category.parentCategoryId > 0,
        });
    };

    const goToMyFavorites = () => {
        props.navigation.push('MyFavorites', {
            initialProducts: favoriteProducts,
        });
    };

    const closeValidateCpModal = () => {
        setCpValidationModalVisible(false);
    };

    const renderFeaturedCategoryItem = (info: ListRenderItemInfo<ICategory>) => {
        const { item } = info;

        return (
            <TouchableWithoutFeedback
                style={{ padding: 2, justifyContent: 'flex-end' }}
                onPress={() => goToCategory(item)}>
                <FastImage
                    source={{
                        uri: item.pictureUrl.replace(
                            'https://localhost:44387',
                            'http://192.168.0.124:8045',
                        ),
                    }}
                    style={{
                        height: categoryImageHeight,
                        width: categoryImageWidth,
                        borderRadius: 8,
                    }}
                />
            </TouchableWithoutFeedback>
        );
    };

    return (
        <Container>
            <Header
                image
                leftIconName="menu"
                leftPressHandler={toggleDrawer}
                style={{ marginBottom: 0 }}
                rightCustomComponent={<MiniShoppingCart />}>
                <Image resizeMode="contain" source={logo} style={{ width: '100%' }} />
            </Header>
            <TouchableWithoutFeedback
                style={{ paddingHorizontal: 15, margin: 0 }}
                onPress={() => props.navigation.push('Search', { givenSearchTerm: undefined })}>
                <Item onPress={() => props.navigation.push('Search', { givenSearchTerm: undefined })}>
                    <Icon size={24} color={customVariables.brandPrimary} name="search" />
                    <Input disabled placeholder="Buscar productos..." />
                </Item>
            </TouchableWithoutFeedback>
            {loadingSlider || loadingHomeProducts ? (
                <HomeLoading />
            ) : (
                <FlatList
                    ListHeaderComponent={
                        <>
                            {sliderPictures.length > 0 && (
                                <Slider
                                    sliderPictures={sliderPictures}
                                />
                            )}
                            {parentCategories.length > 0 && (
                                <HorizontalCategoryButtons categories={parentCategories} />
                            )}
                            {featuredCategories.length > 0 && (
                                <View style={{ marginTop: 20, marginLeft: 3 }}>
                                    <FlatList
                                        data={featuredCategories}
                                        numColumns={2}
                                        renderItem={renderFeaturedCategoryItem}
                                        keyExtractor={(item) => item.id.toString()}
                                    />
                                </View>
                            )}
                            {favoriteProducts.length > 0 && (
                                <ProductHorizontalList
                                    products={favoriteProducts}
                                    titleName="Tus favoritos"
                                    seeMoreButtonText={'Ver todos\ntus favoritos'}
                                    titleStyle={componentStyles.title}
                                    titleAction={goToMyFavorites}
                                    headerStyle={{ margin: 15 }}
                                />
                            )}
                            {topTaggableBoxes.length > 0 && (
                                <TaggableBoxes boxes={topTaggableBoxes} />
                            )}
                            {homeProducts && homeProducts.headerText !== null ? (
                                <H1 style={[componentStyles.title, { marginLeft: 15 }]}>
                                    {homeProducts.headerText}
                                </H1>
                            ) : null}
                        </>
                    }
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    data={homeProducts ? homeProducts.products : []}
                    renderItem={renderFeaturedItem}
                    keyExtractor={(item) => item.id.toString()}
                    ListFooterComponent={
                        <>
                            <FlatList
                                data={categoryProducts}
                                renderItem={renderCategoryItem}
                                keyExtractor={(item) => item?.category.id.toString()}
                            />
                            {bottomTaggableBoxes.length > 0 && (
                                <TaggableBoxes
                                    boxes={bottomTaggableBoxes}
                                    containerStyle={{ marginTop: 0, marginBottom: 30 }}
                                />
                            )}
                        </>
                    }
                />
            )}
            {cpValidationModalVisible && (
                <Modal
                    backdropTransitionOutTiming={0}
                    hideModalContentWhileAnimating={true}
                    isVisible={cpValidationModalVisible}
                    onBackdropPress={closeValidateCpModal}
                    onBackButtonPress={closeValidateCpModal}>
                    <View style={{ backgroundColor: 'white', alignItems: 'center' }}>
                        <CodeSearch
                            fromModal
                            style={{ padding: 15, marginBottom: 30 }}
                            modalCloseHandler={closeValidateCpModal}
                        />
                    </View>
                </Modal>
            )}
            <Popup />
        </Container>
    );
};

const componentStyles = StyleSheet.create({
    title: {
        paddingBottom: 10,
    },
});

export default memo(HomeScreen);
