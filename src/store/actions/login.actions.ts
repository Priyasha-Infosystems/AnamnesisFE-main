import { Action } from "@ngrx/store";
import { Login } from "../models/login";

export enum LoginActionTypes {
  userProfile = "USER_PROFILE",
  loginClicked = "LOGIN_CLICKED"
}

export class userProfile implements Action {
  readonly type = LoginActionTypes.userProfile;
  constructor(public payload?: any) { }
}

export class isLoginClicked implements Action {
  readonly type = LoginActionTypes.loginClicked;
  constructor(public payload?: any) { }
}

export type loginAction =
  | userProfile
  | isLoginClicked