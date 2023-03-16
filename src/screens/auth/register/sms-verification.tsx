import React, { Fragment, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import customVariables from '@app-theme/native-base-theme/variables/material';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from 'navigation/navigation';
import { RouteProp } from '@react-navigation/native';
import AuthService, {
    IRegisterCodeValidationDto,
    IRegisterCustomerValidationDto,
    IRegisterDto,
} from '@app-services/auth.service';
import { Container, Spinner, View, Text, Button } from 'native-base';
import Header from '@app-components/header';
import AlertText from '@app-components/alert-text';
import { default as FullSpinner } from 'react-native-loading-spinner-overlay';
import analytics from '@react-native-firebase/analytics';
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import CountDown from 'react-native-countdown-component';
import Icon from 'react-native-vector-icons/MaterialIcons';

type ScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SmsVerification'>;
type ScreenRouteProp = RouteProp<AuthStackParamList, 'SmsVerification'>;

interface IProps {
    navigation: ScreenNavigationProp;
    route: ScreenRouteProp;
}

const SmsVerificarionScreen: React.FC<IProps> = (props) => {
    const { registerData, verifyOnlyNumber, onGoBack } = props.route.params;
    const [loading, setLoading] = useState<boolean>(true);
    const [resendActive, setResendActive] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [codeErrorMessage, setCodeErrorMessage] = useState<string>('');
    const [minutesForCodeRequest, setMinutesForCodeRequest] = useState<number>(0);
    const [codeValue, setCodeValue] = useState('');
    const ref = useBlurOnFulfill({ value: codeValue, cellCount: 6 });
    const [cellProps, getCellOnLayoutHandler] = useClearByFocusCell({
        value: codeValue,
        setValue: setCodeValue,
    });

    useEffect(() => {
        setCodeValue('');
        setErrorMessage('');
        setCodeErrorMessage('');
        validateRegisterData();
    }, []);

    const validateRegisterData = () => {
        setLoading(true);
        var body: IRegisterCustomerValidationDto = {
            email: registerData.email,
            phoneNumer: registerData.phoneNumber,
            verifyOnlyNumber: verifyOnlyNumber
        };

        AuthService.registerCustomerValidation(body)
            .then(({ data }) => {
                if (!data.shouldValidatePhone) {
                    if (!verifyOnlyNumber)
                        completeRegistration(registerData);
                    else if (onGoBack != undefined) {
                        onGoBack(true);
                        props.navigation.goBack();
                    }
                    return;
                } else if (data.shouldValidatePhone && data.errorMessage != '') {
                    setErrorMessage(data.errorMessage);
                } else if (data.shouldValidatePhone && data.errorMessage == '' && data.code != '') {
                    // Applies in seconds
                    if (data.minutesForCodeRequest > 0)
                        setMinutesForCodeRequest(data.minutesForCodeRequest);
                    else setMinutesForCodeRequest(60);
                    setResendActive(false);
                } else if (data.shouldValidatePhone && data.errorMessage == '' && data.code == '') {
                    setErrorMessage(
                        'No fue posible validar el registro, por favor contáctanos o inténtalo más tarde.',
                    );
                } else {
                    setErrorMessage(
                        'No fue posible validar el registro, por favor contáctanos o inténtalo más tarde.',
                    );
                }
                setLoading(false);
            })
            .catch((error) => {
                console.log('ERROR VALIDATING PHONE', error);
                if (error.response && error.response.status == 400 && error.response.data) {
                    setErrorMessage(error.response.data);
                } else
                    setErrorMessage(
                        'No fue posible validar el registro, por favor contáctanos o inténtalo más tarde.',
                    );
                setLoading(false);
            });
    };

    const verificationHandler = () => {
        setLoading(true);
        const dto: IRegisterCodeValidationDto = {
            code: codeValue,
            phoneNumer: registerData.phoneNumber,
        };
        AuthService.registerCodeValidation(dto)
            .then(({ data }) => {
                if (data.validatedCorrectly) {
                    if (!verifyOnlyNumber)
                        completeRegistration(registerData);
                    else if (onGoBack != undefined) {
                        onGoBack(true);
                        goBack();
                    }
                    return;
                } else if (data.errorMessage != '') {
                    setCodeErrorMessage(data.errorMessage);
                } else
                    setCodeErrorMessage(
                        'No fue posible validar el registro, por favor contáctanos o inténtalo más tarde.',
                    );
                setLoading(false);
            })
            .catch((error) => {
                console.log('ERROR VALIDATING PHONE', error);
                if (error.response && error.response.status == 400 && error.response.data) {
                    setCodeErrorMessage(error.response.data);
                } else
                    setCodeErrorMessage(
                        'No fue posible validar el registro, por favor contáctanos o inténtalo más tarde.',
                    );
                setLoading(false);
            });
    };

    const resendVerificationCode = () => {
        setCodeValue('');
        setErrorMessage('');
        setCodeErrorMessage('');
        setLoading(true);
        validateRegisterData();
    };

    const completeRegistration = (user: IRegisterDto) => {
        AuthService.register(user)
            .then(async (data) => {
                let body = { method: 'email' };
                await analytics().logSignUp(body);
                props.navigation.navigate('RegistrationSuccessful', {
                    user: data.user,
                    successNote: data.successNote || '',
                });
            })
            .catch((error) => {
                console.log(JSON.stringify(error.response));
                if (error.response && error.response.status == 400 && error.response.data) {
                    setErrorMessage(error.response.data);
                } else
                    setErrorMessage(
                        'No fue posible crear la cuenta, por favor contáctanos o inténtalo más tarde.',
                    );
            })
            .finally(() => setLoading(false));
    };

    const goBack = () => {
        props.navigation.goBack();
    };

    return (
        <Container>
            <Header canGoBack style={{ marginBottom: 0 }}>
                Validando cuenta
            </Header>
            <View style={componentStyles.container}>
                {!errorMessage && !loading ? (
                    <>
                        <Icon
                            size={72}
                            color={customVariables.brandPrimary}
                            name="message"
                            style={{ textAlign: 'center' }}
                        />
                        <Text
                            style={{
                                textAlign: 'center',
                                fontFamily: 'Quicksand-Bold',
                                marginTop: 10,
                            }}>
                            Por favor ingresa el código de verificación de 6 dígitos que enviamos a
                            través de SMS para poder verificar tu número de teléfono:
                        </Text>
                        {codeErrorMessage ? (
                            <>
                                <AlertText
                                    style={{ color: customVariables.brandDanger, marginTop: 15 }}>
                                    {codeErrorMessage}
                                </AlertText>
                            </>
                        ) : null}
                        <CodeField
                            ref={ref}
                            {...cellProps}
                            // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
                            value={codeValue}
                            onChangeText={setCodeValue}
                            cellCount={6}
                            rootStyle={componentStyles.codeFieldRoot}
                            keyboardType="number-pad"
                            textContentType="oneTimeCode"
                            renderCell={({ index, symbol, isFocused }) => (
                                <Fragment key={index}>
                                    <Text
                                        key={`value-${index}`}
                                        style={[
                                            componentStyles.cell,
                                            isFocused && componentStyles.focusCell,
                                            index < 5 && { marginRight: 3, marginLeft: 3 },
                                        ]}
                                        onLayout={getCellOnLayoutHandler(index)}>
                                        {symbol || (isFocused ? <Cursor /> : null)}
                                    </Text>
                                    {index === 1 || index === 3 ? (
                                        <View
                                            key={`separator-${index}`}
                                            style={componentStyles.separator}
                                        />
                                    ) : null}
                                </Fragment>
                            )}
                        />
                        <Button
                            icon
                            onPress={verificationHandler}
                            style={{ alignSelf: 'center', marginTop: 20 }}
                            disabled={codeValue.length < 6}>
                            <Text>Verificar</Text>
                        </Button>
                        <View style={componentStyles.resendContainer}>
                            {!resendActive ? (
                                <>
                                    <Text style={{ marginBottom: 5, alignItems: 'baseline' }}>
                                        Puedes solicitar otro código dentro de
                                        <CountDown
                                            until={minutesForCodeRequest}
                                            size={14}
                                            onFinish={() => setResendActive(true)}
                                            digitStyle={{
                                                backgroundColor: '#FFFFFF',
                                                height: 17,
                                                width: 20,
                                            }}
                                            digitTxtStyle={{ color: '#424242' }}
                                            showSeparator
                                            separatorStyle={{
                                                color: '#424242',
                                                height: 15,
                                                fontSize: 13,
                                            }}
                                            timeToShow={['M', 'S']}
                                            timeLabels={{ m: undefined, s: undefined }}
                                        />
                                    </Text>
                                </>
                            ) : (
                                <Button
                                    icon
                                    transparent
                                    onPress={resendVerificationCode}
                                    style={{ alignSelf: 'center' }}>
                                    <Text>Reenviar código de verificación</Text>
                                </Button>
                            )}
                        </View>
                    </>
                ) : null}
                {errorMessage ? (
                    <>
                        <Icon
                            size={72}
                            color={customVariables.brandDanger}
                            name="error"
                            style={{ marginBottom: 20 }}
                        />
                        <AlertText style={{ color: customVariables.brandDanger }}>
                            {errorMessage}
                        </AlertText>
                        <Button onPress={goBack}>
                            <Text>Regresar</Text>
                        </Button>
                    </>
                ) : null}
            </View>
            <FullSpinner
                visible={loading}
                customIndicator={
                    <View
                        style={{
                            width: 100,
                            height: 100,
                            borderRadius: 10,
                            backgroundColor: '#FFFFFF',
                            paddingTop: 10,
                        }}>
                        <Spinner />
                    </View>
                }
            />
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
    codeFieldRoot: { marginTop: 20 },
    cell: {
        width: 40,
        height: 40,
        lineHeight: 38,
        fontSize: 24,
        borderWidth: 2,
        borderColor: '#00000030',
        textAlign: 'center',
    },
    focusCell: {
        borderColor: '#000',
    },
    root: { padding: 20, minHeight: 300 },
    title: { textAlign: 'center', fontSize: 30 },
    separator: {
        height: 2,
        width: 10,
        backgroundColor: '#000',
        alignSelf: 'center',
    },
    resendContainer: {
        marginTop: 15,
    },
});

export default SmsVerificarionScreen;
