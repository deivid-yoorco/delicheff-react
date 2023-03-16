import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'native-base';
import customVariables from "@app-theme/native-base-theme/variables/material";

interface IProps {
    error?: boolean,
    success?: boolean,
    style?: any,
    children: any
}

const AlertText: React.FC<IProps> = (props) => {
    return (
        <Text style={[componentStyles.mainText, props.style, props.error ? componentStyles.error : props.success ? componentStyles.success : {}]}>
            {props.children}
        </Text>
    )
};

const componentStyles = StyleSheet.create({
    mainText: {
        textAlign: 'center',
        fontFamily: 'Quicksand-Bold',
        marginHorizontal: 30,
        marginBottom: 30
        //padding: 10
    },
    error: {
        color: customVariables.brandDanger
    },
    success: {
        color: customVariables.brandSuccess
    }
});

export default memo(AlertText);