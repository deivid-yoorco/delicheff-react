import axiosInstance from "@app-utils/axios-instance";
import { IUserAddress, IAddressAttribute } from "@app-interfaces/address.interface";
import { ICreatedCardData, IGetSignature, IPaymentData, ISignatureResult } from "@app-interfaces/visa-payment.interface";
import RNSimpleCrypto from "react-native-simple-crypto";
import { encode, decode } from 'base64-arraybuffer';
import AuthService, { IAppUser } from "./auth.service";
import { ISavedCard } from "@app-interfaces/checkout.interface";

const utf8ToArrayBuffer = RNSimpleCrypto.utils.convertUtf8ToArrayBuffer;
const arrayToBase64 = RNSimpleCrypto.utils.convertArrayBufferToBase64;

const getPaymentDataUrl: string = '/VisaMobilePayment/getPaymentData';
const getSignatureUrl: string = '/VisaMobilePayment/getSignature';
const saveVisaCardUrl: string = '/Checkout/saveVisaCard';
const deleteVisaCardUrl: string = '/Checkout/deleteVisaCard';
const excecuteDecisionManagerUrl: string = '/VisaMobilePayment/ExcecuteDecisionManager';
const capturePaymentUrl: string = '/VisaMobilePayment/capturePayment';

const createInstrumentIdentifierResource: string = '/tms/v1/instrumentidentifiers';
const createPaymentInstrumentResource: string = '/tms/v1/paymentinstruments';
const createCustomerResource: string = '/tms/v2/customers';
const createCustomerPaymentInstrumentResource: string = '/tms/v2/customers/';
const deleteCustomerResource: string = '/tms/v2/customers/';

