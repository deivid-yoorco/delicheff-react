import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, Platform, Linking } from 'react-native';
import customVariables from '@app-theme/native-base-theme/variables/material';
import { Container, Body, ListItem, Text, Right, Switch } from 'native-base';
import Header from '@app-components/header';
import { CompositeNavigationProp } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerParamList, RootStackParamList } from 'navigation/navigation';
import { StackNavigationProp } from '@react-navigation/stack';
import AuthService from '@app-services/auth.service';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { checkNotifications, requestNotifications } from 'react-native-permissions';
import NotificationService from '@app-services/notification.service';

type ScreenNavigationProp = CompositeNavigationProp<DrawerNavigationProp<DrawerParamList, 'Settings'>, StackNavigationProp<RootStackParamList>>;

interface IProps {
    navigation: ScreenNavigationProp
};

const NotificationsScreen: React.FC<IProps> = (props) => {

    const [active, setActive] = useState<boolean>(false);

    useEffect(() => {
        NotificationService.getNotificationStatus()
            .then((result) => {
                if (Platform.OS === 'ios') {
                    checkNotifications()
                        .then((permissions) => {
                            setActive(result === 'true' && permissions.settings.alert === true && permissions.settings.badge === true);
                        })
                        .catch((error) => console.log("ERROR CHECKING NOTIFICATIONS:", error))
                }
                else {
                    setActive(result === 'true');
                }
            })
            .catch((error) => {
                console.log('ERROR GETTING NOTIFICATION STATUS', error)
            })
    }, []);

    const handleSwitchChange = (value: boolean) => {
        if (value) {
            handleActiveNotificationStatus();
        } else {
            Alert.alert(
                'Atención',
                '¿Confirmas que deseas desactivar las notificaciones? Te estaremos enviando información relevante sobre tus pedidos y promociones que seguramente te puedan interesar.',
                [{ text: "No" }, { text: "Si", onPress: () => saveNotificationStatus(false) }],
                { cancelable: false }
            );
        }
    };

    const handleActiveNotificationStatus = () => {
        if (Platform.OS === 'ios') {
            checkNotifications()
                .then((permissions) => {
                    if (permissions.settings.alert && permissions.settings.badge) {
                        saveNotificationStatus(true);
                    }
                    else {
                        requestNotifications(['alert', 'badge', 'sound'])
                            .then((result) => {
                                if (result.status === 'blocked') {
                                    Alert.alert(
                                        'Atención',
                                        'Debes activar manualmente las notificaciones para poder recibirlas en tu dispositivo. Al continuar, serás redirigido a la configuración de tu dispositivo, donde deberás seleccionar la opción "Notificaciones" y luego "Permitir notificaciones"',
                                        [{ text: "Cancelar" }, { text: "Continuar", onPress: handleBlockedNotifications }],
                                        { cancelable: false }
                                    );
                                }
                                else if (result.settings.alert && result.settings.badge)
                                    saveNotificationStatus(true);
                            })
                            .catch((error) => {
                                saveNotificationStatus(false);
                                console.log('ERROR REQUESTING PERMISSIONS:', error);
                            })
                    }
                })
                .catch((error) => {
                    console.log('ERROR CHECKING NOTIFICATION', error)
                })
        } else {
            saveNotificationStatus(true);
        }
    };

    const handleBlockedNotifications = () =>  {
        saveNotificationStatus(true);
        Linking.openSettings();
    };

    const saveNotificationStatus = (value: boolean) => {
        AuthService.setNotificationStatus(value)
            .then(() => {
                setActive(value);
            })
            .catch((error) => {
                console.log('ERROR SAVING NOTIFICATIONS STATUS', error)
            })
    };

    return (
        <Container>
            <Header canGoBack>
                Notificaciones
            </Header>
            <ListItem icon>
                <Body>
                    <Text>Recibir notificaciones</Text>
                </Body>
                <Right>
                    <Switch
                        value={active}
                        onValueChange={handleSwitchChange}
                        thumbColor={active ? customVariables.brandPrimary : customVariables.brandLight}
                        trackColor={{ false: customVariables.brandLight, true: customVariables.brandLight }}
                        ios_backgroundColor={customVariables.brandPrimary}
                    />
                </Right>
            </ListItem>
        </Container>
    )
};

const componentStyles = StyleSheet.create({
    container: {
        flex: 1,
        marginRight: 15
    }
});

export default NotificationsScreen;