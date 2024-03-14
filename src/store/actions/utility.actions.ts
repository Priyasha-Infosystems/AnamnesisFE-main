import { Action } from "@ngrx/store";

export enum UtilityActionTypes {
    utility = "UTILITY_ACTIONS",
    executedUtility = "EXECUTED_UTILITY_ACTIONS",
    documentTypeDetailsList = "DOCUMENT_TYPE_DETAILS",
    documentDetailsFetched = "FETCHED_DOCUMENTS",
    commercialTypeDetailsList = "COMMERCIAL_TYPE_DETAILS",
    relationList = "RELATION_TYPE_DETAILS",
    commercialDetailsFetched = "FETCHED_COMMERCIAL",
    userMenuLists = "USER_MENU_LIST",
    userMenuListsFetched = "USER_MENU_LIST_FETCHED",
    medicineTypeList ="MEDICINE_TYPE_LIST",
    restrictedDrugList ="RESTRICTEDDRUG_LIST",
    householdItemCategoryAndSubcategoryDetailsList = 'HOUSEHOLD_CATEGORY_SUB_CATEGORY_LIST'
}

export class utility implements Action {
    readonly type = UtilityActionTypes.utility;
    constructor(public payload?: any) { }
}

export class isUtilityExecuted implements Action {
    readonly type = UtilityActionTypes.executedUtility;
    constructor(public payload?: any) { }
}

export class documentTypeDetails implements Action {
    readonly type = UtilityActionTypes.documentTypeDetailsList;
    constructor(public payload?: any) { }
}
export class medicineTypeDetails implements Action {
    readonly type = UtilityActionTypes.medicineTypeList;
    constructor(public payload?: any) { }
}
export class restrictedDrugDetails implements Action {
    readonly type = UtilityActionTypes.restrictedDrugList;
    constructor(public payload?: any) { }
}
export class householdItemCategoryAndSubcategoryDetailsList implements Action {
    readonly type = UtilityActionTypes.householdItemCategoryAndSubcategoryDetailsList;
    constructor(public payload?: any) { }
}

export class isDocumentDetailsFetched implements Action {
    readonly type = UtilityActionTypes.documentDetailsFetched;
    constructor(public payload?: any) { }
}

export class commercialTypeDetails implements Action {
    readonly type = UtilityActionTypes.commercialTypeDetailsList;
    constructor(public payload?: any) { }
}
export class relationTypeDetails implements Action {
    readonly type = UtilityActionTypes.relationList;
    constructor(public payload?: any) { }
}

export class isCommercialDetailsFetched implements Action {
    readonly type = UtilityActionTypes.commercialDetailsFetched;
    constructor(public payload?: any) { }
}

export class userMenuLists implements Action {
    readonly type = UtilityActionTypes.userMenuLists;
    constructor(public payload?: any) { }
}

export class isUserMenuListFetched implements Action {
    readonly type = UtilityActionTypes.userMenuListsFetched;
    constructor(public payload?: any) { }
}

export type loginAction =
    | utility
    | isUtilityExecuted
    | documentTypeDetails
    | isDocumentDetailsFetched
    | commercialTypeDetails
    | isCommercialDetailsFetched
    | userMenuLists
    | isUserMenuListFetched
    | relationTypeDetails
    | medicineTypeDetails
    | householdItemCategoryAndSubcategoryDetailsList
    | restrictedDrugDetails
