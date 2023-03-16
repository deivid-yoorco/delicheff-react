import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Fab } from 'native-base';
import customVariables from "@app-theme/native-base-theme/variables/material";
import Icon from 'react-native-vector-icons/MaterialIcons';

interface IProps {
    onScroll: () => void,
    visible: boolean
}

const ButtonUp: React.FC<IProps> = (props) => {

    const { onScroll, visible } = props;

    return (
        <>
            {
                visible &&
                <Fab
                    style={{ backgroundColor: customVariables.brandPrimary }}
                    position="bottomRight"
                    onPress={onScroll}
                >
                    <Icon name="arrow-upward" />
                </Fab>
            }
        </>
    )
};

const componentStyles = StyleSheet.create({
});

export default memo(ButtonUp);