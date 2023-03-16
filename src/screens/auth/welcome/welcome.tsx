import React, { useContext, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { ImageOverlay } from '@app-components/image-overlay';
import { Button, Text, H1, H3 } from 'native-base';
import customVariables from '@app-theme/native-base-theme/variables/material';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList, RootStackParamList } from 'navigation/navigation';
import { Config } from '@app-config/app.config';
import { AppContext } from '@app-context/app.context';
import { CompositeNavigationProp } from '@react-navigation/native';

type ScreenNavigationProp = CompositeNavigationProp<StackNavigationProp<AuthStackParamList, 'Welcome'>, StackNavigationProp<RootStackParamList, 'Main'>>;

interface IProps {
    navigation: ScreenNavigationProp
};

const WelcomeScreen: React.FC<IProps> = (props) => {

    const appContext = useContext(AppContext);

    useEffect(() => {
        if (appContext.appUser)
            props.navigation.navigate('Main');
    }, [appContext.appUser]);

    const loginHandler = () => {
        props.navigation.navigate('Login');
    };

    const registerHandler = () => {
        props.navigation.navigate('Register');
    };

    const continueHandler = () => {
        props.navigation.goBack();
    };

    return (
        <ImageOverlay
            style={componentStyles.container}
            source={{ uri: Config.appUrl + "/images/app-media/welcome-background.jpg" }}>
            <View style={componentStyles.headerContainer}></View>
            <View style={componentStyles.buttonContainer}>
                {/* <Text style={componentStyles.title}>
                    Para ofrecerte una mejor experiencia y que puedas empezar a agregar productos a tu carrito, es necesario que te registres o inicies sesión.
                </Text> */}
                <Button style={componentStyles.button} onPress={loginHandler}>
                    <Text>
                        Iniciar sesión
                    </Text>
                </Button>
                <Button light style={componentStyles.registerButton} onPress={registerHandler}>
                    <Text style={{ color: customVariables.brandPrimary }}>
                        Regístrate
                    </Text>
                </Button>
                <Button transparent onPress={continueHandler}>
                    <Text style={componentStyles.cancelButton}>
                        Cancelar
                    </Text>
                </Button>
            </View>
        </ImageOverlay>
    )
};

const componentStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 20
    },
    logo: {
        height: 200,
        flex: 1,
        marginTop: 20
    },
    buttonContainer: {
        margin: 15
    },
    button: {
        marginVertical: 10
    },
    registerButton: {
        backgroundColor: customVariables.inverseTextColor,
        borderColor: customVariables.brandPrimary,
        borderWidth: 1
    },
    cancelButton: {
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
        height: 25
    },
    title: {
        textAlign: 'center',
        color: 'white',
        fontWeight: 'normal',
        backgroundColor: "#CE613B",
        padding: 10
    }
});

export default WelcomeScreen;