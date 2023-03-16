import {Card, Fab, Text} from 'native-base';
import React, { memo } from 'react';
import {Platform, StyleSheet, TouchableWithoutFeedback, View} from 'react-native';
import {ImagePickerResponse, launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import customVariables from '@app-theme/native-base-theme/variables/material';

interface IProps {
    displayModal: boolean;
    optionVideo?: boolean;
    toggleModal: () => void;
    handlePictureSelection: (imagePicker: ImagePickerResponse) => void;
}

type selectionType = 'CAMERA' | 'LIBRARY';

const SelectFileModal: React.FC<IProps> = (props) => {
    const handleFileSelection = (selection: selectionType) => {
        //props.toggleModal();
        switch (selection) {
            case 'CAMERA':
                getFileUsingCamera();
                break;
            case 'LIBRARY':
                getFileUsingLibrary();
                break;
        }
    };

    const getFileUsingCamera = () => {
        props.toggleModal();
        setTimeout(() => {
            launchCamera(
                {
                    mediaType: 'photo',
                    durationLimit: 60,
                    quality: 0.7,
                    cameraType: 'back',
                    includeBase64: true,
                },
                (response) => {
                    if (!response.didCancel) props.handlePictureSelection(response);
                },
            );
        }, 500);
    };

    const getFileUsingLibrary = () => {
        props.toggleModal();
        setTimeout(() => {
            launchImageLibrary(
                {
                    mediaType: 'photo',
                    quality: 0.7,
                    includeBase64: true,
                },
                (response) => {
                    if (!response.didCancel) props.handlePictureSelection(response);
                },
            );
        }, 500);
    };

    return (
        <Modal
            backdropTransitionOutTiming={0}
            hideModalContentWhileAnimating={true}
            isVisible={props.displayModal}
            onBackdropPress={props.toggleModal}
            onBackButtonPress={props.toggleModal}>
            <View
                style={{
                    backgroundColor: 'white',
                    alignItems: 'center',
                    paddingVertical: 30,
                    position: 'relative',
                }}>
                <TouchableWithoutFeedback onPress={() => handleFileSelection('LIBRARY')}>
                    <Card noShadow style={componentStyles.loadPictureButton}>
                        <View style={{alignItems: 'center'}}>
                            <Icon name="image" size={32} color={customVariables.brandPrimary} />
                        </View>
                        <View>
                            <Text style={{textAlign: 'center'}}>Cargar de la {'\n'} librería</Text>
                        </View>
                    </Card>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={() => handleFileSelection('CAMERA')}>
                    <Card noShadow style={componentStyles.loadPictureButton}>
                        <View style={{alignItems: 'center'}}>
                            <Icon name="camera" size={32} color={customVariables.brandPrimary} />
                        </View>
                        <View>
                            <Text style={{textAlign: 'center'}}>Tomar {'\n'} foto</Text>
                        </View>
                    </Card>
                </TouchableWithoutFeedback>
                <Fab
                    style={componentStyles.closeButton}
                    position="topRight"
                    onPress={props.toggleModal}>
                    <Icon name="close" />
                </Fab>
            </View>
        </Modal>
    );
};

const componentStyles = StyleSheet.create({
    modalContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        padding: 16,
        flex: 1,
    },
    backdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalItemsContainer: {
        marginVertical: 16,
        marginHorizontal: 8,
        justifyContent: 'space-between',
    },
    loadPictureButton: {
        marginBottom: 16,
        width: 150,
        paddingVertical: 20,
    },
    closeButton: {
        backgroundColor: customVariables.brandPrimary,
        position: 'absolute',
        right: -30,
        top: -30,
        width: 40,
        height: 40,
    },
});

export default memo(SelectFileModal);
