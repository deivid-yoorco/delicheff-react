import axiosInstance from '@app-utils/axios-instance';
import {ICurrentUserPoints} from '@app-interfaces/reward.interface';

const getCurrentUserPointsUrl: string = '/Reward/getCurrentUserPoints';

const RewardService = {
    getCurrentUserPoints: () => {
        return axiosInstance.get<ICurrentUserPoints>(getCurrentUserPointsUrl);
    },
};

export default RewardService;
