import React, {useState, memo, useContext} from 'react';
import {IAppUser, IAppUserReward} from '@app-interfaces/user.interface';
import AsyncStorage from '@react-native-community/async-storage';
import {ICurrentUserPoints} from '@app-interfaces/reward.interface';

interface IProps {}

interface IContextProps {
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    appUser: IAppUser | null;
    appUserRewards: IAppUserReward | null;
    setAppUser: React.Dispatch<React.SetStateAction<IAppUser | null>>;
    logOutUser: () => void;
    updateUserPoints: (points: ICurrentUserPoints) => void;
    updateProfilePicture: (profilePictureId: number) => void;
}

export const AppContext = React.createContext<IContextProps>({
    loading: false,
    setLoading: () => {},
    appUser: null,
    appUserRewards: null,
    setAppUser: () => {},
    logOutUser: () => {},
    updateProfilePicture: (profilePictureId: number) => {},
    updateUserPoints: (points: ICurrentUserPoints) => {},
});

const AppContextProvider: React.FC<IProps> = (props) => {
    const [appUser, setAppUser] = useState<IAppUser | null>(null);
    const [appUserRewards, setAppUserRewards] = useState<IAppUserReward | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const logOutUser = () => {
        AsyncStorage.clear().then(() => {
            setAppUser(null);
        });
    };

    const updateUserPoints = (points: ICurrentUserPoints) => {
        let updated: IAppUserReward = {...appUserRewards, rewardPoints: points};
        setAppUserRewards(updated);
    };

    const updateProfilePicture = (profilePictureId: number) => {
        if (!appUser) return;
        let updated: IAppUser = {...appUser, profilePictureId: profilePictureId};
        setAppUser(updated);
    };

    return (
        <AppContext.Provider
            value={{
                loading,
                setLoading,
                appUser,
                appUserRewards,
                setAppUser,
                logOutUser,
                updateUserPoints,
                updateProfilePicture,
            }}>
            {props.children}
        </AppContext.Provider>
    );
};

export default memo(AppContextProvider);
