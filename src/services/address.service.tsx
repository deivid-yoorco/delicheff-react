import axiosInstance from "@app-utils/axios-instance";
import { IUserAddress, IAddressAttribute } from "@app-interfaces/address.interface";

const getAddressesUrl: string = '/Customer/GetCustomerAddresses';
const isPostalCodeValidUrl: string = '/App/VerifyPostalCodeRegion?postalCode=';
const getAddressAttributesUrl: string = '/Address/GetAddressAttributes';
const saveNewAddressUrl: string = '/Address/saveNewAddress';
const deleteAddressUrl: string = '/Address/deleteAddress?addressId=';
const userAddressCountUrl: string = '/Address/userAddressCount';

const AddressService = {
    getAddresses: () => {
        return axiosInstance.get<IUserAddress[]>(getAddressesUrl);
    },

    isPostalCodeValid: (postalCode: string) => {
        return axiosInstance.get<boolean>(isPostalCodeValidUrl + postalCode);
    },

    getAddressAttributes: () => {
        return axiosInstance.get<IAddressAttribute[]>(getAddressAttributesUrl);
    },

    saveNewAddress: (body: IUserAddress) => {
        return axiosInstance.post<IUserAddress>(saveNewAddressUrl, body);
    },

    deleteAddress: (addressId: number) => {
        return axiosInstance.delete(deleteAddressUrl + addressId);
    },

    userAddressCount: () => {
        return axiosInstance.get<number>(userAddressCountUrl);
    },
};

export default AddressService;