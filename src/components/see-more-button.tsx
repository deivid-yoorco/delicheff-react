import { Button, Text, View } from 'native-base';
import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import customVariables from '@app-theme/native-base-theme/variables/material';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

interface IProps {
    buttonText: string,
    goToAction?: () => void
};

const SeeMoreRoundButton: React.FC<IProps> = (props) => {

    const { buttonText, goToAction } = props;

    return (
        <TouchableWithoutFeedback onPress={goToAction} style={componentStyles.container}>
            <Button style={componentStyles.button}>
                <Icon name='arrow-forward' size={30} color={'white'} />
            </Button>
            <Text style={componentStyles.text}>{buttonText}</Text>
        </TouchableWithoutFeedback>
    )
};

const componentStyles = StyleSheet.create({
    container: {
        height: 260,
        width: 175,
        marginTop: 5,
        marginLeft: 3,
        marginRight: 5,
        justifyContent: 'center'
    },
    button: {
        borderWidth: 1,
        alignSelf: 'center',
        width: 70,
        height: 70,
        backgroundColor: customVariables.brandPrimary,
        borderRadius: 50
    },
    text: {
        fontSize: 14,
        fontFamily: 'Quicksand-Bold',
        textAlign: 'center',
        textAlignVertical: 'center',
        marginTop: 10
    }
});

export default memo(SeeMoreRoundButton);