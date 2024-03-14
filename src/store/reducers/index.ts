import { ActionReducerMap } from "@ngrx/store";
import { loggedInUserProfileState, UserProfileReducer } from "./loggedinUser.reducer";
import { ProfileReducer, profileState } from "./profile.reducer";
import { UtilityReducer, utilityState } from "./utility.reducer";

export interface state {
    loginState: loggedInUserProfileState
    commonUtility: utilityState
    profileState: profileState
}

export const reducers: ActionReducerMap<state> = {
    loginState: UserProfileReducer,
    commonUtility: UtilityReducer,
    profileState: ProfileReducer
}
