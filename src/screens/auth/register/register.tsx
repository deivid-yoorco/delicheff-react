import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from 'navigation/navigation';
import * as Yup from 'yup';
import {Container, Text, Content, Toast, View, Picker} from 'native-base';
import Header from '@app-components/header';
import {Formik, FormikHelpers} from 'formik';
import TeedForm from '@app-components/form';
import TeedInput from '@app-components/input';
import LoadingButton from '@app-components/loading-button';
import {Config} from '@app-config/app.config';
import customVariables from '@app-theme/native-base-theme/variables/material';
import {format} from 'date-fns';
import FormScreenComponent from '@app-components/form-screen';
import {IRegisterDto} from '@app-services/auth.service';

type ScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

interface IProps {
    navigation: ScreenNavigationProp;
}

interface IFormFields {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
}

const formValidationSchema = Yup.object().shape<IFormFields>({
    email: Yup.string()
        .email('Ingresa un correo electrónico válido.')
        .required('El correo electrónico es requerido.'),
    password: Yup.string()
        .required('La contraseña es requerida.')
        .min(6, 'La contraseña debe tener 6 caracteres como mínimo.'),
    firstName: Yup.string().required('El nombre es requerido'),
    lastName: Yup.string().required('El apellido es requerido'),
    phoneNumber: Yup.string()
        .min(10, 'Debes ingresar un número de teléfono válido (10 dígitos)')
        .max(10, 'Debes ingresar un número de teléfono válido (10 dígitos)')
        .required('El teléfono es requerido'),
});

const formInitialValues: IFormFields = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
};

