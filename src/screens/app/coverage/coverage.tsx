import React, { useEffect, useState } from 'react';
import { Keyboard, StyleSheet } from 'react-native';
import customVariables from '@app-theme/native-base-theme/variables/material';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerParamList } from 'navigation/navigation';
import { Button, Container, Content, Spinner, View, Text, H1, H3 } from 'native-base';
import Header from '@app-components/header';
import TeedInput from '@app-components/input';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CoverageLoader from './coverage.loader';
import CoverageService from '@app-services/coverage.service';
import { ICoverage } from '@app-interfaces/coverage.interface';
import { groupBy } from '@app-utils/common-utils';
import AlertText from '@app-components/alert-text';
import CodeSearch from '@app-screens/app/coverage/components/code-search';

type ScreenNavigationProp = DrawerNavigationProp<DrawerParamList, 'Settings'>;

interface IProps {
    navigation: ScreenNavigationProp
};

const CoverageScreen: React.FC<IProps> = (props) => {

    const [loadingData, setLoadingData] = useState<boolean>(false);
    const [coverageData, setCoverageData] = useState<ICoverage[]>([]);

    useEffect(() => {
        getCoverageData();
    }, []);

    const getCoverageData = () => {
        setLoadingData(coverageData.length === 0);
        CoverageService.getCoverageData()
            .then(({ data }) => {
                setCoverageData(data);
            })
            .catch((error) => {
                console.log('ERROR LOADING COVERAGE DATA:', error);
            })
            .finally(() => setLoadingData(false))
    };

    const toggleDrawer = () => {
        props.navigation.toggleDrawer();
    };

    const getDataComponent = () => {
        let components: any[] = [];
        let states: any = Object.keys(groupBy(coverageData, "state"));

        states.forEach((state: any) => {
            components.push(<H3 key={state}>{state}</H3>);
            let cities: any = Object.keys(groupBy(coverageData.filter(x => x.state === state), "city"));
            cities.forEach((city: any, index: number) => {
                let postalCodes = coverageData.filter(x => x.city === city).map(x => x.postalCode).join(", ");
                components.push(
                    <View key={city + index} style={{ marginBottom: 15 }}>
                        <Text style={componentStyles.bold}>{city}</Text>
                        <Text>{postalCodes}</Text>
                    </View>
                );
            });
        });

        return components;
    };

    return (
        <Container>
            <Header leftIconName='menu' leftPressHandler={toggleDrawer} style={{ marginBottom: 0 }}>
                Zona de cobertura
            </Header>
            <Content>
                <CodeSearch coverageData={coverageData} fromModal={false} />
                {loadingData ? <CoverageLoader containerStyle={{ marginTop: 0 }} /> :
                    <View style={{ marginTop: 15 }}>
                        {getDataComponent().map((x: any) => x)}
                    </View>
                }
            </Content>
        </Container>
    )
};

const componentStyles = StyleSheet.create({
    bold: {
        fontFamily: 'Quicksand-Bold'
    }
});

export default CoverageScreen;