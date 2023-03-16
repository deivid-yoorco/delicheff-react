import React from 'react';
import { StyleSheet } from 'react-native';
import customVariables from '@app-theme/native-base-theme/variables/material';
import { Container, Content, View } from 'native-base';
import Header from '@app-components/header';
import { StackNavigationProp } from '@react-navigation/stack';
import { DrawerParamList, RootStackParamList } from 'navigation/navigation';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import ShareAndWinContent from './content';
import Share from "react-native-share";

type ScreenNavigationProp = DrawerNavigationProp<DrawerParamList, 'ShareAndWin'>;

interface IProps {
    navigation: ScreenNavigationProp
};

const ShareAndWinScreen: React.FC<IProps> = (props) => {

    const toggleDrawer = () => {
        props.navigation.toggleDrawer();
    };

    return (
        <Container>
            <Header leftIconName='menu' leftPressHandler={toggleDrawer} style={{ marginBottom: 0 }}>
                ¡Gana super gratis!
            </Header>
            <View style={componentStyles.container}>
                <ShareAndWinContent />
            </View>
        </Container>
    )
};

const componentStyles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 15
    },
});

export default ShareAndWinScreen;