import React, {memo} from 'react';
import {
    StyleSheet,
    TouchableWithoutFeedback,
    Keyboard,
    View,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import {Form} from 'native-base';

interface IProps {
    verticalOffset?: number;
    style?: any;
    children: any;
}

const pressHandler = () => {
    Keyboard.dismiss();
};

const TeedForm: React.FC<IProps> = (props) => (
    <TouchableWithoutFeedback onPress={pressHandler}>
        <View style={[{marginBottom: 30}, props.style]}>
            <Form>{props.children}</Form>
        </View>
    </TouchableWithoutFeedback>
);

export default memo(TeedForm);
