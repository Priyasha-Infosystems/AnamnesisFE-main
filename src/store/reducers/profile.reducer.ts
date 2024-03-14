import { ActionParent } from '../actions';
import { ProfileActionTypes } from '../actions/profile.actions';

export interface profileState {
    isSecQuestionesSet: boolean,
    isProfileCompleted: boolean,
    userId: string
    profileDetails: any,
    companyDetails: any
}

export const initialState: profileState = {
    isSecQuestionesSet: false,
    isProfileCompleted: false,
    userId: '',
    profileDetails: {},
    companyDetails: {}
};

export function ProfileReducer(state = initialState, action: ActionParent) {
    switch (action.type) {
        case ProfileActionTypes.profileCompleted:
            return {
                ...state,
                isProfileCompleted: action.payload
            };
        case ProfileActionTypes.secQuestionesSet:
            return {
                ...state,
                isSecQuestionesSet: action.payload
            };
        case ProfileActionTypes.profileDetails:
            return {
                ...state,
                profileDetails: action.payload
            };
        case ProfileActionTypes.companyDetails:
            return {
                ...state,
                companyDetails: action.payload
            };
        case ProfileActionTypes.userID:
            return {
                ...state,
                userId: action.payload
            };
        default:
            return state;
    }
}
