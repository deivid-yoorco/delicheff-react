import { IProduct } from "@app-interfaces/product.interface";

export const getQuantity = (product: IProduct) => {
    let qty = product.currentCartQuantity;
    let byWeight = (product.weightInterval > 0 && product.buyingBySecondary) || (product.weightInterval > 0 && product.equivalenceCoefficient === 0);
    let unit = ' pz';
    if (byWeight) {
        qty = qty * product.weightInterval;
        if (qty >= 1000) {
            qty = qty / 1000;
            unit = ' kg';
        }
        else unit = ' gr';
        qty = Math.round(qty * 100) / 100;
    }
    return qty + unit;
};

export const getPriceExtraString = (product: IProduct) => {
    return product.equivalenceCoefficient > 0 || product.weightInterval > 0 ? '/kg' : '/pz'
};