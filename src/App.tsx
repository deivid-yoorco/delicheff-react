import 'react-native-gesture-handler';
import React, { memo, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
  LogBox,
  Platform
} from 'react-native';
import getTheme from './theme/native-base-theme/components';
import { StyleProvider, Root } from 'native-base';
import AppContextProvider from '@app-context/app.context';
import AppNavigator from './navigation';
import material from '@app-theme/native-base-theme/variables/material';
import ShoppingCartContextProvider from '@app-context/shopping-cart.context';
import RNBootSplash from "react-native-bootsplash";
import WishlistContextProvider from '@app-context/wishlist.context';

const App = () => {

  useEffect(() => {
    RNBootSplash.hide({ duration: 250 });
    LogBox.ignoreLogs(['registerHeadlessTask']);
  }, []);

  return (
    <Root>
      <StyleProvider style={getTheme(material)}>
        <React.Fragment>
          <StatusBar barStyle={Platform.OS == 'android' ? 'light-content' : 'dark-content'} />
          <SafeAreaView style={styles.container}>
            <AppContextProvider>
              <ShoppingCartContextProvider>
                <WishlistContextProvider>
                <AppNavigator />
                </WishlistContextProvider>
              </ShoppingCartContextProvider>
            </AppContextProvider>
          </SafeAreaView>
        </React.Fragment>
      </StyleProvider>
    </Root>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default memo(App);
