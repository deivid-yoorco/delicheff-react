import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, ListRenderItemInfo } from 'react-native';
import { Container, View, Item, Input, ListItem, Text, Spinner, Right, Body, Left } from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';
import customVariables from '@app-theme/native-base-theme/variables/material';
import Header from '@app-components/header';
import ProductService from '@app-services/product.service';
import Highlighter from 'react-native-highlight-words';
import FastImage from 'react-native-fast-image';
import { Config } from '@app-config/app.config';
import { normalizeText } from '@app-utils/common-utils';
import { IProduct } from '@app-interfaces/product.interface';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList, RootStackParamList } from 'navigation/navigation';
import MiniShoppingCart from '@app-components/mini-shopping-cart';
import analytics from '@react-native-firebase/analytics';
import { ICategory } from '@app-interfaces/category.interface';
import { RouteProp } from '@react-navigation/native';

type ScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Product'>;
type ScreenRouteProp = RouteProp<AppStackParamList, 'Search'>;
interface IProps {
    navigation: ScreenNavigationProp,
    route: ScreenRouteProp,
};

let typingTimer: any;
let doneTypingInterval = 500;

const SearchScreen: React.FC<IProps> = (props) => {

    const { givenSearchTerm } = props.route.params;
    const [searchValue, setSearchValue] = useState<string>('');
    const [products, setProducts] = useState<IProduct[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!givenSearchTerm) return;
        handleTextChange(givenSearchTerm);
    }, []);

    const handleTextChange = (text: string) => {
        setSearchValue(text);
        clearTimeout(typingTimer);
        if (text.length === 0) resetData();
        if (text.length < 3) return;

        typingTimer = setTimeout(async () => {
            searchProducts(text);
            searchCategories(text);
            let body = { search_term: text };
            await analytics().logSearch(body);
        }, doneTypingInterval);
    };

    const searchProducts = async (text: string) => {
        setLoading(products.length === 0);
        ProductService.searchProducts(text)
            .then(({ data }) => {
                setProducts(data);
            })
            .catch((error) => console.log('ERROR SEARCHING FOR PRODUCTS:', error))
            .finally(() => setLoading(false))
    };

    const searchCategories = async (text: string) => {
        setLoading(products.length === 0);
        ProductService.searchCategories(text)
            .then((result) => {
                setCategories(result.data)
            })
            .catch((error) => console.log('ERROR SEARCHING FOR CATEGORIES:', error))
            .finally(() => setLoading(false))
    };

    const resetData = () => {
        setProducts([]);
        setCategories([]);
    };

    const goToProduct = (product: IProduct) => {
        props.navigation.push('Product', { product, shouldLoadProduct: true });
    };

    const goToList = () => {
        props.navigation.push('ListSearch', { searchTerm: searchValue });
    };

    const goToCategory = (category: ICategory) => {
        props.navigation.push('Category', {
            categoryId: category.id,
            categoryName: category.name,
            isChild: category.parentCategoryId > 0
        });
    };

    const renderItem = (info: ListRenderItemInfo<IProduct>) => {
        return (
            <ListItem iconRight style={{ marginRight: 15 }} onPress={() => goToProduct(info.item)}>
                <Body>
                    <View style={{ flexDirection: 'row' }}>
                        <FastImage source={{ uri: Config.apiUrl + info.item.pictureUrl }} style={{ height: 50, width: 50 }} />
                        <View style={{ alignSelf: 'center', marginLeft: 15 }}>
                            <Highlighter
                                style={{ fontFamily: 'Quicksand-Regular' }}
                                highlightStyle={componentStyles.bold}
                                searchWords={searchValue.split(' ').map(x => normalizeText(x))}
                                textToHighlight={normalizeText(info.item.name)}
                            />
                        </View>
                    </View>
                </Body>
                <Right>
                    <Icon size={24} color={customVariables.brandPrimary} name='keyboard-arrow-right' />
                </Right>
            </ListItem>
        );
    };

    const renderCategory = (info: ListRenderItemInfo<ICategory>) => {
        return (
            <ListItem iconRight
                style={{ marginRight: 15, height: 75 }}
                onPress={() => goToCategory(info.item)}>
                <Body>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ alignSelf: 'center', marginLeft: 15 }}>
                            <Text style={componentStyles.bold}>
                                {info.item.name}
                            </Text>
                        </View>
                    </View>
                </Body>
                <Right>
                    <Text style={[{ fontSize: 11, color: customVariables.brandPrimary }, componentStyles.bold]}>
                        Ver categoría
                    </Text>
                </Right>
            </ListItem>

        )
    }

    return (
        <Container>
            <Header leftIconName='menu' canGoBack style={{ marginBottom: 0 }} rightCustomComponent={<MiniShoppingCart />}>
                Buscar productos
            </Header>
            <View style={{ paddingLeft: 15, paddingRight: 15, margin: 0 }}>
                <Item>
                    <Icon size={24} color={customVariables.brandPrimary} name="search" />
                    <Input placeholder="Ingresa el nombre del producto..."
                        value={searchValue}
                        autoFocus={true}
                        onSubmitEditing={goToList}
                        onChangeText={handleTextChange}
                    />
                    {searchValue ?
                        <Icon size={24} color={customVariables.brandPrimary} onPress={goToList} name="arrow-forward" /> : null
                    }
                </Item>
            </View>
            <FlatList
                ListHeaderComponent={(<>
                    {
                        loading ? <Spinner />
                            :
                            <FlatList
                                data={categories}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={renderCategory}
                            />
                    }
                </>)}
                data={products}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
            />
        </Container>
    )
};

const componentStyles = StyleSheet.create({
    bold: {
        fontFamily: 'Quicksand-Bold'
    }
});

export default SearchScreen;