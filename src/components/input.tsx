import React, { ChangeEvent, memo } from 'react';
import { StyleSheet, StyleProp, TextStyle, TouchableWithoutFeedback } from 'react-native';
import { Input, Item, View, Icon, Label, NativeBase, Text, CheckBox } from 'native-base';
import customVariables from '@app-theme/native-base-theme/variables/material';

interface IProps extends Omit<NativeBase.Input, 'children'> {
    error?: string,
    touched?: boolean,
    handleBlur?: { (e: any): void; <T = any>(fieldOrEvent: T): T extends string ? (e: any) => void : void; },
    inputType?: 'text' | 'select' | 'textarea' | 'checkbox',
    options?: { text: string, value: string | number }[],
    labelStyle?: StyleProp<TextStyle>,
    containerStyles?: any,
    label?: string,
    check?: boolean,
    onPress?: () => void,
    viewCheck?: StyleProp<TextStyle>
}

const TeedInput: React.FC<IProps> = (props) => {
    const { ...inputProps } = props;
    return (
        <>
            { props.inputType === 'checkbox' ?
                <TouchableWithoutFeedback onPress={props.onPress}>
                    <View style={[props.viewCheck, { flexDirection: 'row' }]}>
                        <CheckBox
                            color={customVariables.brandPrimary}
                            style={{ marginTop: 3 }}
                            checked={props.check}
                            disabled={props.disabled}
                            onPress={props.onPress}
                        />
                        <Text style={{ marginLeft: 15, maxWidth: '80%' }}>{props.label}</Text>
                    </View>
                </TouchableWithoutFeedback>
                :
                <View style={[componentStyles.container, props.containerStyles]}>
                    {
                        props.inputType === 'select' ?
                            null
                            :
                            <>
                                <Label style={[componentStyles.inputLabel, props.labelStyle]}>{props.label}</Label>
                                <Item error={props.error && props.touched ? true : false} success={!props.error && props.touched} style={componentStyles.inputElement}>
                                    <Input disabled={props.disabled}
                                        {...inputProps}
                                        value={props.value}
                                        keyboardType={props.keyboardType}
                                        secureTextEntry={props.secureTextEntry}
                                        onChangeText={props.onChangeText}
                                        onBlur={props.handleBlur}
                                    />
                                    {!props.error && props.touched ? <Icon name='checkmark-circle' /> : null}
                                    {props.error && props.touched ? <Icon name='close-circle' /> : null}
                                </Item>
                                {props.error !== undefined && props.touched &&
                                    <Text style={componentStyles.errorLabel}>{props.error}</Text>
                                }
                            </>
                    }
                </View>
            }
        </>
    )
};

const componentStyles = StyleSheet.create({
    container: {
        marginTop: 15
    },
    inputElement: {
        backgroundColor: '#FFFFFF',
        marginTop: 5
    },
    inputLabel: {
        color: '#808080',
        fontSize: 13
    },
    errorLabel: {
        color: 'red',
        fontSize: 12,
        marginLeft: 3,
        marginTop: 5
    }
});

export default memo(TeedInput);