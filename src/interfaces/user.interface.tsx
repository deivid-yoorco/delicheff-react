import {ICurrentUserPoints} from './reward.interface';

export interface IAppUser {
    firstName: string;
    lastName: string;
    email: string;
    birthDate: string;
    gender: string;
    newsletterCheck: boolean;
    phoneNumber: string;
    id: string;
    roles: string[];
    refreshToken: string;
    profilePictureId: number;
    profilePictureLastUpdate: Date;
}

export interface IUpdateUser {
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: string;
    newsletterCheck: boolean;
    phoneNumber: string;
    oldPassword?: string;
    newPassword?: string;
    profilePictureBase64: string;
    profilePictureMimeType: string;
}

export interface IAppUserReward {
    rewardPoints?: ICurrentUserPoints;
}