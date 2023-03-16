import { IAppUser } from "@app-services/auth.service";

export interface IPaymentData {
    url: string,
    apiKey: string,
    merchantId: string,
    secretSharedKey: string
};

export interface ICreatedCardData {
    city: string,
    country: string,
    email: string,
    nameInCard: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    postalCode: string,
    state: string,
    street1: string,
    cardNumber: string,
    cardType?: string,
    cardCompany: string,
    cvNumber: string,
    expirationMonth: string,
    expirationYear: string,
    customer: IAppUser
};

export interface ISignatureResult {
    signature: string,
    merchantId: string,
    host: string,
    dateParsed: string
};

export interface IGetSignature {
    digest: string | null,
    method: string,
    resource: string,
    gmtDateTime: Date
};