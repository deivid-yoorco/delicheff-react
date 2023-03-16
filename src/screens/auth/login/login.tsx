import React, { useContext, useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import * as Yup from 'yup';
import { AppContext } from '@app-context/app.context';
import { Formik, FormikHelpers } from 'formik';
import TeedForm from '@app-components/form';
import TeedInput from '@app-components/input';
import { Button, Text, Container, Content, Toast } from 'native-base';
import LoadingButton from '@app-components/loading-button';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from 'navigation/navigation';
import Header from '@app-components/header';
import { getRequestMessage, getRequestMessageType } from '@app-utils/request-utils';
import AuthService from '@app-services/auth.service';
import customVariables from '@app-theme/native-base-theme/variables/material';
import analytics from '@react-native-firebase/analytics';
import ShoppingCartService from '@app-services/shopping-cart.service';
import { ShoppingCartContext } from '@app-context/shopping-cart.context';
import FormScreenComponent from '@app-components/form-screen';

type ScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface IProps {
    navigation: ScreenNavigationProp
};

interface IFormFields {
    email: string,
    password: string
};

const formValidationSchema = Yup.object().shape<IFormFields>({
    email: Yup.string().email('Ingresa un correo electrónico válido.').required('El correo electrónico es requerido.'),
    password: Yup.string().required('La contraseña es requerida.')
});

const formInitialValues: IFormFields = {
    //email: 'cliente@teed.com.mx',
    // password: 'teed1234'
    email: '',
    password: ''
};

const LoginScreen: React.FC<IProps> = (props) => {

    const context = useContext(AppContext);
    const shoppingCartContext = useContext(ShoppingCartContext);
    const [countError, setCountError] = useState<number>(0);

    const submitHandler = (values: IFormFields, action: FormikHelpers<IFormFields>) => {
        action.setSubmitting(true);
        AuthService.emailExists(values.email)
            .then(async ({ data }) => {
                if (data != undefined) {
                    let exists = data.exists === undefined ? 0 : data.exists;
                    let message = data.message === undefined ? "" : data.message;
                    if (exists == true) {
                        doLoginWork(values, action);
                    } else {
                        action.setSubmitting(false);
                        Toast.show({
                            text: message != '' ? message : getRequestMessage(0, ''),
                            buttonText: "Ok",
                            type: 'danger',
                            duration: 5000
                        })
                    }
                } else {
                    action.setSubmitting(false);
                    Toast.show({
                        text: getRequestMessage(0, ''),
                        buttonText: "Ok",
                        type: getRequestMessageType(0),
                        duration: 5000
                    })
                }
            })
            .catch((error) => {
                doLoginWork(values, action);
            });
    };

    const doLoginWork = (values: IFormFields, action: FormikHelpers<IFormFields>) => {
        AuthService.login(values.email, values.password)
            .then(async (user) => {
                ShoppingCartService.getShoppingCartData()
                    .then(async ({ data }) => {
                        shoppingCartContext.setShoppingCartItems(data);
                        context.setAppUser(user);
                        let body = { method: 'email' };
                        await analytics().logLogin(body);
                        props.navigation.popToTop();
                    })
                    .catch((error) => {
                        console.log('ERROR GETTING SHOPPING CART QUANTITY:', error);
                    })
            })
            .catch((error) => {
                console.log(JSON.stringify(error));
                action.setSubmitting(false);

                let status = error.response === undefined ? 0 : error.response.status;
                let message = error.response === undefined ? "" : error.response.data;

                if (status === 401)
                    setCountError(countError + 1);

                Toast.show({
                    text: getRequestMessage(status, message),
                    buttonText: "Ok",
                    type: getRequestMessageType(status),
                    duration: 5000
                })
            });
    };

    const recoverHandler = () => {
        props.navigation.navigate('PasswordRecover');
    };


    return (
        <FormScreenComponent>
            <Container>
                <Header canGoBack>
                    Iniciar sesión
                </Header>
                <Content>
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                        <Formik
                            onSubmit={submitHandler}
                            enableReinitialize
                            initialValues={formInitialValues}
                            validationSchema={formValidationSchema}
                        >
                            {(formik) => (
                                <>
                                    <TeedForm>
                                        <TeedInput
                                            touched={formik.touched.email}
                                            inputType="text"
                                            value={formik.values.email}
                                            error={formik.errors.email}
                                            label="Correo electrónico"
                                            keyboardType="email-address"
                                            handleBlur={formik.handleBlur('email')}
                                            onChangeText={formik.handleChange('email')}
                                        />
                                        <TeedInput
                                            touched={formik.touched.password}
                                            inputType="text"
                                            value={formik.values.password}
                                            error={formik.errors.password}
                                            label="Contraseña"
                                            handleBlur={formik.handleBlur('password')}
                                            onChangeText={formik.handleChange('password')}
                                            secureTextEntry
                                        />
                                    </TeedForm>
                                    {countError >= 2 &&
                                        <Text style={{ textAlign: 'center', marginBottom: 5, color: customVariables.brandDanger }}>
                                            ¿Tienes problemas iniciando sesión? Te invitamos a
                                            <Text style={[componentStyles.bold, { color: customVariables.brandDanger }]} onPress={recoverHandler}> recuperar tu contraseña.</Text>
                                        </Text>
                                    }
                                    <LoadingButton disabled={!formik.isValid || formik.isSubmitting}
                                        isLoading={formik.isSubmitting}
                                        loadingText={"Iniciando sesión..."}
                                        style={componentStyles.signInButton}
                                        onPress={formik.handleSubmit}>
                                        Iniciar sesión
                                    </LoadingButton>
                                    <View style={componentStyles.forgotPasswordContainer}>
                                        <Button
                                            transparent
                                            style={componentStyles.forgotPasswordButton}
                                            onPress={recoverHandler}>
                                            <Text>
                                                ¿Olvidaste tu contraseña?
                                            </Text>
                                        </Button>
                                    </View>
                                </>
                            )}
                        </Formik>
                    </ScrollView>
                </Content>
            </Container>
        </FormScreenComponent>
    )
};

const componentStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    signInLabel: {
        marginTop: 16,
    },
    forgotPasswordContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    passwordInput: {
        marginTop: 16,
    },
    forgotPasswordButton: {
        paddingHorizontal: 0,
    },
    signInButton: {
        marginHorizontal: 16,
        marginTop: 20
    },
    signUpButton: {
        marginVertical: 12,
        marginHorizontal: 16,
    },
    bold: {
        fontFamily: 'Quicksand-Bold'
    }
});

export default LoginScreen;