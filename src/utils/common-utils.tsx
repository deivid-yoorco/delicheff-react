export const formatCurrency = (amount: number | undefined): string => {
    if (!amount) amount = 0;
    return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
};

export const normalizeText = (text: string) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export const groupBy = (array: any[], key: string) => {
    if (!array) return;
    return array.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

export const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export const commonProductCardWidth = () => {
    return 370;
}