import React, { memo, useEffect, useState } from 'react';
import { StyleSheet, ListRenderItemInfo } from 'react-native';
import customVariables from '@app-theme/native-base-theme/variables/material';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from 'navigation/navigation';
import { Container, ListItem, Body, View, Right, Text } from 'native-base';
import Header from '@app-components/header';
import { FlatList } from 'react-native-gesture-handler';
import { IShippingDate } from '@app-interfaces/checkout.interface';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getShippingFormatedDate } from '@app-utils/date-utils';
import analytics from '@react-native-firebase/analytics';
import { format } from 'date-fns';

type ScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DateSelection'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'DateSelection'>;

interface IProps {
    navigation: ScreenNavigationProp,
    route: ScreenRouteProp
};

const DateSelectionScreen: React.FC<IProps> = (props) => {

    const { onGoBack, selectedDate, availableDates } = props.route.params;
    const [currentSelected, setCurrentSelected] = useState<IShippingDate>(selectedDate);

    const goBackHandler = (selected?: IShippingDate) => {
        let newDate = selected || currentSelected;
        onGoBack(newDate);
        props.navigation.goBack();
    };

    const selectedDateHandler = async (selected: IShippingDate) => {
        let body = {
            checkout_step: 2,
            checkout_option: format(new Date(selected.date), 'dd-MM-yyyy') + " " + selected.shippingTime
        };
        await analytics().logSetCheckoutOption(body);
        setCurrentSelected(selected);
        goBackHandler(selected);
    };

    const renderItem = (info: ListRenderItemInfo<IShippingDate>) => {

        const { date, disabled, isActive, shippingTime } = info.item;
        let dateText = getShippingFormatedDate(date);
        let fullText = '(HORARIO LLENO)';

        let isSelected = new Date(currentSelected.date).setHours(0, 0, 0, 0) === new Date(date).setHours(0, 0, 0, 0) && currentSelected.shippingTime === shippingTime;

        return (
            <ListItem iconRight onPress={isActive && !disabled ? () => selectedDateHandler(info.item) : undefined}>
                <Body>
                    <View>
                        <Text style={[isActive && !disabled ? componentStyles.bold : componentStyles.disabled, isSelected ? componentStyles.selected : null]}>
                            {dateText}
                        </Text>
                        <Text style={[isActive && !disabled ? null : componentStyles.disabled, isSelected ? componentStyles.selected : null]}>
                            {shippingTime}
                        </Text>
                        {!isActive &&
                            <Text>
                                {fullText}
                            </Text>
                        }
                    </View>
                </Body>
                <Right>
                    {isSelected && <Icon size={24} color={customVariables.brandPrimary} name='check' />}
                </Right>
            </ListItem>
        );
    };

    return (
        <Container>
            <Header customGoBackHandler={() => goBackHandler()} customBackIcon='close'>
                Fecha de entrega
            </Header>
            <FlatList
                data={availableDates}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
            />
        </Container>
    )
};

const componentStyles = StyleSheet.create({
    bold: {
        fontFamily: 'Quicksand-Bold'
    },
    disabled: {
        color: customVariables.brandLight
    },
    selected: {
        color: customVariables.brandPrimary
    }
});

export default memo(DateSelectionScreen);