import React, {useState} from 'react';
import {IShoppingCartItem} from '@app-interfaces/shopping-cart.interface';
import {IProduct} from '@app-interfaces/product.interface';
import analytics from '@react-native-firebase/analytics';

interface IProps {}

interface IContextProps {
  shoppingCartItems: IShoppingCartItem[];
  setShoppingCartItems: React.Dispatch<
    React.SetStateAction<IShoppingCartItem[]>
  >;
  updateShoppingCart: (products: IProduct[]) => void;
  clearShoppingCart: () => void;
}

export const ShoppingCartContext = React.createContext<IContextProps>({
  shoppingCartItems: [],
  setShoppingCartItems: () => {},
  updateShoppingCart: () => {},
  clearShoppingCart: () => {},
});

const ShoppingCartContextProvider: React.FC<IProps> = (props) => {
  const [shoppingCartItems, setShoppingCartItems] = useState<
    IShoppingCartItem[]
  >([]);

  const updateShoppingCart = async (products: IProduct[]) => {
    let updatedArray = [...shoppingCartItems];
    products.forEach((product) => {
      let index = updatedArray.map((x) => x.productId).indexOf(product.id);
      let item: IShoppingCartItem = {
        quantity: product.currentCartQuantity,
        buyingBySecondary: product.buyingBySecondary,
        selectedPropertyOption: product.selectedPropertyOption,
        productId: product.id,
        pictureUrl: product.pictureUrl,
      };
      
      if (index === -1) {
        updatedArray.push(item);
        setTimeout(async () => {
          let body = {
            value: product.subTotal,
            currency: 'mxn',
            items: [
              {
                item_id: product.sku,
                item_name: product.name,
              },
            ],
          };

          await analytics().logAddToCart(body);
        }, 10);
      } else if (product.currentCartQuantity > 0) {
        updatedArray.splice(index, 1, item);
      } else {
        updatedArray.splice(index, 1);
        setTimeout(async () => {
          let body = {
            value: product.subTotal,
            currency: 'mxn',
            items: [
              {
                item_id: product.sku,
                item_name: product.name,
              },
            ],
          };
          await analytics().logRemoveFromCart(body);
        }, 10);
      }
    });
    setShoppingCartItems(updatedArray);
  };

  const clearShoppingCart = () => {
    setShoppingCartItems([]);
  };

  return (
    <ShoppingCartContext.Provider
      value={{
        shoppingCartItems,
        setShoppingCartItems,
        updateShoppingCart,
        clearShoppingCart,
      }}>
      {props.children}
    </ShoppingCartContext.Provider>
  );
};

export default ShoppingCartContextProvider;
