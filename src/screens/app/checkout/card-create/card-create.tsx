import React, { memo, useContext, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import customVariables from '@app-theme/native-base-theme/variables/material';
import { Container, Content, Spinner, Text, View } from 'native-base';
import Header from '@app-components/header';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from 'navigation/navigation';
// import stripe, { PaymentCardTextField } from 'tipsi-stripe';
import * as Yup from 'yup';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import TeedForm from '@app-components/form';
import LoadingButton from '@app-components/loading-button';
import TeedInput from '@app-components/input';
import AlertText from '@app-components/alert-text';
import CheckoutService from '@app-services/checkout.service';
import { ISavedCard } from '@app-interfaces/checkout.interface';
import { AppContext } from '@app-context/app.context';
import FormScreenComponent from '@app-components/form-screen';
import { ScrollView } from 'react-native-gesture-handler';
import { CreditCardInput } from "react-native-credit-card-input";
import VisaPaymentService from '@app-services/visa-payment.service';
import { ICreatedCardData } from '@app-interfaces/visa-payment.interface';

type ScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CardCreate'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'CardCreate'>;

interface IProps {
    navigation: ScreenNavigationProp,
    route: ScreenRouteProp
};

interface IFormFields {
    cardName: string,
    address1: string,
    locality: string,
    state: string,
    postalCode: string,
    email: string,
    phoneNumber: string,
    cardNumber: string,
    cvc: string,
    cardType?: string,
    expMonth: string,
    expYear: string,
    firstName: string,
    lastName: string
};

const formValidationSchema = Yup.object().shape<IFormFields>({
    cardName: Yup.string().required(),
    address1: Yup.string().required('Este campo es requerido.').max(60, 'La calle y número no puede tener más de 60 caracteres.'),
    locality: Yup.string().required('Este campo es requerido.').max(50, 'La ciudad no puede tener más de 50 caracteres.'),
    state: Yup.string().required('Este campo es requerido.').max(20, 'El estado no puede tener más de 20 caracteres.'),
    postalCode: Yup.string().required('Este campo es requerido.').min(5, 'Ingresa un código postal válido.').max(5, 'Ingresa un código postal válido.'),
    email: Yup.string().required('Este campo es requerido.').email('Ingresa un correo electrónico válido.').max(255, 'Ingresa un correo electrónico válido'),
    phoneNumber: Yup.string().required('Este campo es requerido.').min(10, 'Ingresa un teléfono válido.').max(10, 'Ingresa un teléfono válido.'),
    firstName: Yup.string().required('Este campo es requerido.'),
    lastName: Yup.string().required('Este campo es requerido.'),
    cardNumber: Yup.string().required(),
    cvc: Yup.string().required(),
    cardType: Yup.string(),
    expMonth: Yup.string().required(),
    expYear: Yup.string().required()
});

const CreateCardScreen: React.FC<IProps> = (props) => {

    const { paymentMethodSystemName, shippingAddress } = props.route.params;

    const [cardIsValid, setCardIsValid] = useState<boolean>(false);
    const [processError, setProcessError] = useState<string>();
    const [loadingKey, setLoadingKey] = useState<boolean>(false);
    const appContext = useContext(AppContext);

    const formInitialValues: IFormFields = {
        cardName: '',
        address1: shippingAddress ? shippingAddress.address1.split(',')[0] : '',
        locality: shippingAddress ? shippingAddress.city : '',
        state: shippingAddress ? shippingAddress.stateProvince : '',
        postalCode: shippingAddress ? shippingAddress.zipPostalCode : '',
        email: shippingAddress ? shippingAddress.email : '',
        phoneNumber: shippingAddress ? shippingAddress.phoneNumber : '',
        cardNumber: '',
        cvc: '',
        expMonth: '',
        expYear: '',
        firstName: '',
        lastName: ''
    };

    useEffect(() => {
        //loadPublishableKey();
    }, []);

    const loadPublishableKey = () => {
        setLoadingKey(true);
        CheckoutService.getStripeKey()
            .then(({ data }) => {
                // stripe.setOptions({
                //     publishableKey: data
                // });
            })
            .catch((error) => {
                console.log('ERROR LOADING STRIPE KEY:', error);
                setProcessError('No fue posible iniciar el proceso seguro de creación de tarjeta, por favor intenta con otra forma de pago. (ERROR: LPK01)')
            })
            .finally(() => setLoadingKey(false))
    };

    const goBackHandler = () => {
        props.navigation.goBack();
    };

    const handleCardChange = (data: any, formik: FormikProps<IFormFields>) => {
        if (paymentMethodSystemName === "Payments.Visa")
            handleVisaCardChange(data, formik);
    };

    const handleStripeCardChange = (valid: any, params: any, formik: FormikProps<IFormFields>) => {
        setCardIsValid(valid && params.cvc.length === 3);
        formik.setFieldValue('cardNumber', params.number);
        formik.setFieldValue('cvc', params.cvc);
        formik.setFieldValue('expMonth', params.expMonth);
        formik.setFieldValue('expYear', params.expYear);
    };

    const handleVisaCardChange = (data: any, formik: FormikProps<IFormFields>) => {
        const { valid, values } = data;
        setCardIsValid(valid);
        if (!valid) return;
        const expArray = (values.expiry as string).split('/');
        if (expArray?.length < 2) return;
        formik.setFieldValue('cardNumber', values.number.replace(/ /g, ""));
        formik.setFieldValue('cvc', values.cvc);
        formik.setFieldValue('cardName', values.name);
        formik.setFieldValue('cardType', values.type);
        formik.setFieldValue('expMonth', expArray[0]);
        formik.setFieldValue('expYear', expArray[1]);
    };

    const submitHandler = (values: IFormFields, action: FormikHelpers<IFormFields>) => {
        if (paymentMethodSystemName == "Payments.Stripe") {
            processStripe();
        }
        else if (paymentMethodSystemName == "Payments.Visa") {
            processVisa(values, action);
        }
    };

    const processVisa = (values: IFormFields, action: FormikHelpers<IFormFields>) => {
        let user = appContext.appUser;
        if (!user) return;
        let body: ICreatedCardData = {
            city: values.locality,
            country: "MX",
            email: values.email,
            nameInCard: values.cardName,
            firstName: values.firstName,
            lastName: values.lastName,
            phoneNumber: values.phoneNumber,
            postalCode: values.postalCode,
            state: values.state,
            street1: values.address1,
            cardNumber: values.cardNumber,
            cardType: values.cardNumber.charAt(0) === '6' ? "042" : parseVisaCardType(values.cardType),
            cardCompany: parseVisaCardCompany(values.cardType),
            cvNumber: values.cvc,
            expirationMonth: values.expMonth,
            expirationYear: values.expYear,
            customer: user
        };
        VisaPaymentService.saveCardInDb(body)
            .then(({ data }) => {
                props.route.params.onGoBack(data, values.cvc);
                goBackHandler();
            })
            .catch((error) => {
                console.log('ERROR GETTING VISA PAYMENT DATA:', error);
                setProcessError('Lo sentimos, no fue posible procesar la información, por favor inténtalo más tarde o utiliza otro método de pago.');
                action.setSubmitting(false);
            })
    };

    const parseVisaCardCompany = (capturedType?: string): string => {
        if (!capturedType) return "";
        switch (capturedType) {
            case "visa":
                return "visa";
            case "master-card":
                return "mastercard";
            case "american-express":
                return "american express";
            default:
                return capturedType;
        }
    };

    const parseVisaCardType = (capturedType?: string): string | undefined => {
        if (!capturedType) return "";
        switch (capturedType) {
            case "visa":
                return "001";
            case "master-card":
                return "002";
            case "american-express":
                return "003";
            default:
                return undefined;
        }
    };

    const processStripe = () => {
        // const ownerName = values.ownerName.toUpperCase();
        // const params = {
        //     number: values.cardNumber,
        //     expMonth: values.expMonth,
        //     expYear: values.expYear,
        //     cvc: values.cvc,
        //     name: ownerName,
        //     addressZip: values.postalCode,
        // };
        // stripe.createTokenWithCard(params)
        //     .then((result: any) => {
        //         console.log('STRIPE RESULT:', result);
        //         createStripeCustomer(result, ownerName, action);
        //     })
        //     .catch((error: any) => {
        //         console.log('STRIPE ERROR:', error);
        //         action.setSubmitting(false);
        //         setProcessError('No fue posible guardar los datos de tu tarjeta, por favor intenta con otra forma de pago. (ERROR: CTWC01)');
        //     })
    };

    // const createStripeCustomer = (result: any, ownerName: string, action: FormikHelpers<IFormFields>) => {
    //     if (!appContext.appUser) return;
    //     let userId = appContext.appUser.id;
    //     CheckoutService.createStripeCustomer(result.tokenId, userId)
    //         .then(({ data }) => {
    //             console.log('CUSTOMER RESULT', data);
    //             saveCardInServer(result, data, ownerName, action);
    //         })
    //         .catch((error) => {
    //             console.log('ERROR CREATING STRIPE CUSTOMER:', error);
    //             action.setSubmitting(false);
    //             setProcessError('No fue posible guardar los datos de tu tarjeta, por favor intenta con otra forma de pago. (ERROR: CSC01)');
    //         })
    // };

    // const saveCardInServer = (result: any,
    //     customerId: string,
    //     ownerName: string,
    //     action: FormikHelpers<IFormFields>) => {
    //     let body: ISavedCard = {
    //         cardOwnerName: ownerName,
    //         brand: result.card.brand,
    //         lastFourDigits: result.card.last4,
    //         serviceCustomerId: customerId
    //     };
    //     CheckoutService.saveStripeCard(body)
    //         .then(({ data }) => {
    //             props.route.params.onGoBack(data);
    //             goBackHandler();
    //         })
    //         .catch((error) => {
    //             console.log('ERROR SAVING CARD IN SERVER:', error);
    //             action.setSubmitting(false);
    //             setProcessError('No fue posible guardar los datos de tu tarjeta, por favor intenta con otra forma de pago. (ERROR: SCS01)');
    //         })
    // };

    return (
        <FormScreenComponent>
            <Container>
                <Header customGoBackHandler={() => goBackHandler()} customBackIcon='close'>
                    Nueva tarjeta
                </Header>
                <View style={componentStyles.container}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={{ backgroundColor: 'white', paddingBottom: 30, paddingHorizontal: 15 }}>
                            {loadingKey ? <Spinner /> :
                                <>
                                    <Formik
                                        onSubmit={submitHandler}
                                        enableReinitialize
                                        initialValues={formInitialValues}
                                        validationSchema={formValidationSchema}
                                    >
                                        {(formik) => (
                                            <>
                                                <View style={{ marginBottom: 20 }}>
                                                    <CreditCardInput
                                                        cardImageFront={require('@app-assets/images/c_front.jpg')}
                                                        cardImageBack={require('@app-assets/images/c_back.jpg')}
                                                        onChange={(data: any) => handleCardChange(data, formik)}
                                                        allowScroll
                                                        requiresName
                                                        requiresCVC
                                                        cardScale={0.9}
                                                        labelStyle={componentStyles.cardLabel}
                                                        inputStyle={componentStyles.cardInput}
                                                        inputContainerStyle={componentStyles.cardInputContainer}
                                                        placeholders={{
                                                            number: "",
                                                            name: "",
                                                            expiry: "",
                                                            cvc: ""
                                                        }}
                                                        labels={{
                                                            number: "Número tarjeta",
                                                            expiry: "Expiración",
                                                            name: "Nombre en la tarjeta",
                                                            cvc: "CVC/CCV"
                                                        }}
                                                    />
                                                </View>
                                                <Text style={[componentStyles.bold, { fontSize: 20 }]}>
                                                    Ingresa la
                                                    dirección bancaria
                                                    relacionada con tu tarjeta de crédito o débito:
                                                </Text>
                                                <TeedForm style={{ marginTop: 15 }}>
                                                <TeedInput
                                                        touched={formik.touched.firstName}
                                                        inputType="text"
                                                        value={formik.values.firstName}
                                                        error={formik.errors.firstName}
                                                        label='Nombre'
                                                        handleBlur={formik.handleBlur('firstName')}
                                                        onChangeText={formik.handleChange('firstName')}
                                                    />
                                                    <TeedInput
                                                        touched={formik.touched.lastName}
                                                        inputType="text"
                                                        value={formik.values.lastName}
                                                        error={formik.errors.lastName}
                                                        label='Apellido'
                                                        multiline
                                                        handleBlur={formik.handleBlur('lastName')}
                                                        onChangeText={formik.handleChange('lastName')}
                                                    />
                                                    <TeedInput
                                                        touched={formik.touched.address1}
                                                        inputType="text"
                                                        value={formik.values.address1}
                                                        error={formik.errors.address1}
                                                        label='Dirección (calle y número)'
                                                        multiline
                                                        handleBlur={formik.handleBlur('address1')}
                                                        onChangeText={formik.handleChange('address1')}
                                                    />
                                                    <TeedInput
                                                        touched={formik.touched.locality}
                                                        inputType="text"
                                                        value={formik.values.locality}
                                                        error={formik.errors.locality}
                                                        label='Ciudad'
                                                        handleBlur={formik.handleBlur('locality')}
                                                        onChangeText={formik.handleChange('locality')}
                                                    />
                                                    <TeedInput
                                                        touched={formik.touched.state}
                                                        inputType="text"
                                                        value={formik.values.state}
                                                        error={formik.errors.state}
                                                        label='Estado'
                                                        handleBlur={formik.handleBlur('state')}
                                                        onChangeText={formik.handleChange('state')}
                                                    />
                                                    <TeedInput
                                                        touched={formik.touched.postalCode}
                                                        inputType="text"
                                                        value={formik.values.postalCode}
                                                        error={formik.errors.postalCode}
                                                        label='Código postal'
                                                        handleBlur={formik.handleBlur('postalCode')}
                                                        onChangeText={formik.handleChange('postalCode')}
                                                    />
                                                    <TeedInput
                                                        touched={formik.touched.email}
                                                        inputType="text"
                                                        value={formik.values.email}
                                                        error={formik.errors.email}
                                                        label='Correo electrónico'
                                                        handleBlur={formik.handleBlur('email')}
                                                        onChangeText={formik.handleChange('email')}
                                                    />
                                                    <TeedInput
                                                        touched={formik.touched.phoneNumber}
                                                        inputType="text"
                                                        value={formik.values.phoneNumber}
                                                        error={formik.errors.phoneNumber}
                                                        label='Teléfono'
                                                        handleBlur={formik.handleBlur('phoneNumber')}
                                                        onChangeText={formik.handleChange('phoneNumber')}
                                                    />
                                                </TeedForm>
                                                {processError &&
                                                    <AlertText error>
                                                        {processError}
                                                    </AlertText>
                                                }
                                                <LoadingButton
                                                    disabled={!formik.isValid || formik.isSubmitting || !cardIsValid }
                                                    isLoading={formik.isSubmitting}
                                                    loadingText=''
                                                    onPress={formik.handleSubmit}>
                                                    Guardar tarjeta
                                                </LoadingButton>
                                            </>
                                        )}
                                    </Formik>
                                </>
                            }
                        </View>
                    </ScrollView>
                </View>
            </Container>
        </FormScreenComponent>
    )
};

const componentStyles = StyleSheet.create({
    container: {
        flex: 1
    },
    field: {
        width: '100%',
        color: '#449aeb',
        borderColor: customVariables.brandLight,
        borderWidth: 1,
        fontFamily: 'Quicksand-Regular'
    },
    bold: {
        fontFamily: 'Quicksand-Bold'
    },
    cardLabel: {
        fontWeight: 'normal',
        fontSize: 13,
        color: '#808080',
        fontFamily: 'Quicksand-Regular'
    },
    cardInput: {
        height: 50,
        color: '#424242',
        fontSize: 17,
        fontFamily: 'Quicksand-Regular',

    },
    cardInputContainer: {
        borderBottomColor: '#CCCCCC',
        borderBottomWidth: 0.7,
        marginLeft: 0,
        marginRight: 15
    }
});

export default memo(CreateCardScreen);