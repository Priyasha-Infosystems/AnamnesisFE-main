import { Action } from "@ngrx/store";

export enum ProfileActionTypes {
    secQuestionesSet = "SET_SEC_QUESTIONS",
    profileCompleted = "PROFILE_COMPLETED",
    profileDetails = "PROFILE_DETAILS",
    companyDetails = "COMPANY_DETAILS",
    userID = "USER_ID"
}

export class isProfileCompleted implements Action {
    readonly type = ProfileActionTypes.profileCompleted;
    constructor(public payload?: any) { }
}

export class setUserID implements Action {
    readonly type = ProfileActionTypes.userID;
    constructor(public payload?: any) { }
}

export class isSecQuestionSet implements Action {
    readonly type = ProfileActionTypes.secQuestionesSet;
    constructor(public payload?: any) { }
}

export class setProfileDetails implements Action {
    readonly type = ProfileActionTypes.profileDetails;
    constructor(public payload?: any) { }
}

export class setCompanyDetails implements Action {
    readonly type = ProfileActionTypes.companyDetails;
    constructor(public payload?: any) { }
}

export type loginAction =
    | isProfileCompleted
    | isSecQuestionSet
    | setProfileDetails
    | setCompanyDetails
