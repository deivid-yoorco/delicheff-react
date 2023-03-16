import AuthService, {IRegisterDto} from '@app-services/auth.service';
import React, {useContext, useState} from 'react';
import {StyleSheet} from 'react-native';
import * as Yup from 'yup';
import FormScreenComponent from '@app-components/form-screen';
import {Badge, Button, Container, Content, Fab, Picker, Text, Thumbnail, View} from 'native-base';
import Header from '@app-components/header';
import {Formik, FormikHelpers} from 'formik';
import TeedInput from '@app-components/input';
import {AppContext} from '@app-context/app.context';
import LoadingButton from '@app-components/loading-button';
import {IAppUser, IUpdateUser} from '@app-interfaces/user.interface';
import customVariables from '@app-theme/native-base-theme/variables/material';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList, AuthStackParamList} from 'navigation/navigation';
import {format} from 'date-fns';
import {useEffect} from 'react';
import {TouchableOpacity} from 'react-native-gesture-handler';
import AvatarPlaceholder from '@app-assets/images/avatar_placeholder.jpg';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SelectFileModal from '@app-components/select-file-modal';
import {ImagePickerResponse} from 'react-native-image-picker';
import {Config} from '@app-config/app.config';
import {getProfilePictureUrl} from '@app-utils/request-utils';
import {CompositeNavigationProp} from '@react-navigation/native';

type ScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditProfile'>;

interface IProps {
    navigation: ScreenNavigationProp;
}

interface IFormFields {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    oldPassword?: string;
    newPassword?: string;
}

const formValidationSchema = Yup.object().shape<IFormFields>({
    email: Yup.string()
        .email('Ingresa un correo electrónico válido.')
        .required('El correo electrónico es requerido.'),
    oldPassword: Yup.string()
        .notRequired()
        .min(6, 'La contraseña debe tener 6 caracteres como mínimo.'),
    newPassword: Yup.string()
        .notRequired()
        .min(6, 'La contraseña debe tener 6 caracteres como mínimo.'),
    firstName: Yup.string().required('El nombre es requerido'),
    lastName: Yup.string().required('El apellido es requerido'),
    phoneNumber: Yup.string()
        .min(10, 'Debes ingresar un número de teléfono válido (10 dígitos)')
        .max(10, 'Debes ingresar un número de teléfono válido (10 dígitos)')
        .required('El teléfono es requerido'),
});

