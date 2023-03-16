import React, { memo } from 'react';
import {StyleSheet} from 'react-native';
import customVariables from '@app-theme/native-base-theme/variables/material';
import Modal from 'react-native-modal';
import {Card, CardItem, View, Text, Body, Picker, Button} from 'native-base';

interface IProps {
  sortModalVisible: boolean;
  toggleModal: () => void;
  sortBy: number;
  updateSortValue: (itemValue: React.ReactText) => void;
  saveSortByHandler: () => void;
}

const SortModal: React.FC<IProps> = (props) => {
  const {sortModalVisible, toggleModal, sortBy, updateSortValue, saveSortByHandler} = props;

  return (
    <Modal
      isVisible={sortModalVisible}
      onBackdropPress={toggleModal}
      backdropTransitionOutTiming={0}
      hideModalContentWhileAnimating={true}>
      <View style={{backgroundColor: 'white', alignItems: 'center'}}>
        <Card noShadow transparent style={{width: '100%'}}>
          <CardItem>
            <Text
              style={{
                color: customVariables.brandPrimary,
                fontWeight: 'bold',
              }}>
              Ordenar productos
            </Text>
          </CardItem>
          <CardItem>
            <Body>
              <Text style={{marginBottom: 10}}>¿Cómo te gustaría ver ordenados los productos?</Text>
              <Picker
                style={{width: '100%'}}
                note
                mode="dialog"
                selectedValue={sortBy}
                onValueChange={updateSortValue}>
                <Picker.Item label="Por relevancia" value={0} />
                <Picker.Item label="Por nombre: A a Z" value={5} />
                <Picker.Item label="Por nombre: Z a A" value={6} />
                <Picker.Item label="Por precio: Bajo a alto" value={10} />
                <Picker.Item label="Por precio: Alto a bajo" value={11} />
                <Picker.Item label="Por fecha de publicación" value={15} />
              </Picker>
            </Body>
          </CardItem>
          <CardItem footer style={{alignSelf: 'flex-end'}}>
            <Button transparent onPress={toggleModal}>
              <Text>Cancelar</Text>
            </Button>
            <Button onPress={saveSortByHandler}>
              <Text>Guardar</Text>
            </Button>
          </CardItem>
        </Card>
      </View>
    </Modal>
  );
};

const componentStyles = StyleSheet.create({});

export default memo(SortModal);
