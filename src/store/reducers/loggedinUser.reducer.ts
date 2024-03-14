import { ActionParent } from '../actions';
import { LoginActionTypes } from '../actions/login.actions';

export interface loggedInUserProfileState {
  userProfile: [],
  isLoginClicked: boolean
}

export const initialState: loggedInUserProfileState = {
  userProfile: [],
  isLoginClicked: false
};

export function UserProfileReducer(state = initialState, action: ActionParent) {
  switch (action.type) {
    case LoginActionTypes.userProfile:
      return {
        ...state,
        userProfile: action.payload
      };
    case LoginActionTypes.loginClicked:
      return {
        ...state,
        isLoginClicked: action.payload
      };
    default:
      return state;
  }
}

export const getLoggedInUser = (state: loggedInUserProfileState) => state.userProfile;