import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import customVariables from '@app-theme/native-base-theme/variables/material';
import { View, Text, H3, Card, CardItem, Button, Input, Item, Label } from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { IShareWin } from '@app-interfaces/share-win.interface';
import ShareWinService from '@app-services/share-win.service';
import AlertText from '@app-components/alert-text';
import Modal from 'react-native-modal';
import * as Yup from 'yup';
import { Formik, FormikHelpers } from 'formik';
import LoadingButton from '@app-components/loading-button';
import Share from "react-native-share";
import analytics from '@react-native-firebase/analytics';
import { Config } from '@app-config/app.config';

interface IProps { }

interface IFormFields {
    newCode: string
};

const formValidationSchema = Yup.object().shape<IFormFields>({
    newCode: Yup.string().required('El código es requerido').min(5).max(12)
});

const formInitialValues: IFormFields = {
    newCode: '',
};

const ShareAndWinContent: React.FC<IProps> = () => {

    const [data, setData] = useState<IShareWin>();
    const [condition, setCondition] = useState<string>('');
    const [updatingCodeError, setUpdatingCodeError] = useState<string>();
    const [loadingData, setLoadingData] = useState<boolean>(true);
    const [displayModal, setDisplayModal] = useState<boolean>(false);

    useEffect(() => {
        getShareWinData();
    }, []);

    const getShareWinData = () => {
        setLoadingData(!data);
        ShareWinService.getShareAndWinConfig()
            .then(({ data }) => {
                setData(data);
                if (data.customerCode) formInitialValues.newCode = data.customerCode;
                if (data.minimumAmountToCreateFriendCode > 0)
                    setCondition("de al menos $" + data.minimumAmountToCreateFriendCode + " MXN ");
            })
            .catch((error) => {
                console.log('ERROR LOADING SHARE AND WIN DATA', error);
            })
            .finally(() => setLoadingData(false))
    };

    const getFormatedValue = (text: string) => (
        <Text style={{ color: customVariables.brandPrimary, fontFamily: 'Quicksand-Bold' }}>
            {text}
        </Text>
    );

    const openModal = () => {
        setDisplayModal(true);
    };

    const closeModal = () => {
        setDisplayModal(false);
    };

    const submitHandler = (values: IFormFields, action: FormikHelpers<IFormFields>) => {
        action.setSubmitting(true);
        setUpdatingCodeError(undefined);
        ShareWinService.updateCode(values.newCode)
            .then(() => {
                if (!data) return;
                setData({ ...data, customerCode: values.newCode.toUpperCase() });
                closeModal();
            })
            .catch((error) => {
                console.log('ERROR UPDATING CUSTOMER CODE:', error);
                setUpdatingCodeError('El código ya está siendo utilizado por otro usuario, por favor selecciona otro.')
            })
            .finally(() => action.setSubmitting(false))
    };

    const shareCode = () => {
        if (!data) return;
        let shareMessage = `¡Hola! Utiliza mi código ${data.customerCode} y obtén $${data.couponValue.toString()} MXN en tu primera compra de Deliclub. http://onelink.to/Deliclub&utm_source=referidos`
        Share.open({ message: shareMessage, title: 'Te regalo un cupón para Deliclub' })
            .then((res) => {
                let body = {
                    content_type: "Código de amigo",
                    item_id: data.customerCode,
                    method: res.app || "Sin información"
                };
                analytics().logShare(body);
            })
            .catch((err) => { err && console.log("ERROR SHARING:", err); });
    };

    return (
        <View style={{ alignItems: 'center', marginTop: -50 }}>
            {loadingData ? null :
                <>
                    <Icon size={72} color={customVariables.brandPrimary} name='card-giftcard' />
                    <H3 style={{ textAlign: 'center' }}>
                        ¡Invita a tus amigos a comprar en Deliclub y gana descuentos!
                    </H3>
                    {data &&
                        <>
                            <Text style={componentStyles.bodyText}>
                                Tu amigo recibe {getFormatedValue("$" + data.couponValue.toString() + " MXN")}{' '}
                            para su primera compra. Una vez completada la orden de tu invitado ¡te regalamos{' '}
                                {getFormatedValue("$" + data.rewardAmount.toString() + " MXN")}{' '}
                            para gastar en productos de Deliclub!
                            </Text>
                            <Text style={{textAlign: 'center', marginBottom: 30}}>
                                Para aplicar el descuento, la primera compra de tu invitado debe ser de mínimo {getFormatedValue("$" + data.minimumAmountToUseFriendCode.toString() + " MXN")}
                            </Text>
                        </>
                    }
                    {data?.customerCode && !loadingData ?
                        <>
                            <Card>
                                <CardItem>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={componentStyles.bold}>
                                            TU CÓDIGO ES:{" "}
                                        </Text>
                                        <Text>
                                            {data?.customerCode}
                                        </Text>
                                    </View>
                                    <Button transparent icon style={{ marginLeft: 15 }} onPress={openModal}>
                                        <Icon size={24} color={customVariables.brandPrimary} name='edit' />
                                    </Button>
                                </CardItem>
                            </Card>
                            <Button style={{ marginTop: 30 }} iconLeft onPress={shareCode}>
                                <Icon style={{ marginLeft: 15 }} size={24} name='share' color='#FFFFFF' />
                                <Text>
                                    Comparte tu código
                                </Text>
                            </Button>
                            <Modal isVisible={displayModal} onBackdropPress={closeModal} backdropTransitionOutTiming={0} hideModalContentWhileAnimating={true}>
                                <View style={{ backgroundColor: 'white', padding: 30 }}>
                                    <H3>¡Personaliza tu código!</H3>
                                    <Text>Puedes cambiar tu código personal para que sea más fácil de compartir. Los códigos personales deben tener entre 5 y 12 caracteres alfanuméricos.</Text>
                                    <Formik
                                        onSubmit={submitHandler}
                                        enableReinitialize
                                        initialValues={formInitialValues}
                                        validationSchema={formValidationSchema}
                                    >
                                        {(formik) => (
                                            <>
                                                <View style={{ marginTop: 15 }}>
                                                    <Item stackedLabel style={{}}>
                                                        <Label>Código de amigo</Label>
                                                        <Input
                                                            value={formik.values.newCode}
                                                            onChangeText={formik.handleChange('newCode')}
                                                        />
                                                    </Item>
                                                </View>
                                                {updatingCodeError && <AlertText style={{ marginTop: 15 }} error>{updatingCodeError}</AlertText>}
                                                <View style={[{ flexDirection: 'row', alignSelf: 'flex-end' }, !updatingCodeError ? { marginTop: 30 } : {}]}>
                                                    <Button transparent onPress={closeModal}>
                                                        <Text>
                                                            Cancelar
                                                        </Text>
                                                    </Button>
                                                    <LoadingButton disabled={!formik.isValid || formik.isSubmitting}
                                                        isLoading={formik.isSubmitting}
                                                        loadingText="Actualizando..."
                                                        onPress={formik.handleSubmit}>
                                                        Actualizar código
                                                    </LoadingButton>
                                                </View>
                                            </>
                                        )}
                                    </Formik>
                                </View>
                            </Modal>
                        </>
                        :
                        <AlertText error>
                            {`¡Todavía no tienes código! Para generar tu código tienes que tener una compra ${condition}completada con nosotros.`}
                        </AlertText>
                    }
                </>
            }
        </View>
    )
};

const componentStyles = StyleSheet.create({
    bold: {
        fontFamily: 'Quicksand-Bold'
    },
    bodyText: {
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 25
    }
});

export default ShareAndWinContent;