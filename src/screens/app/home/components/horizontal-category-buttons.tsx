import { IParentCategory } from '@app-interfaces/category.interface';
import { Button, Text } from 'native-base';
import React, { memo } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from 'navigation/navigation';
import { useNavigation } from '@react-navigation/native';

type ScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Category'>;

interface IProps {
    categories: IParentCategory[],
};

const HorizontalCategoryButtons: React.FC<IProps> = (props) => {

    const { categories } = props;

    const navigation = useNavigation<ScreenNavigationProp>();

    const goToCategory = (category: IParentCategory) => {
        navigation.push('Category', {
            categoryId: category.id,
            categoryName: category.name
        });
    };

    const renderItem = (info: ListRenderItemInfo<IParentCategory>) => (
        <Button
            small
            onPress={() => goToCategory(info.item)}
            style={{ paddingBottom: 8, marginHorizontal: 6, marginStart: info.index == 0 ? 10 : 0 }}
        >
            <Text>{info.item.name}</Text>
        </Button>
    )

    return (
        <FlatList
            style={{ height: 40, marginTop: 10 }}
            contentContainerStyle={{ alignSelf: 'center' }}
            data={categories}
            renderItem={renderItem}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            horizontal={true}
            removeClippedSubviews={true}
        />
    )
};


export default memo(HorizontalCategoryButtons);