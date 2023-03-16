import React, {useContext, useEffect} from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import customVariables from '@app-theme/native-base-theme/variables/material';
import {Container, Content, H1, H3, Text, View, Card, Button} from 'native-base';
import {StackNavigationProp} from '@react-navigation/stack';
import {
    RootStackParamList,
    DrawerParamList,
    AppStackParamList,
    AuthStackParamList,
} from 'navigation/navigation';
import {RouteProp, CommonActions, CompositeNavigationProp} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {AppContext} from '@app-context/app.context';
import HTML from 'react-native-render-html';

type ScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'RegistrationSuccessful'>;
type ScreenRouteProp = RouteProp<AuthStackParamList, 'RegistrationSuccessful'>;

interface IProps {
    navigation: ScreenNavigationProp;
    route: ScreenRouteProp;
}

const RegistrationSuccessfulScreen: React.FC<IProps> = (props) => {
    const context = useContext(AppContext);
    const {user, successNote} = props.route.params;

    useEffect(() => {
        props.navigation.addListener('beforeRemove', (e) => {
            if (e.data.action.type !== 'GO_BACK') return;
            e.preventDefault();
        });
    }, []);

    const continueHandler = () => {
        context.setAppUser(user);
        props.navigation.popToTop();
    };

    return (
        <Container>
            <View style={componentStyles.container}>
                <H1>¡Felicidades {user.firstName}!</H1>
                <H3 style={{textAlign: 'center'}}>
                    Tu cuenta en Deliclub ha sido creada correctamente.
                </H3>
                <Icon
                    size={100}
                    name="check-circle"
                    color={customVariables.brandPrimary}
                    style={{marginBottom: 15}}
                />
                {successNote ? (
                    <HTML
                        html={successNote || ''}
                        imagesMaxWidth={Dimensions.get('window').width}
                        staticContentMaxWidth={Dimensions.get('window').width}
                        tagsStyles={{p: {marginVertical: 5}, img: {maxWidth: '100%'}}}
                    />
                ) : null}
                <Button style={{marginTop: 30}} onPress={continueHandler}>
                    <Text>Continuar</Text>
                </Button>
            </View>
        </Container>
    );
};

const componentStyles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 15,
    },
    bold: {
        fontFamily: 'Quicksand-Bold',
    },
});

export default RegistrationSuccessfulScreen;