const EditProfileScreen: React.FC<IProps> = (props) => {
    const context = useContext(AppContext);

    const [changePassword, setChangePassword] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [selectedGender, setSelectedGender] = useState<string>(context.appUser?.gender || '');
    const [selectedDay, setSelectedDay] = useState<number>(0);
    const [selectedMonth, setSelectedMonth] = useState<number>(0);
    const [selectedYear, setSelectedYear] = useState<number>(0);
    const [newsletterCheck, setNewsletterCheck] = useState<boolean>(
        context.appUser?.newsletterCheck || false,
    );
    const [displayModal, setDisplayModal] = useState<boolean>(false);
    const [newProfilePicture, setNewProfilePicture] = useState<string>();
    const [newProfilePictureBase64, setNewProfilePictureBase64] = useState<string>('');
    const [newProfilePictureMimeType, setNewProfilePictureMimeType] = useState<string>('');

    useEffect(() => {
        if (!context.appUser?.birthDate) return;
        let dateArr = context.appUser.birthDate.split('-');
        setSelectedDay(parseInt(dateArr[0]));
        setSelectedMonth(parseInt(dateArr[1]));
        setSelectedYear(parseInt(dateArr[2]));
    }, []);

    const formInitialValues: IFormFields = {
        email: context.appUser?.email || '',
        oldPassword: '',
        newPassword: '',
        phoneNumber: context.appUser?.phoneNumber || '',
        firstName: context.appUser?.firstName || '',
        lastName: context.appUser?.lastName || '',
    };

    const goToPaymentMethods = () => {
        props.navigation.push('PaymentSelection', {});
    };

    const goToAddresses = () => {
        props.navigation.push('AddressList', {fromCheckout: true});
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

    const onSubmit = (values: IFormFields, action: FormikHelpers<IFormFields>) => {
        setError(false);
        setSuccess(false);

        const update: IUpdateUser = {
            firstName: values.firstName,
            lastName: values.lastName,
            oldPassword: values.oldPassword ? values.oldPassword : undefined,
            newPassword: values.newPassword ? values.newPassword : undefined,
            gender: selectedGender,
            birthDate: dateIsValid()
                ? format(new Date(selectedYear, selectedMonth - 1, selectedDay), 'dd-MM-yyyy')
                : '',
            newsletterCheck: newsletterCheck,
            phoneNumber: values.phoneNumber,
            profilePictureBase64: newProfilePictureBase64,
            profilePictureMimeType: newProfilePictureMimeType,
        };

        const appData: IAppUser = {
            firstName: values.firstName,
            lastName: values.lastName,
            email: context.appUser ? context.appUser.email : '',
            id: context.appUser ? context.appUser.id : '',
            roles: context.appUser ? context.appUser.roles : [],
            refreshToken: context.appUser ? context.appUser.refreshToken : '',
            gender: selectedGender,
            birthDate: dateIsValid()
                ? format(new Date(selectedYear, selectedMonth - 1, selectedDay), 'dd-MM-yyyy')
                : '',
            newsletterCheck: newsletterCheck,
            phoneNumber: values.phoneNumber,
            profilePictureId: context.appUser?.profilePictureId || 0,
            profilePictureLastUpdate: new Date(),
        };

        if (values.phoneNumber !== (context.appUser ? context.appUser?.phoneNumber : '')) {
            let user: IRegisterDto = {
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                password: '',
                gender: selectedGender,
                birthDate: dateIsValid()
                    ? format(new Date(selectedYear, selectedMonth - 1, selectedDay), 'dd-MM-yyyy')
                    : '',
                newsletterCheck: newsletterCheck,
                phoneNumber: values.phoneNumber,
            };
            action.setSubmitting(false);
            props.navigation.push('SmsVerification', {
                registerData: user,
                verifyOnlyNumber: true,
                onGoBack: (done: boolean) => {
                    if (done) doUpdate(update, appData, action);
                },
            });
        } else doUpdate(update, appData, action);
    };

    const doUpdate = (
        update: IUpdateUser,
        appData: IAppUser,
        action: FormikHelpers<IFormFields>,
    ) => {
        action.setSubmitting(true);
        AuthService.updateDataUser(update)
            .then(async ({data}) => {
                appData.profilePictureId = data;
                context.setAppUser(appData);
                await AuthService.saveUserInLS(appData);
                setError(false);
                setSuccess(true);
                props.navigation.goBack();
            })
            .catch((error) => {
                let message =
                    error.response === undefined
                        ? 'ocurrió un problema al intentar guardar los cambios, por favor contáctanos o inténtalo más tarde.'
                        : error.response.data;
                setErrorMessage(message);
                action.setSubmitting(false);
                setError(true);
            });
    };

    const toggleModal = () => {
        setDisplayModal((prev) => !prev);
    };

    const handlePictureSelection = (image: ImagePickerResponse) => {
        if (!image.assets || image.assets.length == 0 || !image.assets[0].base64) return;
        setNewProfilePictureBase64(image.assets[0].base64);
        setNewProfilePictureMimeType(image.assets[0].type || 'image/jpeg');
        setNewProfilePicture(image.assets[0].uri);
    };

    return (
        <>
            <FormScreenComponent>
                <Container>
                    <Header canGoBack>Mi información</Header>
                    <Content>
                        <Formik
                            onSubmit={onSubmit}
                            enableReinitialize
                            initialValues={formInitialValues}
                            validationSchema={formValidationSchema}>
                            {(formik) => (
                                <>
                                    <TouchableOpacity
                                        style={{alignSelf: 'center'}}
                                        onPress={toggleModal}>
                                        <Thumbnail
                                            style={[componentStyles.avatar, {resizeMode: 'cover'}]}
                                            source={
                                                newProfilePicture
                                                    ? {uri: newProfilePicture}
                                                    : context.appUser?.profilePictureId &&
                                                      context.appUser?.profilePictureId > 0
                                                    ? {
                                                          uri: getProfilePictureUrl(
                                                              context.appUser.profilePictureId,
                                                              context.appUser
                                                                  .profilePictureLastUpdate,
                                                          ),
                                                      }
                                                    : AvatarPlaceholder
                                            }
                                        />
                                        <Badge style={componentStyles.badge}>
                                            <Icon
                                                style={{paddingTop: 5}}
                                                size={15}
                                                color="#FFFFFF"
                                                name="edit"
                                            />
                                        </Badge>
                                    </TouchableOpacity>
                                    <TeedInput
                                        touched={formik.touched.firstName}
                                        inputType="text"
                                        value={formik.values.firstName}
                                        error={formik.errors.firstName}
                                        label="Nombre"
                                        handleBlur={formik.handleBlur('firstName')}
                                        onChangeText={formik.handleChange('firstName')}
                                    />
                                    <TeedInput
                                        touched={formik.touched.lastName}
                                        inputType="text"
                                        value={formik.values.lastName}
                                        error={formik.errors.lastName}
                                        label="Apellido"
                                        handleBlur={formik.handleBlur('lastName')}
                                        onChangeText={formik.handleChange('lastName')}
                                    />
                                    <TeedInput
                                        touched={formik.touched.email}
                                        inputType="text"
                                        value={formik.values.email}
                                        error={formik.errors.email}
                                        disabled={true}
                                        label="Correo electrónico"
                                        keyboardType="email-address"
                                        handleBlur={formik.handleBlur('email')}
                                        onChangeText={formik.handleChange('email')}
                                        style={{color: customVariables.brandLight}}
                                    />
                                    <TeedInput
                                        touched={formik.touched.phoneNumber}
                                        inputType="text"
                                        value={formik.values.phoneNumber}
                                        error={formik.errors.phoneNumber}
                                        label="Número de teléfono"
                                        handleBlur={formik.handleBlur('phoneNumber')}
                                        onChangeText={formik.handleChange('phoneNumber')}
                                        keyboardType="phone-pad"
                                    />
                                    <View style={{marginTop: 15}}>
                                        <Text style={{color: '#808080', fontSize: 13}}>
                                            Género (opcional)
                                        </Text>
                                        <View
                                            style={{
                                                borderBottomWidth: 0.8,
                                                borderBottomColor: customVariables.brandLight,
                                            }}>
                                            <Picker
                                                mode="dialog"
                                                style={{
                                                    width: undefined,
                                                    marginTop: 15,
                                                    height: 50,
                                                }}
                                                itemStyle={{fontFamily: 'Quicksand-Regular'}}
                                                selectedValue={selectedGender}
                                                onValueChange={updateGender}>
                                                <Picker.Item
                                                    label="Selecciona tu género..."
                                                    value=""
                                                />
                                                <Picker.Item label="Masculino" value="M" />
                                                <Picker.Item label="Femenino" value="F" />
                                                <Picker.Item label="Otro" value="O" />
                                            </Picker>
                                        </View>
                                    </View>
                                    <View style={{marginTop: 15}}>
                                        <Text style={{color: '#808080', fontSize: 13}}>
                                            Fecha de nacimiento (opcional)
                                        </Text>
                                        {context.appUser?.birthDate ? (
                                            <Text style={{marginTop: 10}}>
                                                {context.appUser?.birthDate}
                                            </Text>
                                        ) : (
                                            <>
                                                <View
                                                    style={{
                                                        borderBottomWidth: 0.8,
                                                        borderBottomColor:
                                                            customVariables.brandLight,
                                                    }}>
                                                    <Picker
                                                        mode="dialog"
                                                        style={{
                                                            width: undefined,
                                                            marginTop: 15,
                                                            height: 50,
                                                        }}
                                                        itemStyle={{
                                                            fontFamily: 'Quicksand-Regular',
                                                        }}
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
                                                        borderBottomColor:
                                                            customVariables.brandLight,
                                                    }}>
                                                    <Picker
                                                        mode="dialog"
                                                        style={{
                                                            width: undefined,
                                                            marginTop: 15,
                                                            height: 50,
                                                        }}
                                                        itemStyle={{
                                                            fontFamily: 'Quicksand-Regular',
                                                        }}
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
                                                        <Picker.Item
                                                            label={'septiembre'}
                                                            value={9}
                                                        />
                                                        <Picker.Item label={'octubre'} value={10} />
                                                        <Picker.Item
                                                            label={'noviembre'}
                                                            value={11}
                                                        />
                                                        <Picker.Item
                                                            label={'diciembre'}
                                                            value={12}
                                                        />
                                                    </Picker>
                                                </View>
                                                <View
                                                    style={{
                                                        borderBottomWidth: 0.8,
                                                        borderBottomColor:
                                                            customVariables.brandLight,
                                                    }}>
                                                    <Picker
                                                        mode="dialog"
                                                        style={{
                                                            width: undefined,
                                                            marginTop: 15,
                                                            height: 50,
                                                        }}
                                                        itemStyle={{
                                                            fontFamily: 'Quicksand-Regular',
                                                        }}
                                                        selectedValue={selectedYear}
                                                        onValueChange={updateYear}>
                                                        <Picker.Item
                                                            label="Selecciona el año..."
                                                            value={0}
                                                        />
                                                        {generateOptions(1920, 1920 + 100)}
                                                    </Picker>
                                                </View>
                                            </>
                                        )}
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
                                    <Button
                                        transparent
                                        style={{marginTop: 30}}
                                        onPress={goToAddresses}>
                                        <Text
                                            style={{
                                                textAlignVertical: 'center',
                                                textAlign: 'center',
                                                fontSize: 13,
                                            }}>
                                            Mis direcciones
                                        </Text>
                                    </Button>
                                    <Button transparent onPress={goToPaymentMethods}>
                                        <Text
                                            style={{
                                                textAlignVertical: 'center',
                                                textAlign: 'center',
                                                fontSize: 13,
                                            }}>
                                            Mis métodos de pago
                                        </Text>
                                    </Button>
                                    <Button
                                        transparent
                                        style={{marginBottom: 30}}
                                        onPress={() => setChangePassword(!changePassword)}>
                                        <Text
                                            style={{
                                                textAlignVertical: 'center',
                                                textAlign: 'center',
                                                fontSize: 13,
                                            }}>
                                            {changePassword
                                                ? 'Toca aquí para cancelar la actualización de tu contraseña'
                                                : 'Toca aquí para actualizar tu contraseña'}
                                        </Text>
                                    </Button>
                                    {changePassword && (
                                        <>
                                            <TeedInput
                                                touched={formik.touched.oldPassword}
                                                inputType="text"
                                                value={formik.values.oldPassword}
                                                error={formik.errors.oldPassword}
                                                label="Contraseña actual"
                                                handleBlur={formik.handleBlur('oldPassword')}
                                                onChangeText={formik.handleChange('oldPassword')}
                                                secureTextEntry
                                            />
                                            <TeedInput
                                                touched={formik.touched.newPassword}
                                                inputType="text"
                                                value={formik.values.newPassword}
                                                error={formik.errors.newPassword}
                                                label="Contraseña nueva"
                                                handleBlur={formik.handleBlur('newPassword')}
                                                onChangeText={formik.handleChange('newPassword')}
                                                secureTextEntry
                                            />
                                        </>
                                    )}
                                    {success && (
                                        <Text
                                            style={[
                                                componentStyles.resultText,
                                                {color: customVariables.brandPrimary},
                                            ]}>
                                            {'Los cambios se guardaron correctamente.'}
                                        </Text>
                                    )}
                                    {error && (
                                        <Text
                                            style={[
                                                componentStyles.resultText,
                                                {color: customVariables.brandDanger},
                                            ]}>
                                            {errorMessage}
                                        </Text>
                                    )}
                                    <LoadingButton
                                        disabled={!formik.isValid || formik.isSubmitting}
                                        isLoading={formik.isSubmitting}
                                        loadingText={'Guardando Cambios...'}
                                        style={{
                                            marginBottom: 50,
                                            marginTop: error
                                                ? 20
                                                : success
                                                ? 20
                                                : !changePassword
                                                ? 0
                                                : 30,
                                        }}
                                        onPress={formik.handleSubmit}>
                                        Guardar Cambios
                                    </LoadingButton>
                                </>
                            )}
                        </Formik>
                    </Content>
                </Container>
            </FormScreenComponent>
            <SelectFileModal
                displayModal={displayModal}
                toggleModal={toggleModal}
                optionVideo={false}
                handlePictureSelection={handlePictureSelection}
            />
        </>
    );
};

const componentStyles = StyleSheet.create({
    resultText: {
        textAlignVertical: 'center',
        textAlign: 'center',
        fontSize: 15,
        marginTop: 20,
        fontFamily: 'Quicksand-Bold',
    },
    avatar: {
        margin: 15,
        width: 100,
        height: 100,
    },
    badge: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: customVariables.brandPrimary,
    },
});

export default EditProfileScreen;
