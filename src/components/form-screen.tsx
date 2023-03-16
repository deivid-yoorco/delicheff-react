import React, {memo} from 'react';
import {KeyboardAvoidingView, Platform, StyleSheet} from 'react-native';

interface IProps {}

const FormScreenComponent: React.FC<IProps> = (props) => {
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
            style={{flex: 1}}>
            {props.children}
        </KeyboardAvoidingView>
    );
};

const componentStyles = StyleSheet.create({});

export default memo(FormScreenComponent);
