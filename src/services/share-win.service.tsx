import { IShareWin } from "@app-interfaces/share-win.interface";
import axiosInstance from "@app-utils/axios-instance";

const getShareAndWinConfigUrl: string = '/ShareAndWin/getShareAndWinConfig';
const updateCodeUrl: string = '/ShareAndWin/updateCode?newCode=';

const ShareWinService = {
    getShareAndWinConfig: () => {
        return axiosInstance.get<IShareWin>(getShareAndWinConfigUrl);
    },

    updateCode: (newCode: string) => {
        return axiosInstance.post(updateCodeUrl + newCode);
    },
};

export default ShareWinService;