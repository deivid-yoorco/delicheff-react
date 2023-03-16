import React, { memo, useEffect, useState } from 'react';
import { FlatList, Image, ListRenderItemInfo, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Button, Right, Text, View } from 'native-base';
import { ICategoryTree, IRecentProductsSettings } from '@app-interfaces/category.interface';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import avocado from '@app-assets/images/avocado.jpg';
import customVariables from '@app-theme/native-base-theme/variables/material';
import CategoryService from '@app-services/category.service';
import { useNavigation } from '@react-navigation/native';
import { AppStackParamList } from 'navigation/navigation';

type ScreenNavigationProp = StackNavigationProp<AppStackParamList>;

interface IProps { };

const colorTextTheme = 'rgba(28,28,30,0.68)'

const AccordionCategories: React.FC<IProps> = (props) => {

    const [elementVisible, setElementVisible] = useState<number>(0);
    const [categoriesVisibles, setCategoriesVisibles] = useState<boolean>(false);
    const [subCategoriesVisibles, setSubCategoriesVisibles] = useState<boolean>(false);
    const [categories, setCategories] = useState<ICategoryTree[]>([]);
    const navigation = useNavigation<ScreenNavigationProp>();

    useEffect(() => {
        CategoryService.getCategoryTree()
            .then((result) => {
                setCategories(result.data);
            })
            .catch((error) => {
                console.log('ERROR GETTING CATEGORY TREE', error);
            })
    }, []);

    const goToCategory = (category: ICategoryTree) => {
        navigation.push('Category', {
            categoryId: category.id,
            categoryName: category.name,
            isChild: category.parentId > 0
        });
    };

    const handleElementVisibleButton = (item: ICategoryTree) => {
        setElementVisible(elementVisible === item.id ? 0 : item.id);
        setSubCategoriesVisibles(true);
    };

    const renderItem = (item: ICategoryTree) => {
        return (
            <React.Fragment key={item.id}>
                {
                    (item.parentId === 0 && categoriesVisibles) &&
                    <View style={[componentStyles.categoryContainer]}>
                        <TouchableWithoutFeedback onPress={() => goToCategory(item)}>
                            <Text style={[componentStyles.categoryName]}>{item.name}</Text>
                        </TouchableWithoutFeedback>
                        <Right style={{ marginRight: 15 }}>
                            <Button
                                style={{ width: 30 }}
                                transparent
                                small
                                onPress={() => handleElementVisibleButton(item)}>
                                {
                                    subCategoriesVisibles && elementVisible === item.id ?
                                        <Icon color={colorTextTheme} size={15} name='remove-circle-outline' />
                                        :
                                        <Icon color={colorTextTheme} size={15} name='add-circle-outline' />
                                }
                            </Button>
                        </Right>
                    </View>
                }
                {elementVisible === item.parentId && item.parentId !== 0 && categoriesVisibles &&
                    <TouchableWithoutFeedback onPress={() => goToCategory(item)}>
                        <View style={componentStyles.subCategoryContainer}>
                            <Text style={componentStyles.subCategoryName}>{item.name}</Text>
                            <Right style={{ marginRight: 10 }}>
                                <Button
                                    transparent
                                    small
                                    onPress={() => goToCategory(item)}>
                                    <Icon color={colorTextTheme} size={15} name='keyboard-arrow-right' />
                                </Button>
                            </Right>
                        </View>
                    </TouchableWithoutFeedback>
                }
            </React.Fragment>
        );
    };

    const handleCategoriesButton = () => {
        setCategoriesVisibles(!categoriesVisibles);
        setElementVisible(0);
    };

    return (
        <>
            {categories.length > 0 &&
                <>
                    <TouchableWithoutFeedback onPress={handleCategoriesButton}>
                        <View style={componentStyles.viewContent}>
                            <Icon color={colorTextTheme}
                                style={componentStyles.iconItem}
                                size={24}
                                name='list'
                            />
                            <Text style={[componentStyles.titleTitle, componentStyles.bold]}>{'Categorías'}</Text>
                            <Right style={{ marginRight: 15 }}>
                                <Button
                                    transparent
                                    small
                                    onPress={handleCategoriesButton}
                                >
                                    {
                                        !categoriesVisibles ?
                                            <Icon color={colorTextTheme} size={15} name='add-circle-outline' />
                                            :
                                            <Icon color={colorTextTheme} size={15} name='remove-circle-outline' />
                                    }
                                </Button>
                            </Right>
                        </View>
                    </TouchableWithoutFeedback>
                    {categories.map(c => (
                        renderItem(c)
                    ))}
                </>
            }
        </>
    )
};

const componentStyles = StyleSheet.create({
    viewContent: {
        flexDirection: 'row',
        marginHorizontal: 10,
        marginTop: 5,
        paddingVertical: 6
    },
    iconItem: {
        marginLeft: '3%',
        marginRight: '12%',
        marginTop: 3
    },
    titleTitle: {
        marginTop: 3,
        color: colorTextTheme,
        fontSize: 15
    },
    categoryContainer: {
        flexDirection: 'row',
        marginHorizontal: 10,
        borderRadius: 4,
        marginVertical: 5
    },
    categoryName: {
        marginLeft: 12,
        width: '70%',
        textAlignVertical: 'center',
        color: colorTextTheme
    },
    subCategoryContainer: {
        marginHorizontal: 10,
        paddingVertical: 10,
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: customVariables.brandLight
    },
    subCategoryName: {
        fontFamily: 'Quicksand-Regular',
        marginLeft: 8,
        width: '70%',
        textAlignVertical: 'center',
        alignSelf: 'center',
        fontSize: 14.5
    },
    bold: {
        fontFamily: 'Quicksand-Bold'
    }
});

export default memo(AccordionCategories);