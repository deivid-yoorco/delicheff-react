import React, {useEffect, useState} from 'react';
import {StyleSheet, FlatList, ListRenderItemInfo, RefreshControl} from 'react-native';
import {Button, Container, Spinner, View, Text} from 'native-base';
import Header from '@app-components/header';
import {IProduct} from '@app-interfaces/product.interface';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppStackParamList} from 'navigation/navigation';
import MiniShoppingCart from '@app-components/mini-shopping-cart';
import {RouteProp} from '@react-navigation/native';
import ProductCard from '@app-components/product-card';
import ProductService from '@app-services/product.service';
import customVariables from '@app-theme/native-base-theme/variables/material';
import AlertText from '@app-components/alert-text';
import ProductListLoading from '@app-components/product-list-loading';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SortModal from '@app-components/sort-modal';

type ScreenNavigationProp = StackNavigationProp<AppStackParamList, 'ListSearch'>;
type ScreenRouteProp = RouteProp<AppStackParamList, 'ListSearch'>;

interface IProps {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
}

const elementsPerPage = 20;

const ListSearchScreen: React.FC<IProps> = (props) => {
  const {searchTerm} = props.route.params;

  const [page, setPage] = useState<number>(0);
  const [canLoadMore, setCanLoadMore] = useState<boolean>(true);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const [sortModalVisible, setSortModalVisible] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<number>(0);

  useEffect(() => {
    getProducts(0);
  }, []);

  const getProducts = (currentPage: number) => {
    if (!canLoadMore || refreshing) return;
    setLoadingProducts(products.length === 0);
    setLoadingMore(currentPage > 0);
    ProductService.searchProductsWithPage(searchTerm, currentPage, elementsPerPage, sortBy)
      .then(({data}) => {
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
      });
  };

  const onRefresh = () => {
    setPage(0);
    setProducts([]);
    setRefreshing(true);
    setCanLoadMore(true);
    getProducts(0);
  };

  const saveSortByHandler = () => {
    toggleModal();
    onRefresh();
  };

  const renderItem = (info: ListRenderItemInfo<IProduct>) => {
    return (
      <View style={{width: '50%'}}>
        <ProductCard product={info.item} shouldLoadProduct />
      </View>
    );
  };

  const toggleModal = () => {
    setSortModalVisible((x) => !x);
  };

  const updateSortValue = (itemValue: React.ReactText) => {
    setSortBy(parseInt(itemValue.toString()));
  };

  return (
    <Container>
      <Header
        leftIconName="menu"
        canGoBack
        style={{marginBottom: 0}}
        rightCustomComponent={
          <>
            <Button transparent onPress={toggleModal}>
              <Icon color={customVariables.brandPrimary} size={24} name="sort" />
            </Button>
            <MiniShoppingCart />
          </>
        }>
        Buscando '{searchTerm}'
      </Header>
      {loadingProducts ? (
        <ProductListLoading />
      ) : (
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
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            <>
              {products.length === 0 && !refreshing && !loadingMore && !loadingProducts && (
                <>
                  <AlertText style={{marginTop: 15}}>
                    No se encontraron resultados para la búsqueda '{searchTerm}'
                  </AlertText>
                  <Button transparent onPress={() => props.navigation.goBack()}>
                    <Text>Regresar</Text>
                  </Button>
                </>
              )}
              {loadingMore && <Spinner />}
            </>
          }
        />
      )}
      <SortModal
        sortModalVisible={sortModalVisible}
        toggleModal={toggleModal}
        sortBy={sortBy}
        updateSortValue={updateSortValue}
        saveSortByHandler={saveSortByHandler}
      />
    </Container>
  );
};

const componentStyles = StyleSheet.create({});

export default ListSearchScreen;
