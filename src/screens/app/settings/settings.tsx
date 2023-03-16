import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, FlatList, ListRenderItemInfo, Alert, Platform } from 'react-native';
import customVariables from '@app-theme/native-base-theme/variables/material';
import { Container, Body, List, ListItem, Text, View, Right, Button } from 'native-base';
import Header from '@app-components/header';
import { CompositeNavigationProp } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerParamList, AppStackParamList, RootStackParamList } from 'navigation/navigation';
import { StackNavigationProp } from '@react-navigation/stack';
import { ITopic } from '@app-interfaces/setting.interface';
import SettingService from '@app-services/setting.service';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppContext } from '@app-context/app.context';
import { ShoppingCartContext } from '@app-context/shopping-cart.context';

type ScreenNavigationProp = CompositeNavigationProp<DrawerNavigationProp<DrawerParamList, 'Settings'>, StackNavigationProp<RootStackParamList>>;

interface IProps {
    navigation: ScreenNavigationProp
};

interface IProps { }

const SettingsScreen: React.FC<IProps> = (props) => {

    const context = useContext(AppContext);
    const shoppingCartContext = useContext(ShoppingCartContext);
    const [settingPages, setSettingPages] = useState<ITopic[]>([]);

    useEffect(() => {
        if (context.appUser)
            loadSettingPages();
    }, []);

    const loadSettingPages = () => {
        if (settingPages.length > 0) return;
        SettingService.getSettingsPages()
            .then(({ data }) => {
                setSettingPages(data);
            })
            .then((error) => console.log('ERROR LOADING SETTING PAGES:', error))
    };

    const toggleDrawer = () => {
        props.navigation.toggleDrawer();
    };

    const goToTopic = (topic: ITopic) => {
        props.navigation.navigate("Topic", { topic })
    };

    const goToNotifications = () => {
        props.navigation.navigate("Notifications")
    };

    const handleLogOut = () => {
        Alert.alert(
            "Cerrar sesión",
            "¿Confirmas que deseas cerrar sesión?",
            [{ text: 'No' }, { text: "Si", onPress: confirmLogOut }],
            { cancelable: false }
        );
    };

    const toGoEditProfile = () => {
        props.navigation.navigate("EditProfile")
    }

    const confirmLogOut = () => {
        shoppingCartContext.clearShoppingCart();
        context.logOutUser();
    };

    const renderItem = (info: ListRenderItemInfo<ITopic>) => {

        const { item } = info;

        return (
            <ListItem button onPress={() => goToTopic(item)}>
                <Text style={componentStyles.itemText}>{item.name}</Text>
                <View style={componentStyles.itemIcon}>
                    <Button transparent>
                        <Icon
                            size={24}
                            color={customVariables.brandPrimary}
                            name="keyboard-arrow-right"
                        />
                    </Button>
                </View>
            </ListItem>
        );
    };

    return (
        <Container>
            <Header leftIconName='menu' leftPressHandler={toggleDrawer} style={{ marginBottom: 0 }}>
                Mi cuenta
            </Header>
            <View style={componentStyles.container}>
                <FlatList
                    data={settingPages}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    ListHeaderComponent={
                        <ListItem button onPress={toGoEditProfile}>
                            <Text style={componentStyles.itemText}>Mi información</Text>
                            <View style={componentStyles.itemIcon}>
                                <Button transparent>
                                    <Icon
                                        size={24}
                                        color={customVariables.brandPrimary}
                                        name="keyboard-arrow-right"
                                    />
                                </Button>
                            </View>
                        </ListItem>
                    }
                    ListFooterComponent={
                        <>
                            <ListItem button onPress={goToNotifications}>
                                <Text style={componentStyles.itemText}>Notificaciones</Text>
                                <View style={componentStyles.itemIcon}>
                                    <Button transparent>
                                        <Icon
                                            size={24}
                                            color={customVariables.brandPrimary}
                                            name="keyboard-arrow-right"
                                        />
                                    </Button>
                                </View>
                            </ListItem>
                            <ListItem button onPress={handleLogOut}>
                                <Text style={[componentStyles.itemText, { color: customVariables.brandDanger }]}>Cerrar sesión</Text>
                            </ListItem>
                        </>
                    }
                />
            </View>
        </Container>
    )
};

const componentStyles = StyleSheet.create({
    container: {
        flex: 1,
        marginRight: 15
    },
    itemIcon: {
        position: 'absolute', right: 15
    },
    itemText: {
        paddingBottom: Platform.OS === 'ios' ? 0 : 5,
        width: '80%'
    }
});

export default SettingsScreen;