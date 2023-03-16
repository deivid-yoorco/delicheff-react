import React, {memo} from 'react';
import {StyleSheet} from 'react-native';
import {Card, CardItem, H3, Body, Text, Button, Right, Spinner, View} from 'native-base';
import {IUserAddress} from '@app-interfaces/address.interface';
import customVariables from '@app-theme/native-base-theme/variables/material';
import AlertText from './alert-text';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface IProps {
    address: IUserAddress;
    title?: string;
    updateHandler?: () => void;
    style?: any;
    customRightComponent?: JSX.Element;
    onSelectedHandler?: () => void;
    notValidAddress?: boolean;
    validatingAddress?: boolean;
    deleteHandler?: () => void;
}

const AddressCard: React.FC<IProps> = (props) => {
    const {
        address,
        title,
        updateHandler,
        style,
        customRightComponent,
        onSelectedHandler,
        notValidAddress,
        validatingAddress,
        deleteHandler,
    } = props;

    return (
        <Card>
            <CardItem button style={style} onPress={onSelectedHandler}>
                {deleteHandler && (
                    <View style={{position: 'absolute', right: 10, top: 0, zIndex: 999}}>
                        <Button
                            icon
                            transparent
                            onPress={deleteHandler}
                            style={{alignSelf: 'center', width: '100%'}}>
                            <Icon size={24} color={customVariables.brandDanger} name="delete" />
                        </Button>
                    </View>
                )}
                <Body>
                    {title && <H3>{title}</H3>}
                    <Text>
                        {address.firstName} {address.lastName}
                    </Text>
                    <Text>{address.phoneNumber}</Text>
                    <Text>{address.address1}</Text>
                    <Text>
                        {address.address2}, {address.zipPostalCode}
                    </Text>
                    {address.addressAttributes.length > 0 && (
                        <Text key={address.addressAttributes[0].id}>
                            {address.addressAttributes[0].name}
                        </Text>
                    )}
                    {validatingAddress && <Spinner style={{alignSelf: 'center'}} />}
                    {notValidAddress && (
                        <AlertText style={{color: customVariables.brandDanger, marginVertical: 10}}>
                            Lo sentimos, actualmente no estamos entregando a la dirección
                            seleccionada.
                        </AlertText>
                    )}
                    {updateHandler && (
                        <View style={{flex: 1}}>
                            <Button
                                transparent
                                onPress={updateHandler}
                                style={{alignSelf: 'center', width: '100%'}}>
                                <Text style={{color: customVariables.brandPrimary}}>
                                    Cambiar dirección
                                </Text>
                            </Button>
                        </View>
                    )}
                </Body>
                {customRightComponent && <Right>{customRightComponent}</Right>}
            </CardItem>
        </Card>
    );
};

const componentStyles = StyleSheet.create({});

export default memo(AddressCard);
