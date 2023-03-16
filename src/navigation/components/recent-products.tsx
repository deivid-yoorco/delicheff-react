import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableWithoutFeedback, Platform } from 'react-native';
import { View, Text } from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList, RootStackParamList } from 'navigation/navigation';
import customVariables from '@app-theme/native-base-theme/variables/material';
import CategoryService from '@app-services/category.service';
import { IRecentProductsSettings } from '@app-interfaces/category.interface';

type ScreenNavigationProp = CompositeNavigationProp<StackNavigationProp<AppStackParamList, 'Category'>, StackNavigationProp<RootStackParamList, 'Auth'>>;
interface IProps { }

const colorTextTheme = 'rgba(28,28,30,0.68)';

const DrawerRecentProducts: React.FC<IProps> = () => {

    const navigation = useNavigation<ScreenNavigationProp>();
    const [settings, setSettings] = useState<IRecentProductsSettings>();

    useEffect(() => {
        CategoryService.getRecentProductsPluginInfo()
            .then(({ data }) => {
                setSettings(data);
            })
            .catch((error) => {
                console.log('ERROR LOADING RECENT PRODUCTS SETTINGS:', error);
            });
    }, []);

    const goToRecentProducts = () => {
        navigation.navigate('RecentProducts', { settings });
        return;
    };

    return (
        <>
            {settings?.active &&
                <TouchableWithoutFeedback onPress={goToRecentProducts}>
                    <View style={componentStyles.viewContent}>
                        <Icon color={colorTextTheme}
                            style={componentStyles.iconItem}
                            size={24}
                            name='new-releases'
                        />
                        <Text style={[componentStyles.titleTitle, componentStyles.bold]}>
                            {settings?.textMenu == '' || settings.textMenu == undefined ? 'Productos recientes' : settings?.textMenu}
                        </Text>
                    </View>
                </TouchableWithoutFeedback>
            }
        </>
    )
};

const componentStyles = StyleSheet.create({
    viewContent: {
        flexDirection: 'row',
        marginHorizontal: 10,
        paddingVertical: 10,
        marginTop: 5
    },
    iconItem: {
        marginLeft: '3%',
        marginRight: '12%',
        marginTop: 3,
        marginBottom: 2
    },
    titleTitle: {
        marginTop: 3,
        color: colorTextTheme,
        fontSize: 14.5
    },
    bold: {
        fontFamily: 'Quicksand-Bold'
    },
    badge: {
        transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }],
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? -12 : -15,
        right: -5,
        backgroundColor: customVariables.brandDanger
    }
});

export default DrawerRecentProducts;