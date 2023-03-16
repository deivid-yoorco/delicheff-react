import React, { useState } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { View } from 'react-native';
import TeedForm from '../../../components/form';
import TeedInput from '@app-components/input';
import LoadingButton from '../../../components/loading-button';
import AlertText from '@app-components/alert-text';
import { Body, Title, Content, Container, Text, Toast } from 'native-base';
import Header from '@app-components/header';
import customVariables from '@app-theme/native-base-theme/variables/material';
import { ScrollView } from 'react-native-gesture-handler';
import FormScreenComponent from '@app-components/form-screen';
import AuthService from '@app-services/auth.service';
import { Config } from '@app-config/app.config';
import { getRequestMessage, getRequestMessageType } from '@app-utils/request-utils';


interface IProps {
    navigation: StackNavigationProp<any>
};

interface IFormFields {
    email: string
};

const formInitialValues: IFormFields = {
    email: ''
};

const formValidationSchema = Yup.object().shape<IFormFields>({
    email: Yup.string().email('Ingresa un correo electrónico válido.').required('El correo electrónico es requerido.'),
});

const RecoverScreen: React.FC<IProps> = (props) => {

    const [emailSent, setEmailSent] = useState<boolean>(false);

    const navigateBack = () => {
        props.navigation.goBack();
    };

    const submitHandler = (values: IFormFields, action: FormikHelpers<IFormFields>) => {
        action.setSubmitting(true);
        AuthService.recoverPassword(values.email, Config.siteUrl)
            .then(() => {
                setEmailSent(true);
            })
            .catch((error) => {
                console.log(JSON.stringify(error));
                action.setSubmitting(false);
                let status = error.response === undefined ? 0 : error.response.status;
                let message = error.response === undefined ? "" : error.response.data;

                Toast.show({
                    text: getRequestMessage(status, message),
                    buttonText: "Ok",
                    type: getRequestMessageType(status),
                    duration: 5000
                })
            });
    };

    return (
        <FormScreenComponent>
            <Container>
                <Header canGoBack>
                    Recuperar contraseña
            </Header>
                <Content>
                    {emailSent ?
                        <AlertText style={{ color: 'green' }}>
                            Te enviamos un correo electrónico con las instrucciones para recuperar el acceso a tu cuenta.
                    </AlertText>
                        :
                        <>
                            <Text style={{ textAlign: 'center' }}>
                                Ingresa el correo electrónico asociado a tu cuenta. Te enviaremos la información necesaria para que puedas actualizar tu contraseña.
                        </Text>
                            <Formik
                                onSubmit={submitHandler}
                                enableReinitialize
                                initialValues={formInitialValues}
                                validationSchema={formValidationSchema}
                            >
                                {(formik) => (
                                    <>
                                        <TeedForm style={{ marginBottom: 16 }}>
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
                                        </TeedForm>
                                        <LoadingButton disabled={!formik.isValid || formik.isSubmitting}
                                            isLoading={formik.isSubmitting}
                                            loadingText={"Enviando solicitud..."}
                                            onPress={formik.handleSubmit}>
                                            Recuperar contraseña
                                </LoadingButton>
                                    </>
                                )}
                            </Formik>
                        </>
                    }
                </Content>
            </Container>
        </FormScreenComponent>
    )
}

export default RecoverScreen;