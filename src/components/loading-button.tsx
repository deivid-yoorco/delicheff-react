import React, { memo } from 'react';
import { Button, Text, NativeBase, Spinner } from 'native-base';

interface IProps extends Omit<NativeBase.Button, 'children'> {
    onPress: () => void,
    isLoading: boolean,
    loadingText: string,
    style?: any,
    disabled: boolean,
    iconComponent?: JSX.Element,
    children?: any
};

const LoadingButton: React.FC<IProps> = (props) => {
    const { ...buttonProps } = props;
    return (
        <Button
            {...buttonProps}
            style={props.style}
            disabled={props.disabled || props.isLoading}
            onPress={props.onPress}
        >
            {props.isLoading && <Spinner color="white" />}
            {(props.iconComponent && !props.isLoading) && props.iconComponent}
            <Text style={props.isLoading && !props.loadingText ? { display: 'none' } : props.textStyle}>
                {props.isLoading ? props.loadingText : props.children ? props.children : "Save changes"}
            </Text>
        </Button>
    );
}

export default memo(LoadingButton);