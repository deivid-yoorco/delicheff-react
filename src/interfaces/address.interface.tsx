export interface IUserAddress {
    id: number,
    address1: string,
    address2: string,
    city: string,
    country: string,
    countryId?: number,
    email: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    stateProvinceId?: number,
    stateProvince: string,
    zipPostalCode: string,
    addressAttributes: IAddressAttribute[],
    latitude: string,
    longitude: string
};

export interface IAddressAttribute {
    id: number,
    name: string,
    isRequired: boolean,
    value: string
};