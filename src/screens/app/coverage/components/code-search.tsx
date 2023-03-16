import React, { useState } from 'react';
import { Keyboard, StyleSheet } from 'react-native';
import customVariables from '@app-theme/native-base-theme/variables/material';
import { Button, Fab, H3, Right, Spinner, Text, View } from 'native-base';
import TeedInput from '@app-components/input';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AlertText from '@app-components/alert-text';
import CoverageService from '@app-services/coverage.service';
import { ICoverage } from '@app-interfaces/coverage.interface';
import * as Yup from 'yup';
import { Formik, FormikHelpers } from 'formik';
import TeedForm from '@app-components/form';
import LoadingButton from '@app-components/loading-button';
import AuthService from '@app-services/auth.service';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from 'navigation/navigation';
import { useNavigation } from '@react-navigation/native';

type ScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

interface IProps {
    fromModal: boolean,
    coverageData?: ICoverage[],
    style?: any,
    modalCloseHandler?: () => void
}

interface IFormFields {
    email: string
};

const formValidationSchema = Yup.object().shape<IFormFields>({
    email: Yup.string().email('Ingresa un correo electrónico válido.').required('El correo electrónico es requerido.'),
});

const formInitialValues: IFormFields = {
    email: '',
};

const CodeSearch: React.FC<IProps> = (props) => {

    const { fromModal, coverageData, style, modalCloseHandler } = props;

    const [validating, setValidating] = useState<boolean>(false);
    const [coverageResult, setCoverageResult] = useState<string>('');
    const [coverageValid, setCoverageValid] = useState<boolean>(false);
    const [postalCode, setPostalCode] = useState<string>('');
    const [notificationValid, setNotificationValid] = useState<boolean>(false);
    const [notificationError, setNotificationError] = useState<string>('');

    const navigation = useNavigation<ScreenNavigationProp>();

    const updatePostalCode = (text: string) => {
        resetCoverageResult();
        if (text.length > 5) return;
        setPostalCode(text);
    };

    const validatePostalCodeLocally = () => {
        if (!coverageData) return;
        Keyboard.dismiss();
        resetCoverageResult();
        setValidating(true);
        let postalCodes = coverageData.map(x => x.postalCode);
        let index = postalCodes.indexOf(postalCode);
        setTimeout(() => {
            if (index > -1) {
                setCoverageValid(true);
                setCoverageMessage(true);
            }
            else {
                setCoverageValid(false);
                setCoverageMessage(false);
                CoverageService.registerInvalidPostalCode(postalCode)
                    .then(() => console.log('POSTAL CODE SAVED IN SERVER'))
                    .catch((error) => console.log('ERROR SAVING POSTAL CODE IN SERVER:', error))
            }
            setValidating(false);
        }, 1000);

    };

    const validatePostalCodeFromServer = () => {
        Keyboard.dismiss();
        resetCoverageResult();
        setValidating(true);

        CoverageService.registerCpRequestedInLS(postalCode);

        CoverageService.validatePostalCode(postalCode)
            .then(({ data }) => {
                setCoverageValid(data);
                setCoverageMessage(data);
            })
            .catch((error) => console.log('ERROR VALIDATING POSTAL CODE:', error))
            .finally(() => setValidating(false))
    };

    const setCoverageMessage = (isValid: boolean) => {
        if (isValid)
            setCoverageResult('Sí contamos con cobertura en tu código postal.');
        else
            setCoverageResult('Por el momento no contamos con cobertura en tu código postal.');
    };

    const resetCoverageResult = () => {
        setCoverageValid(false);
        setCoverageResult('');
    };

    const submitHandler = (values: IFormFields, action: FormikHelpers<IFormFields>) => {
        action.setSubmitting(true);
        setNotificationError('');
        CoverageService.postalCodeNotificationRequest(postalCode, values.email)
            .then(() => {
                setNotificationValid(true);
            })
            .catch((error) => {
                console.log('ERROR SAVING POSTAL CODE NOTIFICATION REQUEST:', error);
                setNotificationError("No fue posible guardar la información, por favor, inténtalo de nuevo más tarde.");
            })
            .finally(() => action.setSubmitting(false))
    };

    const goToLogin = () => {
        navigation.navigate('Auth');
    };

    return (
        <View style={style}>
            {fromModal ?
                <>
                    <H3>¿En dónde quieres recibir tu súper?</H3>
                    <Text>Antes de continuar, verifica la disponibilidad en tu zona ingresando tu código postal.</Text>
                </> :
                <>
                    <H3>Comprueba si llegamos a tu código postal</H3>
                    <Text>Ingresa aquí tu código postal y presiona la lupa para verificar la cobertura:</Text>
                </>
            }
            <View style={{ flexDirection: 'row' }}>
                <TeedInput
                    containerStyles={{ marginTop: 15, flex: 1 }}
                    label='Código postal:'
                    inputType='text'
                    keyboardType='number-pad'
                    value={postalCode}
                    onSubmitEditing={fromModal ? validatePostalCodeFromServer : validatePostalCodeLocally}
                    onChangeText={(text) => updatePostalCode(text)}
                />
                {validating ?
                    <Spinner style={{ marginHorizontal: 28 }} /> :
                    <Button icon disabled={validating || !postalCode} transparent style={{ alignSelf: 'center' }} onPress={fromModal ? validatePostalCodeFromServer : validatePostalCodeLocally}>
                        <Icon style={{ marginHorizontal: 15 }} size={24} name="search" color={customVariables.brandPrimary} />
                    </Button>
                }
            </View>
            {fromModal &&
                <Text
                    onPress={goToLogin}
                    style={componentStyles.loginModalButton}
                >
                    ¿Ya tienes cuenta? Inicia sesión
                </Text>
            }
            {(coverageResult !== '' && coverageResult !== undefined) &&
                <View>
                    <AlertText error={!coverageValid} success={coverageValid} style={{ marginTop: 20, marginBottom: 10 }}>
                        {coverageResult}
                    </AlertText>
                    {!coverageValid &&
                        <>
                            {notificationValid ?
                                <AlertText success style={{ marginTop: 15, marginBottom: 10 }}>
                                    ¡Listo! te avisaremos cuando tengamos cobertura en tu código postal.
                                </AlertText>
                                :
                                <>
                                    <Text>Ingresa tu correo electrónico para que te notifiquemos cuando tengamos cobertura en tu dirección:</Text>
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
                                                        label="Correo electrónico:"
                                                        keyboardType="email-address"
                                                        handleBlur={formik.handleBlur('email')}
                                                        onChangeText={formik.handleChange('email')}
                                                    />

                                                </TeedForm>
                                                <LoadingButton disabled={!formik.isValid || formik.isSubmitting}
                                                    isLoading={formik.isSubmitting}
                                                    loadingText={""}
                                                    onPress={formik.handleSubmit}>
                                                    Recibir notificación
                                                </LoadingButton>
                                            </>
                                        )}
                                    </Formik>
                                    {notificationError ?
                                        <AlertText error style={{ marginTop: 15, marginBottom: 10 }}>
                                            {notificationError}
                                        </AlertText> : null
                                    }
                                </>
                            }
                        </>
                    }
                </View>
            }
            {(fromModal && modalCloseHandler) &&
                <Fab
                    style={componentStyles.closeButton}
                    position="topRight"
                    onPress={modalCloseHandler}
                >
                    <Icon name="close" />
                </Fab>
            }
        </View>
    )
};

const componentStyles = StyleSheet.create({
    closeButton: {
        backgroundColor: customVariables.brandPrimary,
        position: 'absolute',
        right: -30,
        top: -30,
        width: 40,
        height: 40
    },
    loginModalButton: {
        textAlign: 'left',
        fontSize: 14,
        color: customVariables.brandPrimary,
        marginTop: 10,
    }
});

export default CodeSearch;