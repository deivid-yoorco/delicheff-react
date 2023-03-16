import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import customVariables from '@app-theme/native-base-theme/variables/material';
import { Container, Content, Text } from 'native-base';
import Header from '@app-components/header';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from 'navigation/navigation';
import HTML from "react-native-render-html";
import SettingService from '@app-services/setting.service';
import AlertText from '@app-components/alert-text';
import TopicLoader from './topic-loader';
import { Config } from '@app-config/app.config';

type ScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Topic'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'Topic'>;

interface IProps {
    navigation: ScreenNavigationProp,
    route: ScreenRouteProp
};

const TopicScreen: React.FC<IProps> = (props) => {

    const { topic } = props.route.params;
    const [body, setBody] = useState<string>();
    const [bodyError, setBodyError] = useState<string>();
    const [loadingBody, setLoadingBody] = useState<boolean>(true);

    useEffect(() => {
        loadBody();
    }, []);

    const loadBody = () => {
        setLoadingBody(!body);
        SettingService.getPageBody(topic.id)
            .then(({ data }) => {
                let body = data.replace(/src="\//g, "src=\"" + Config.siteUrl);
                setBody(body);
            })
            .catch((error) => {
                console.log('ERROR LOADING BODY:', error);
                setBodyError('Ocurrió un problema al descargar la información. Por favor, inténtalo de nuevo más tarde.')
            })
            .finally(() => setLoadingBody(false))
    };

    const goBackHandler = () => {
        props.navigation.goBack();
    };

    return (
        <Container>
            <Header customGoBackHandler={() => goBackHandler()} customBackIcon='close'>
                {topic.name}
            </Header>
            <Content>
                {loadingBody ? <TopicLoader /> :
                    <HTML
                        html={body || ""}
                        imagesMaxWidth={Dimensions.get("window").width}
                        staticContentMaxWidth={Dimensions.get("window").width}
                        tagsStyles={{ p: { marginVertical: 5 }, img: { maxWidth: '100%' } }}
                    />
                }
                {bodyError && <AlertText error>{bodyError}</AlertText>}
            </Content>
        </Container>
    )
};

const componentStyles = StyleSheet.create({});

export default TopicScreen;