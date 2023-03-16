import React, {useEffect, useState} from 'react';
import {StyleSheet, Platform} from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import {IOnboarding} from '@app-interfaces/home.interface';
import {getPictureUrl} from '@app-utils/request-utils';
import HomeService from '@app-services/home.service';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from 'navigation/navigation';
import {Text} from 'native-base';
import {TouchableWithoutFeedback} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import analytics from '@react-native-firebase/analytics';
import FastImage from 'react-native-fast-image';

type ScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

interface IProps {
    navigation: ScreenNavigationProp;
}

const OnboardingScreen: React.FC<IProps> = (props) => {
    const [onboardindData, setOnboardingData] = useState<IOnboarding[]>([]);

    useEffect(() => {
        AsyncStorage.getItem('onboarding')
            .then((data) => {
                if (!data) getOnboardings();
                else goToHome();
            })
            .catch((error) => {
                console.log('Error getting onboarding data:', error);
                goToHome();
            });
    }, []);

    const CustomDoneButton = () => (
        <TouchableWithoutFeedback onPress={doneButtonHandler}>
            <Text style={[componentStyles.labelTextBold, {right: 15, color: '#FFFFFF'}]}>
                Continuar
            </Text>
        </TouchableWithoutFeedback>
    );

    const onDone = async () => {
        await AsyncStorage.setItem('onboarding', 'true');
        goToHome();
    };

    const getOnboardings = () => {
        HomeService.getActiveOnboardings()
            .then(({data}) => {
                if (!data || data.length === 0) {
                    goToHome();
                    return;
                }
                setOnboardingData(data);
            })
            .catch((error) => {
                console.log('ERROR GETTING ONBOARDINGS:', error);
                goToHome();
            });
    };

    const goToHome = () => {
        props.navigation.replace('Main');
    };

    const skipButtonHandler = async () => {
        await analytics().logEvent('onboarding_skiped');
        onDone();
    };

    const doneButtonHandler = async () => {
        await analytics().logEvent('onboarding_completed');
        onDone();
    };

    return (
        <>
            {onboardindData.length > 0 && (
                <Onboarding
                    titleStyles={componentStyles.labelTextBold}
                    subTitleStyles={componentStyles.labelTextBold}
                    nextLabel={<Text style={componentStyles.labelText}>Siguiente</Text>}
                    skipLabel={<Text style={componentStyles.labelText}>Cerrar</Text>}
                    showSkip={false}
                    DoneButtonComponent={CustomDoneButton}
                    onSkip={skipButtonHandler}
                    pages={onboardindData.map((x) => {
                        return {
                            backgroundColor: x.backgroundColor,
                            image: (
                                <FastImage
                                    source={{uri: getPictureUrl(x.imageId)}}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        marginTop: Platform.OS == 'android' ? 40 : 0
                                    }}
                                    resizeMode='contain'
                                />
                            ),
                            title: x.title || '',
                            subtitle: x.subtitle || '',
                        };
                    })}
                />
            )}
        </>
    );
};

const componentStyles = StyleSheet.create({
    labelText: {
        fontFamily: 'Quicksand-Regular',
        color: '#FFFFFF',
    },
    labelTextBold: {
        fontFamily: 'Quicksand-Bold',
    },
});

export default OnboardingScreen;
