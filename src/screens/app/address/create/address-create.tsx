import React, {useState, useRef, useEffect, memo} from 'react';
import {StyleSheet, PixelRatio} from 'react-native';
import customVariables from '@app-theme/native-base-theme/variables/material';
import {Container, View, Text, H2, Spinner, H3} from 'native-base';
import Header from '@app-components/header';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from 'navigation/navigation';
import {RouteProp} from '@react-navigation/native';
import {
    GooglePlacesAutocomplete,
    GooglePlaceDetail,
    GooglePlaceData,
} from 'react-native-google-places-autocomplete';
import {Config} from '@app-config/app.config';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {IUserAddress, IAddressAttribute} from '@app-interfaces/address.interface';
import InlineTitleText from '@app-components/inline-title-text';
import * as Yup from 'yup';
import {Formik, FormikHelpers, FormikProps} from 'formik';
import TeedForm from '@app-components/form';
import TeedInput from '@app-components/input';
import AuthService from '@app-services/auth.service';
import {ScrollView} from 'react-native-gesture-handler';
import AddressService from '@app-services/address.service';
import LoadingButton from '@app-components/loading-button';
import AlertText from '@app-components/alert-text';
import FormScreenComponent from '@app-components/form-screen';

type ScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddressCreate'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'AddressCreate'>;

interface IProps {
    navigation: ScreenNavigationProp;
    route: ScreenRouteProp;
}

interface IFormFields {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    interiorNumber: string;
}
const phoneRegExp = /^\d{10}$/;

const formValidationSchema = Yup.object().shape<IFormFields>({
    email: Yup.string()
        .email('Ingresa un correo electrónico válido.')
        .required('El correo electrónico es requerido.'),
    firstName: Yup.string().required('El nombre es requerido'),
    lastName: Yup.string().required('El apellido es requerido'),
    phoneNumber: Yup.string()
        .required('El teléfono es requerido')
        .matches(phoneRegExp, 'El teléfono es inválido'),
    interiorNumber: Yup.string().required('El número interior es requerido'),
});

const formInitialValues: IFormFields = {
    email: '',
    phoneNumber: '',
    firstName: '',
    lastName: '',
    interiorNumber: '',
};

