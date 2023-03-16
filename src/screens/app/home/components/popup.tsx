import React, { memo, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import customVariables from '@app-theme/native-base-theme/variables/material';
import Modal from 'react-native-modal';
import HomeService from '@app-services/home.service';
import { Fab, View } from 'native-base';
import FastImage from 'react-native-fast-image';
import { Config } from '@app-config/app.config';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface IProps { }

const Popup: React.FC<IProps> = (props) => {

    const [popupImageUrls, setPopupImageUrls] = useState<string[]>([]);
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    useEffect(() => {
        HomeService.checkIfPopupDisplayedToday()
            .then((result) => {
                if (result) return;
                HomeService.getPopupData(false)
                    .then(({ data }) => {
                        HomeService.saveIfPopupDisplayedTodayInLS();
                        setPopupImageUrls(data);
                        if (data && data.length > 0)
                            setModalVisible(true);
                    })
                    .catch((error) => console.log('ERROR GETTING POPUP DATA:', error))
            })
    }, []);

    const closeModal = () => {
        setModalVisible(false);
    };

    return (
        <>
            {modalVisible &&
                <Modal
                    backdropTransitionOutTiming={0}
                    hideModalContentWhileAnimating={true}
                    isVisible={modalVisible}
                    onBackdropPress={closeModal}
                    onBackButtonPress={closeModal}
                >
                    <View style={{ backgroundColor: 'white', alignItems: 'center' }}>
                        <FastImage resizeMode='center' source={{ uri: Config.apiUrl + popupImageUrls[0] }} style={{ height: 500, width: 300 }} />
                    </View>
                    <Fab
                        style={componentStyles.closeButton}
                        position="topRight"
                        onPress={closeModal}
                    >
                        <Icon name="close" />
                    </Fab>
                </Modal>
            }
        </>
    )
};

const componentStyles = StyleSheet.create({
    closeButton: {
        backgroundColor: customVariables.brandPrimary,
        position: 'absolute',
        right: -30,
        top: 50,
        width: 40,
        height: 40
    }
});

export default memo(Popup);