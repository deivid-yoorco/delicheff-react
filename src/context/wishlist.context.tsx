import React, { useState } from 'react';
import analytics from '@react-native-firebase/analytics';
import { IWishlistItem } from '@app-interfaces/shopping-cart.interface';
import { IProduct } from '@app-interfaces/product.interface';

interface IProps { }

interface IContextProps {
  wishlistItems: IWishlistItem[];
  setWishlistItems: React.Dispatch<
    React.SetStateAction<IWishlistItem[]>
  >;
  updateWishlist: (products: IProduct[], fromLikeButton: boolean) => void;
}

export const WishlistContext = React.createContext<IContextProps>({
  wishlistItems: [],
  setWishlistItems: () => { },
  updateWishlist: () => { },
});

const WishlistContextProvider: React.FC<IProps> = (props) => {
  const [wishlistItems, setWishlistItems] = useState<
    IWishlistItem[]
  >([]);

  const updateWishlist = async (products: IProduct[], fromLikeButton: boolean) => {
    let updatedArray = [...wishlistItems];
    products.forEach((product) => {
      let index = updatedArray.map((x) => x.productId).indexOf(product.id);
      let item: IWishlistItem = {
        productId: product.id,
        productSku: product.sku,
        productName: product.name,
        productSubtotal: product.subTotal
      }

      if (index === -1) {
        updatedArray.push(item);
        setTimeout(async () => {
          let body = {
            value: item.productSubtotal,
            currency: 'mxn',
            items: [
              {
                item_id: item.productSku,
                item_name: item.productName,
              },
            ],
          };
          await analytics().logAddToCart(body);
        }, 10);
      }
      else if (fromLikeButton) {
        updatedArray.splice(index, 1);
        setTimeout(async () => {
          let body = {
            value: item.productSubtotal,
            currency: 'mxn',
            items: [
              {
                item_id: item.productSku,
                item_name: item.productName,
              },
            ],
          };
          await analytics().logRemoveFromCart(body);
        }, 10);
      }
    });
    setWishlistItems(updatedArray);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        setWishlistItems,
        updateWishlist,
      }}>
      {props.children}
    </WishlistContext.Provider>
  );
};

export default WishlistContextProvider;
