import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import customVariables from '@app-theme/native-base-theme/variables/material';
import { View, Text } from 'native-base';

interface IProps {
    title: string,
    value: string
};

const InlineTitleText: React.FC<IProps> = (props) => (
    <View style={{ flexDirection: 'row' }}>
        <Text style={{ fontFamily: 'Quicksand-Bold' }}>
            {props.title + ' '}
        </Text>
        <Text>
            {props.value}
        </Text>
    </View>
);

const componentStyles = StyleSheet.create({});

export default memo(InlineTitleText);