const RegisterScreen: React.FC<IProps> = (props) => {
    const [validateEmail, setValidateEmail] = useState<boolean>(false);
    const [selectedGender, setSelectedGender] = useState<string>('');
    const [selectedDay, setSelectedDay] = useState<number>(0);
    const [selectedMonth, setSelectedMonth] = useState<number>(0);
    const [selectedYear, setSelectedYear] = useState<number>(0);
    const [newsletterCheck, setNewsletterCheck] = useState<boolean>(true);

    const submitHandler = (values: IFormFields, action: FormikHelpers<IFormFields>) => {
        let user: IRegisterDto = {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            password: values.password,
            gender: selectedGender,
            birthDate: dateIsValid()
                ? format(new Date(selectedYear, selectedMonth - 1, selectedDay), 'dd-MM-yyyy')
                : '',
            newsletterCheck: newsletterCheck,
            phoneNumber: values.phoneNumber,
        };
        action.setSubmitting(false);
        props.navigation.push('SmsVerification', {registerData: user, verifyOnlyNumber: false});
    };

    const loginHandler = () => {
        props.navigation.navigate('Login');
    };

    const PasswordRecoverHandler = () => {
        props.navigation.navigate('PasswordRecover');
    };

    const updateGender = (itemValue: React.ReactText) => {
        setSelectedGender(itemValue.toString());
    };

    const updateDay = (itemValue: React.ReactText) => {
        setSelectedDay(parseInt(itemValue.toString()));
    };

    const updateMonth = (itemValue: React.ReactText) => {
        setSelectedMonth(parseInt(itemValue.toString()));
    };

    const updateYear = (itemValue: React.ReactText) => {
        setSelectedYear(parseInt(itemValue.toString()));
    };

    const dateIsValid = () => {
        return selectedDay && selectedMonth && selectedYear;
    };

    const generateOptions = (initValue: number, count: number) => {
        let array: JSX.Element[] = [];
        for (let i = initValue; i <= count; i++) {
            let label = i < 10 ? '0' + i.toString() : i.toString();
            array.push(<Picker.Item key={i} label={label} value={i} />);
        }
        return array;
    };

    return (
        <FormScreenComponent>
            <Container>
                <Header canGoBack>Regístrate</Header>
                <Content>
                    <TeedForm verticalOffset={-100}>
                        <Text style={{textAlign: 'center'}}>
                            Ingresa los datos solicitados a continuación para crear tu cuenta en{' '}
                            {Config.appName}.
                        </Text>
                        <Formik
                            onSubmit={submitHandler}
                            enableReinitialize
                            initialValues={formInitialValues}
                            validationSchema={formValidationSchema}>
                            {(formik) => (
                                <>
                                    <TeedInput
                                        touched={formik.touched.firstName}
                                        inputType="text"
                                        value={formik.values.firstName}
                                        error={formik.errors.firstName}
                                        label="Nombre*"
                                        handleBlur={formik.handleBlur('firstName')}
                                        onChangeText={formik.handleChange('firstName')}
                                    />
                                    <TeedInput
                                        touched={formik.touched.lastName}
                                        inputType="text"
                                        value={formik.values.lastName}
                                        error={formik.errors.lastName}
                                        label="Apellido*"
                                        handleBlur={formik.handleBlur('lastName')}
                                        onChangeText={formik.handleChange('lastName')}
                                    />
                                    <TeedInput
                                        touched={formik.touched.email}
                                        inputType="text"
                                        value={formik.values.email}
                                        error={formik.errors.email}
                                        label="Correo electrónico*"
                                        keyboardType="email-address"
                                        handleBlur={formik.handleBlur('email')}
                                        onChangeText={formik.handleChange('email')}
                                    />
                                    <TeedInput
                                        touched={formik.touched.password}
                                        inputType="text"
                                        value={formik.values.password}
                                        error={formik.errors.password}
                                        label="Contraseña*"
                                        handleBlur={formik.handleBlur('password')}
                                        onChangeText={formik.handleChange('password')}
                                        secureTextEntry
                                    />
                                    <TeedInput
                                        touched={formik.touched.phoneNumber}
                                        inputType="text"
                                        value={formik.values.phoneNumber}
                                        error={formik.errors.phoneNumber}
                                        label="Número de teléfono*"
                                        handleBlur={formik.handleBlur('phoneNumber')}
                                        onChangeText={formik.handleChange('phoneNumber')}
                                        keyboardType="phone-pad"
                                    />
                                    <View
                                        style={{
                                            marginTop: 15,
                                            borderBottomWidth: 0.8,
                                            borderBottomColor: customVariables.brandLight,
                                        }}>
                                        <Text style={{color: '#808080', fontSize: 13}}>
                                            Género (opcional)
                                        </Text>
                                        <Picker
                                            mode="dialog"
                                            style={{
                                                height: 50,
                                                width: undefined,
                                                marginTop: 15,
                                                fontFamily: 'Quicksand-Regular',
                                            }}
                                            itemStyle={{fontFamily: 'Quicksand-Regular'}}
                                            selectedValue={selectedGender}
                                            onValueChange={updateGender}>
                                            <Picker.Item label="Selecciona tu género..." value="" />
                                            <Picker.Item label="Masculino" value="M" />
                                            <Picker.Item label="Femenino" value="F" />
                                            <Picker.Item label="Otro" value="O" />
                                        </Picker>
                                    </View>
                                    <View style={{marginTop: 15}}>
                                        <Text style={{color: '#808080', fontSize: 13}}>
                                            Fecha de nacimiento (opcional)
                                        </Text>
                                        <View
                                            style={{
                                                borderBottomWidth: 0.8,
                                                borderBottomColor: customVariables.brandLight,
                                            }}>
                                            <Picker
                                                mode="dialog"
                                                style={{
                                                    height: 50,
                                                    width: undefined,
                                                    marginTop: 15,
                                                    fontFamily: 'Quicksand-Regular',
                                                }}
                                                itemStyle={{fontFamily: 'Quicksand-Regular'}}
                                                selectedValue={selectedDay}
                                                onValueChange={updateDay}>
                                                <Picker.Item
                                                    label="Selecciona el día..."
                                                    value={0}
                                                />
                                                {generateOptions(1, 31)}
                                            </Picker>
                                        </View>
                                        <View
                                            style={{
                                                borderBottomWidth: 0.8,
                                                borderBottomColor: customVariables.brandLight,
                                            }}>
                                            <Picker
                                                mode="dialog"
                                                style={{
                                                    height: 50,
                                                    width: undefined,
                                                    marginTop: 15,
                                                    fontFamily: 'Quicksand-Regular',
                                                }}
                                                itemStyle={{fontFamily: 'Quicksand-Regular'}}
                                                selectedValue={selectedMonth}
                                                onValueChange={updateMonth}>
                                                <Picker.Item
                                                    label="Selecciona el mes..."
                                                    value={0}
                                                />
                                                <Picker.Item label={'enero'} value={1} />
                                                <Picker.Item label={'febrero'} value={2} />
                                                <Picker.Item label={'marzo'} value={3} />
                                                <Picker.Item label={'abril'} value={4} />
                                                <Picker.Item label={'mayo'} value={5} />
                                                <Picker.Item label={'junio'} value={6} />
                                                <Picker.Item label={'julio'} value={7} />
                                                <Picker.Item label={'agosto'} value={8} />
                                                <Picker.Item label={'septiembre'} value={9} />
                                                <Picker.Item label={'octubre'} value={10} />
                                                <Picker.Item label={'noviembre'} value={11} />
                                                <Picker.Item label={'diciembre'} value={12} />
                                            </Picker>
                                        </View>
                                        <View
                                            style={{
                                                borderBottomWidth: 0.8,
                                                borderBottomColor: customVariables.brandLight,
                                            }}>
                                            <Picker
                                                mode="dialog"
                                                style={{
                                                    height: 50,
                                                    width: undefined,
                                                    marginTop: 15,
                                                    fontFamily: 'Quicksand-Regular',
                                                }}
                                                itemStyle={{fontFamily: 'Quicksand-Regular'}}
                                                selectedValue={selectedYear}
                                                onValueChange={updateYear}>
                                                <Picker.Item
                                                    label="Selecciona el año..."
                                                    value={0}
                                                />
                                                {generateOptions(1920, 1920 + 100)}
                                            </Picker>
                                        </View>
                                    </View>
                                    <TeedInput
                                        inputType="checkbox"
                                        label={
                                            'Quiero recibir promociones y las mejores ofertas de la tienda.'
                                        }
                                        check={newsletterCheck}
                                        disabled={true}
                                        viewCheck={{marginTop: 15}}
                                        onPress={() => setNewsletterCheck(!newsletterCheck)}
                                    />
                                    <View style={{marginTop: 30}}>
                                        {validateEmail && (
                                            <Text
                                                style={{
                                                    textAlign: 'center',
                                                    marginBottom: 30,
                                                    color: customVariables.brandDanger,
                                                }}>
                                                Ya existe un usuario registrado con ese correo
                                                electrónico. ¿Eres tú? en ese caso te invitamos a
                                                <Text
                                                    style={[
                                                        componentStyles.bold,
                                                        {color: customVariables.brandDanger},
                                                    ]}
                                                    onPress={loginHandler}>
                                                    {' '}
                                                    iniciar sesión
                                                </Text>{' '}
                                                o a
                                                <Text
                                                    style={[
                                                        componentStyles.bold,
                                                        {color: customVariables.brandDanger},
                                                    ]}
                                                    onPress={PasswordRecoverHandler}>
                                                    {' '}
                                                    recuperar tu contraseña
                                                </Text>
                                            </Text>
                                        )}
                                        <LoadingButton
                                            disabled={!formik.isValid || formik.isSubmitting}
                                            isLoading={formik.isSubmitting}
                                            loadingText={'Creando nuevo usuario...'}
                                            onPress={formik.handleSubmit}>
                                            Registrarse
                                        </LoadingButton>
                                    </View>
                                </>
                            )}
                        </Formik>
                    </TeedForm>
                </Content>
            </Container>
        </FormScreenComponent>
    );
};

const componentStyles = StyleSheet.create({
    bold: {
        fontFamily: 'Quicksand-Bold',
    },
});

export default RegisterScreen;
