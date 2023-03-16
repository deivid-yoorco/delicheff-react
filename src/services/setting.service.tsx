import { ITopic } from "@app-interfaces/setting.interface";
import axiosInstance from "@app-utils/axios-instance";

const getSettingsPagesUrl: string = '/Settings/getSettingsPages';
const getPageBodyUrl: string = '/Settings/getPageBody?topicId=';

const SettingService = {
    getSettingsPages: () => {
        return axiosInstance.get<ITopic[]>(getSettingsPagesUrl);
    },

    getPageBody: (topicId: number) => {
        return axiosInstance.get<string>(getPageBodyUrl + topicId);
    },
};

export default SettingService;