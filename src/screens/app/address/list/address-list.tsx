import React, { useEffect, useState } from 'react';
import { StyleSheet, ListRenderItemInfo, Alert } from 'react-native';
import { Container, Text, View, Button } from 'native-base';
import Header from '@app-components/header';
import { FlatList } from 'react-native-gesture-handler';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList, DrawerParamList, RootStackParamList } from 'navigation/navigation';
import { RouteProp, CompositeNavigationProp } from '@react-navigation/native';
import { IUserAddress } from '@app-interfaces/address.interface';
import AddressCard from '@app-components/address-card';
import customVariables from '@app-theme/native-base-theme/variables/material';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AddressService from '@app-services/address.service';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import AddressListLoader from './address-list-loader';
import analytics from '@react-native-firebase/analytics';

type ScreenNavigationProp = CompositeNavigationProp<StackNavigationProp<RootStackParamList, 'AddressCreate'>, CompositeNavigationProp<StackNavigationProp<RootStackParamList, 'AddressList'>, DrawerNavigationProp<DrawerParamList, 'Address'>>>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'AddressList'>;

interface IProps {
    navigation: ScreenNavigationProp,
    route: ScreenRouteProp
};

const screenTitle: string = "Tus direcciones";

const AddressListScreen: React.FC<IProps> = (props) => {

    const { params } = props.route;
    const [currentAddresses, setCurrentAddresses] = useState<IUserAddress[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number>();
    const [loadingAddresses, setLoadingAddresses] = useState<boolean>(false);

    useEffect(() => {
        if (params?.addresses) setCurrentAddresses(params.addresses);
        if (params?.addresses && params?.selectedId)
            setSelectedIndex(params.selectedId && params.addresses ?
                params.addresses.map(x => x.id).indexOf(params.selectedId) :
                0)
    }, []);

    useEffect(() => {
        getAddresses();
    }, []);


    const getAddresses = () => {
        setLoadingAddresses(currentAddresses.length === 0);
        AddressService.getAddresses()
            .then(({ data }) => {
                setCurrentAddresses(data);
                if (data.length > 0 && params?.fromCheckout && params.setSelectedAddress)
                    params.setSelectedAddress(data[0]);
            })
            .catch((error) => {
                console.log('ERROR LOADING ADDRESSES:', error);
            })
            .finally(() => setLoadingAddresses(false))
    };

    const renderItem = (info: ListRenderItemInfo<IUserAddress>) => {
        return (
            <AddressCard
                style={info.index == selectedIndex ? componentStyles.selectedAddress : {}}
                address={info.item}
                onSelectedHandler={() => params?.fromCheckout ? addressSelected(info.item, info.index) : {}}
                deleteHandler={currentAddresses.length > 1 ? () => deleteAddress(info.index) : undefined}
            />
        );
    };

    const deleteAddress = (index: number) => {
        Alert.alert(
            'Eliminar dirección',
            '¿Confirmas que deseas eliminar esta dirección?',
            [{ text: "No" }, { text: "Si", onPress: () => confirmDeleteAddress(index) }],
            { cancelable: false }
        );
    };

    const confirmDeleteAddress = (index: number) => {
        let current = [...currentAddresses];
        current.splice(index, 1);
        setCurrentAddresses(current);

        AddressService.deleteAddress(currentAddresses[index].id)
            .then(() => console.log("ADDRESS DELETED SUCCESFULLY"))
            .catch((error) => console.log("ERROR DELETING ADDRESS: ", error))
    };

    const addressSelected = async (address: IUserAddress, index: number) => {
        if (params.fromCheckout) {
            let body = {
                checkout_step: 1,
                checkout_option: address.address1
            };
            await analytics().logSetCheckoutOption(body);
        }

        setSelectedIndex(index);
        setTimeout(() => {
            if (params.setSelectedAddress) {
                params.setSelectedAddress(address);
                props.navigation.goBack();
            }
        }, 200);
    };

    const addNewAddress = () => {
        props.navigation.push('AddressCreate', {
            onGoBack: (newAddress: IUserAddress) => {
                if (!newAddress) return;
                let current = [...currentAddresses];
                current.push(newAddress);
                setCurrentAddresses(current);
                if (params && params.setAddresses)
                    params.setAddresses(current);
            }
        })
    };

    const toggleDrawer = () => {
        props.navigation.toggleDrawer();
    };

    return (
        <Container>
            {params?.fromCheckout ?
                <Header canGoBack>
                    {screenTitle}
                </Header>
                :
                <Header leftIconName='menu' leftPressHandler={toggleDrawer} style={{ marginBottom: 0 }}>
                    {screenTitle}
                </Header>
            }
            <View style={componentStyles.container}>
                {loadingAddresses ? <AddressListLoader /> :
                    <FlatList
                        data={currentAddresses}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        ListFooterComponent={
                            <Button iconLeft transparent onPress={addNewAddress} style={{ marginVertical: 15 }}>
                                <Icon size={24} name="add-location" color={customVariables.brandPrimary} />
                                <Text style={{ color: customVariables.brandPrimary }}>
                                    Nueva dirección
                                </Text>
                            </Button>
                        }
                    />
                }
            </View>
        </Container>
    )
};

const componentStyles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 15
    },
    selectedAddress: {
        borderColor: customVariables.brandPrimary,
        borderWidth: 2
    }
});

export default AddressListScreen;