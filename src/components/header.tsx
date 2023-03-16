import React, { memo } from 'react';
import {
  Header as NativeBaseHeader,
  Body,
  Title,
  NativeBase,
  Left,
  Button,
  Right,
  View,
} from 'native-base';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import customVariables from '@app-theme/native-base-theme/variables/material';
import {Platform} from 'react-native';

interface IProps extends Omit<NativeBase.Header, 'children'> {
  canGoBack?: boolean;
  customBackIcon?: string;
  leftIconName?: string;
  leftPressHandler?: () => void;
  rightIconName?: string;
  rightPressHandler?: () => void;
  rightCustomComponent?: JSX.Element;
  customGoBackHandler?: () => void;
  image?: boolean;
  children: any;
}

const Header: React.FC<IProps> = (props) => {
  const {...headerProps} = props;
  const navigation = useNavigation();

  const goBackHandler = () => {
    navigation.goBack();
  };

  const parseTitle = (title: string) => {
    if (!title) return;
    if (title.length < 20) return title;
    return title.slice(0, 20) + '...';
  };

  return (
    <NativeBaseHeader
      iosBarStyle={Platform.OS == 'android' ? 'light-content' : 'dark-content'}
      noShadow
      transparent
      style={[{marginBottom: 0}, Platform.OS === 'ios' ? {paddingTop: 0} : {}]}
      {...headerProps}>
      {(props.canGoBack || props.customGoBackHandler) && (
        <Left style={{flex: 1}}>
          <Button transparent onPress={props.customGoBackHandler || goBackHandler}>
            <Icon
              color={customVariables.brandPrimary}
              size={24}
              name={props.customBackIcon ? props.customBackIcon : 'arrow-back'}
            />
          </Button>
        </Left>
      )}
      {props.leftIconName && props.leftPressHandler && (
        <Left style={{flex: 1}}>
          <Button transparent onPress={props.leftPressHandler}>
            <Icon color={customVariables.brandPrimary} size={24} name={props.leftIconName} />
          </Button>
        </Left>
      )}
      <Body style={[props.image ? {flex: 2} : {flex: 6, marginRight: 30}]}>
        {props.image ? (
          <>{props.children}</>
        ) : (
          <Title style={{color: '#000000', paddingBottom: 5}}>
            {parseTitle(props.children as string)}
          </Title>
        )}
      </Body>
      {props.rightIconName && props.rightPressHandler ? (
        <Right style={props.image ? {flex: 1} : undefined}>
          <Button transparent onPress={props.rightPressHandler}>
            <Icon color={customVariables.brandPrimary} size={24} name={props.rightIconName} />
          </Button>
        </Right>
      ) : (
        <>
          {props.rightCustomComponent ? (
            <Right style={props.image ? {flex: 1} : undefined}>{props.rightCustomComponent}</Right>
          ) : null}
        </>
      )}
    </NativeBaseHeader>
  );
};

export default memo(Header);