const AddressCreateScreen: React.FC<IProps> = (props) => {
    const [newAddress, setNewAddress] = useState<IUserAddress>();
    const [inputZIndex, setInputZIndex] = useState<number>(10);
    const [addressAttributes, setAddressAttributes] = useState<IAddressAttribute[]>([]);
    const [checkingAddress, setCheckingAddress] = useState<boolean>(false);
    const [addressError, setAddressError] = useState<string>();
    const [isCheck, setIsCheck] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<boolean>(false);
    const [shouldDisablePhone, setShouldDisablePhone] = useState<boolean>(false);
    const inputRef = useRef();

    useEffect(() => {
        if (!newAddress) return;
        validatePostalCode();
    }, [newAddress]);

    useEffect(() => {
        if (addressAttributes.length > 0) return;
        getAddessAttributes();
    }, []);

    useEffect(() => {
        AuthService.getUser().then((user) => {
            if (!user) return;
            formInitialValues.email = user.email;
            formInitialValues.firstName = user.firstName;
            formInitialValues.lastName = user.lastName;
            formInitialValues.phoneNumber = user.phoneNumber;
            if (user.phoneNumber) setShouldDisablePhone(true);
        });
    }, []);

    const getAddessAttributes = () => {
        AddressService.getAddressAttributes()
            .then(({data}) => {
                setAddressAttributes(data);
            })
            .catch((error) => {
                console.log('ERROR GETTING ADDRESS ATTRIBUTES:', error);
            });
    };

    const parseResultToAddress = (data: GooglePlaceData, result: GooglePlaceDetail | null) => {
        if (!result) return;
        let address: IUserAddress = {
            id: 0,
            address1: data.description,
            address2: result.address_components?.filter(
                (x) => x.types?.indexOf('sublocality') > -1,
            )[0]?.long_name,
            city: result.address_components?.filter((x) => x.types?.indexOf('locality') > -1)[0]
                ?.long_name,
            country: result.address_components?.filter((x) => x.types?.indexOf('country') > -1)[0]
                ?.long_name,
            email: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            stateProvince: result.address_components?.filter(
                (x) => x.types?.indexOf('locality') > -1,
            )[0]?.long_name,
            zipPostalCode: result.address_components?.filter(
                (x) => x.types?.indexOf('postal_code') > -1,
            )[0]?.long_name,
            addressAttributes: [],
            latitude: result.geometry.location.lat.toString(),
            longitude: result.geometry.location.lng.toString(),
        };
        setNewAddress(address);
    };

    const submitHandler = (values: IFormFields, action: FormikHelpers<IFormFields>) => {
        if (!newAddress) return;
        setSubmitError(false);
        let address = {...newAddress};
        address.address1 = address.address1 + ' interior ' + values.interiorNumber;
        address.firstName = values.firstName;
        address.lastName = values.lastName;
        address.email = values.email;
        address.phoneNumber = values.phoneNumber;
        address.addressAttributes = [...addressAttributes];

        AddressService.saveNewAddress(address)
            .then(({data}) => {
                if (props.route.params.onGoBack) props.route.params.onGoBack(data);
                goBackHandler();
            })
            .catch((error) => {
                action.setSubmitting(false);
                setSubmitError(true);
                console.log('ERROR SAVING ADDRESS:', error);
            });
    };

    const updateAttributeValue = (value: string, id: number) => {
        let current = [...addressAttributes];
        let index = current.map((x) => x.id).indexOf(id);
        if (index === -1) return;
        current[index].value = value;
        setAddressAttributes(current);
    };

    const validatePostalCode = () => {
        if (!newAddress) return;
        if (!newAddress.zipPostalCode) {
            setCheckingAddress(false);
            setAddressError(
                'La dirección seleccionada no es válida. Por favor, realiza la búsqueda indicando calle y número exterior.',
            );
            return;
        }

        setCheckingAddress(true);
        setAddressError('');

        AddressService.isPostalCodeValid(newAddress.zipPostalCode)
            .then(({data}) => {
                if (!data)
                    setAddressError(
                        'Lo sentimos, actualmente no estamos entregando a la dirección seleccionada.',
                    );
            })
            .catch((error) => {
                console.log('ERROR CHECKING POSTAL CODE:', error);
                setAddressError(
                    '¡Oh no! Ocurrió un problema mientras preparábamos la información. Por favor, inténtalo de nuevo más tarde. (ERROR: ACV01)',
                );
            })
            .finally(() => setCheckingAddress(false));
    };

    const goBackHandler = () => {
        props.navigation.goBack();
    };

    const direccionCheck = (value: boolean, formik: FormikProps<IFormFields>, field: string) => {
        setIsCheck(value);

        if (value) {
            formik.setFieldValue(field, 's/n');
        }

        if (!value) {
            formik.setFieldValue(field, '');
        }
    };

    return (
        <FormScreenComponent>
            <Container>
                <Header customGoBackHandler={goBackHandler} customBackIcon="close">
                    Nueva dirección
                </Header>
                <View style={componentStyles.container}>
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}>
                        <View style={{zIndex: inputZIndex}}>
                            <H3>
                                Ingresa y selecciona la dirección de entrega. Asegúrate de que
                                tenemos cobertura en tu zona.
                            </H3>
                            <GooglePlacesAutocomplete
                                ref={inputRef.current}
                                placeholder="Ingresa calle y número exterior"
                                fetchDetails
                                onPress={(data, details = null) => {
                                    setCheckingAddress(true);
                                    parseResultToAddress(data, details);
                                }}
                                query={{
                                    key: Config.googleMapsApiKey,
                                    language: 'es',
                                    components: 'country:mx',
                                }}
                                textInputProps={{
                                    onFocus: () => {
                                        setInputZIndex(10);
                                    },
                                    onBlur: () => {
                                        setInputZIndex(1);
                                    },
                                }}
                                renderLeftButton={() => (
                                    <Icon
                                        style={componentStyles.inputIcon}
                                        size={24}
                                        name="location-on"
                                    />
                                )}
                                styles={{
                                    textInputContainer: {
                                        backgroundColor: '#FFFFFF',
                                        borderColor: customVariables.brandLight,
                                        borderEndWidth: 1,
                                        borderLeftWidth: 1,
                                    },
                                    textInput: {
                                        marginLeft: 0,
                                        marginRight: 0,
                                        color: '#5d5d5d',
                                        fontSize: 16,
                                        fontFamily: 'Quicksand-Regular',
                                    },
                                    row: {
                                        backgroundColor: '#FFFFFF',
                                        height: 50 * PixelRatio.getFontScale(),
                                        alignItems: 'center',
                                    },
                                }}
                                onFail={(error) => console.log('MAP ERROR', error)}
                            />
                        </View>
                        {newAddress && (
                            <View style={{zIndex: 5, marginTop: 15}}>
                                <TeedForm verticalOffset={200}>
                                    <Formik
                                        onSubmit={submitHandler}
                                        enableReinitialize
                                        initialValues={formInitialValues}
                                        validationSchema={formValidationSchema}>
                                        {(formik) => (
                                            <>
                                                <InlineTitleText
                                                    title="Calle y número:"
                                                    value={newAddress.address1?.split(',')[0]}
                                                />
                                                <InlineTitleText
                                                    title="Colonia:"
                                                    value={newAddress.address2}
                                                />
                                                <InlineTitleText
                                                    title="Ciudad, municipio o delegación:"
                                                    value={newAddress.city}
                                                />
                                                <InlineTitleText
                                                    title="Estado/provincia:"
                                                    value={newAddress.stateProvince}
                                                />
                                                <InlineTitleText
                                                    title="Código postal:"
                                                    value={newAddress.zipPostalCode}
                                                />
                                                {checkingAddress ? (
                                                    <Spinner />
                                                ) : (
                                                    <>
                                                        {!addressError ? (
                                                            <>
                                                                {!isCheck && (
                                                                    <TeedInput
                                                                        touched={
                                                                            formik.touched
                                                                                .interiorNumber
                                                                        }
                                                                        inputType="text"
                                                                        value={
                                                                            formik.values
                                                                                .interiorNumber
                                                                        }
                                                                        error={
                                                                            formik.errors
                                                                                .interiorNumber
                                                                        }
                                                                        label="Número interior*"
                                                                        handleBlur={formik.handleBlur(
                                                                            'interiorNumber',
                                                                        )}
                                                                        onChangeText={formik.handleChange(
                                                                            'interiorNumber',
                                                                        )}
                                                                    />
                                                                )}
                                                                <TeedInput
                                                                    inputType="checkbox"
                                                                    label={
                                                                        'No tiene número interior'
                                                                    }
                                                                    check={isCheck}
                                                                    disabled={true}
                                                                    viewCheck={{marginTop: 15}}
                                                                    onPress={() =>
                                                                        direccionCheck(
                                                                            !isCheck,
                                                                            formik,
                                                                            'interiorNumber',
                                                                        )
                                                                    }
                                                                />
                                                                {addressAttributes.map((x) => (
                                                                    <TeedInput
                                                                        key={x.id}
                                                                        inputType="text"
                                                                        value={x.value}
                                                                        label={x.name}
                                                                        onChangeText={(text) =>
                                                                            updateAttributeValue(
                                                                                text,
                                                                                x.id,
                                                                            )
                                                                        }
                                                                    />
                                                                ))}
                                                                <View style={{marginVertical: 15}}>
                                                                    <H2>
                                                                        Información de la persona
                                                                        que recibe el pedido
                                                                    </H2>
                                                                    <TeedInput
                                                                        touched={
                                                                            formik.touched.firstName
                                                                        }
                                                                        inputType="text"
                                                                        value={
                                                                            formik.values.firstName
                                                                        }
                                                                        error={
                                                                            formik.errors.firstName
                                                                        }
                                                                        label="Nombre*"
                                                                        handleBlur={formik.handleBlur(
                                                                            'firstName',
                                                                        )}
                                                                        onChangeText={formik.handleChange(
                                                                            'firstName',
                                                                        )}
                                                                    />
                                                                    <TeedInput
                                                                        touched={
                                                                            formik.touched.lastName
                                                                        }
                                                                        inputType="text"
                                                                        value={
                                                                            formik.values.lastName
                                                                        }
                                                                        error={
                                                                            formik.errors.lastName
                                                                        }
                                                                        label="Apellido*"
                                                                        handleBlur={formik.handleBlur(
                                                                            'lastName',
                                                                        )}
                                                                        onChangeText={formik.handleChange(
                                                                            'lastName',
                                                                        )}
                                                                    />
                                                                    <TeedInput
                                                                        touched={
                                                                            formik.touched.email
                                                                        }
                                                                        inputType="text"
                                                                        value={formik.values.email}
                                                                        error={formik.errors.email}
                                                                        label="Correo electrónico*"
                                                                        keyboardType="email-address"
                                                                        handleBlur={formik.handleBlur(
                                                                            'email',
                                                                        )}
                                                                        onChangeText={formik.handleChange(
                                                                            'email',
                                                                        )}
                                                                    />
                                                                    <TeedInput
                                                                        touched={
                                                                            formik.touched
                                                                                .phoneNumber
                                                                        }
                                                                        inputType="text"
                                                                        keyboardType="phone-pad"
                                                                        value={
                                                                            formik.values
                                                                                .phoneNumber
                                                                        }
                                                                        error={
                                                                            formik.errors
                                                                                .phoneNumber
                                                                        }
                                                                        label="Teléfono*"
                                                                        handleBlur={formik.handleBlur(
                                                                            'phoneNumber',
                                                                        )}
                                                                        onChangeText={formik.handleChange(
                                                                            'phoneNumber',
                                                                        )}
                                                                        style={
                                                                            shouldDisablePhone
                                                                                ? {
                                                                                      color: customVariables.brandLight,
                                                                                  }
                                                                                : undefined
                                                                        }
                                                                        disabled={
                                                                            shouldDisablePhone
                                                                        }
                                                                    />
                                                                </View>
                                                                <View
                                                                    style={{
                                                                        marginVertical: 15,
                                                                        alignItems: 'center',
                                                                        display: submitError
                                                                            ? 'flex'
                                                                            : 'none',
                                                                    }}>
                                                                    <Text style={{color: 'red'}}>
                                                                        No fue posible crear la
                                                                        dirección, por favor
                                                                        verifica que todos los datos
                                                                        son correctos y están
                                                                        completos e inténtalo de
                                                                        nuevo.
                                                                    </Text>
                                                                </View>
                                                                <LoadingButton
                                                                    disabled={
                                                                        !formik.isValid ||
                                                                        formik.isSubmitting
                                                                    }
                                                                    style={{marginTop: 15}}
                                                                    isLoading={formik.isSubmitting}
                                                                    loadingText={
                                                                        'Creando nueva dirección...'
                                                                    }
                                                                    onPress={formik.handleSubmit}>
                                                                    Guardar nueva dirección
                                                                </LoadingButton>
                                                            </>
                                                        ) : (
                                                            <AlertText
                                                                style={{
                                                                    color: customVariables.brandDanger,
                                                                    marginVertical: 10,
                                                                }}>
                                                                {addressError}
                                                            </AlertText>
                                                        )}
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </Formik>
                                </TeedForm>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </Container>
        </FormScreenComponent>
    );
};

const componentStyles = StyleSheet.create({
    container: {
        marginHorizontal: 15,
        flex: 1,
    },
    inputIcon: {
        alignSelf: 'center',
        color: customVariables.brandPrimary,
        marginLeft: 10,
    },
});

export default memo(AddressCreateScreen);