const VisaPaymentService = {
    getPaymentData: () => {
        return axiosInstance.get<IPaymentData>(getPaymentDataUrl);
    },

    excecuteDecisionManager: (cardData: ISavedCard) => {
        return axiosInstance.post<boolean>(excecuteDecisionManagerUrl, cardData);
    },

    capturePayment: (cardData: ISavedCard) => {
        return axiosInstance.post<string>(capturePaymentUrl, cardData);
    },

    saveCardInDb: async (data: ICreatedCardData) => {
        return VisaPaymentService.getInstrumentIdentifierId(data)
            .then(async (instrumentIdentifierId) => {
                console.log('INSTRUMENT IDENTIFIER ID:', instrumentIdentifierId);
                return VisaPaymentService.getCustomerId(data.customer)
                    .then(async (customerId) => {
                        console.log('CUSTOMER ID:', customerId);
                        return VisaPaymentService.createCustomerPaymentInstrument(customerId, instrumentIdentifierId, data)
                            .then(async () => {
                                return VisaPaymentService.saveVisaCard(data, customerId);
                            })
                            .catch((error) => { throw error })
                    })
                    .catch((error) => { throw error })
            })
            .catch((error) => { throw error })
    },

    deleteVisaCard: async (visaCustomerId: string) => {
        return VisaPaymentService.requestToCybersourceApi(null, deleteCustomerResource + visaCustomerId, "delete")
            .then((response) => {
                console.log("DELETING CUSTOMER RESULT", response);
                return VisaPaymentService.deleteVisaCardFromDB();
            })
            .catch((error) => {
                console.log("ERROR WITH DELETE CUSTOMER REQUEST:", error);
                throw error;
            })
    },

    deleteVisaCardFromDB: () => {
        return axiosInstance.delete(deleteVisaCardUrl);
    },

    saveVisaCard: (data: ICreatedCardData, customerId: string) => {
        let body: ISavedCard = {
            cardOwnerName: data.nameInCard,
            brand: data.cardCompany,
            lastFourDigits: data.cardNumber.slice(data.cardNumber.length - 4),
            serviceCustomerId: customerId,
            billAddress1: data.street1,
            billAdministrativeArea: data.state,
            billCountry: data.country,
            billEmail: data.email,
            billFirstName: data.firstName,
            billLastName: data.lastName,
            billLocality: data.city,
            billPhoneNumber: data.phoneNumber,
            billPostalCode: data.postalCode
        };
        return axiosInstance.post<ISavedCard>(saveVisaCardUrl, body);
    },

    getInstrumentIdentifierId: async (cardData: ICreatedCardData) => {
        let body = {
            type: "enrollable card",
            card: {
                number: cardData.cardNumber,
                expirationMonth: cardData.expirationMonth,
                expirationYear: '20' + cardData.expirationYear,
                securityCode: cardData.cvNumber
            },
            billTo: {
                address1: cardData.street1,
                locality: cardData.city,
                administrativeArea: cardData.state,
                postalCode: cardData.postalCode,
                country: "MX"
            },
        };

        console.log("INSTRUMENT IDENTIFIER BODY:", body);

        return VisaPaymentService.requestToCybersourceApi(body, createInstrumentIdentifierResource, "post")
            .then((response) => {
                return response.id as string;
            })
            .catch((error) => {
                console.log("ERROR WITH II REQUEST:", error);
                throw error;
            })
    },

    getCustomerId: async (user: IAppUser) => {
        let body = {
            buyerInformation: {
                merchantCustomerID: user.id,
                email: user.email
            },
            clientReferenceInformation: {
                code: user.id
            }
        };

        return VisaPaymentService.requestToCybersourceApi(body, createCustomerResource, "post")
            .then((response) => {
                console.log("CREATE CUSTOMER RESPONSE", response);
                return response.id as string;
            })
            .catch((error) => {
                console.log("ERROR WITH CC REQUEST:", error);
                throw error;
            })
    },

    createCustomerPaymentInstrument: async (customerId: string, instrumentIdentifierId: string, cardData: ICreatedCardData) => {
        let body = {
            default: true,
            card: {
                expirationMonth: cardData.expirationMonth,
                expirationYear: '20' + cardData.expirationYear,
                type: cardData.cardType
            },
            billTo: {
                firstName: cardData.firstName,
                lastName: cardData.lastName,
                address1: cardData.street1,
                locality: cardData.city,
                administrativeArea: cardData.state,
                postalCode: cardData.postalCode,
                country: "MX",
                phoneNumber: cardData.phoneNumber,
                email: cardData.email
            },
            instrumentIdentifier: {
                id: instrumentIdentifierId
            }
        };
        let resource = createCustomerPaymentInstrumentResource + customerId + '/payment-instruments';
        console.log(resource);
        console.log(body);
        return VisaPaymentService.requestToCybersourceApi(body, resource, "post")
            .then((response) => {
                if (response.errors?.length > 0) throw null;
                console.log("CUSTOMER PAYMENT INSTRUMENT RESULT", response);
                return "";
            })
            .catch((error) => {
                console.log("ERROR WITH CUSTOMER PAYMENT INSTRUMENT REQUEST:", error);
                throw error;
            })
    },

    requestToCybersourceApi: async (body: any, resource: string, method: string) => {
        const dataJson = body === null ? "" : JSON.stringify(body);
        return VisaPaymentService.generateDigest(dataJson)
            .then(async (digest) => {
                let date = new Date();
                return VisaPaymentService.generateSignature(digest, method, resource, date)
                    .then(async ({ data }) => {
                        let requestData: any = {
                            method: method,
                            body: dataJson,
                            headers: {
                                'Content-Type': 'application/json',
                                'v-c-merchant-id': data.merchantId,
                                'Date': data.dateParsed,
                                'Host': data.host,
                                'Signature': data.signature
                            }
                        };

                        if (digest)
                            requestData.headers["Digest"] = digest;

                        if (method !== 'delete') {
                            return fetch('https://' + data.host + resource, requestData)
                                .then(response => response.json()) // This first then is required to get the object in the next then
                                .then(response => {
                                    return response;
                                })
                                .catch((error) => {
                                    console.log('ERROR WITH CYBERSOURCE REQUEST:', error);
                                    throw error;
                                })
                        }
                        else {
                            return fetch('https://' + data.host + resource, requestData)
                                .catch((error) => {
                                    console.log('ERROR WITH CYBERSOURCE REQUEST:', error);
                                    throw error;
                                })
                        }
                    })
                    .catch((error) => {
                        console.log('ERROR GENERATING SIGNATURE:', error);
                        throw error;
                    })
            })
            .catch((error) => {
                console.log("ERROR GENERATING DIGEST:", error);
                throw error;
            })
    },

    generateDigest: async (value: string) => {
        if (!value) return null;
        const dataArray = utf8ToArrayBuffer(value);
        return RNSimpleCrypto.SHA.sha256(dataArray)
            .then((result: any) => {
                return "SHA-256=" + arrayToBase64(result);
            })
            .catch((error: any) => { throw error })
    },

    generateSignature: async (digest: string | null, method: string, resource: string, date: Date) => {
        let body: IGetSignature = {
            digest: digest,
            method: method,
            resource: resource,
            gmtDateTime: date
        };

        return axiosInstance.post<ISignatureResult>(getSignatureUrl, body);
    }
};

export default VisaPaymentService;