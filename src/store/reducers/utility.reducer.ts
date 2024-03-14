import { ActionParent } from '../actions';
import { UtilityActionTypes } from '../actions/utility.actions';

export interface utilityState {
    utility: []
    executedUtility: boolean,
    documentTypeDetailsList: [],
    medicineTypeDetailsList: [],
    restrictedDrugDetailsList:[],
    houseHoldItemCategoryAndSubCategoryList: [],
    documentDetailsFetched: boolean,
    commercialDetailsList: [],
    commercialDetailsFetched: boolean
    userMenuLists: [],
    userMenuListsFetched: boolean,
    relationList:[]
}

export const initialState: utilityState = {
    utility: [],
    executedUtility: false,
    documentTypeDetailsList: [],
    medicineTypeDetailsList: [],
    restrictedDrugDetailsList:[],
    houseHoldItemCategoryAndSubCategoryList: [],
    documentDetailsFetched: false,
    commercialDetailsList: [],
    commercialDetailsFetched: false,
    userMenuLists: [],
    userMenuListsFetched: false,
    relationList:[]
};

export function UtilityReducer(state = initialState, action: ActionParent) {
    switch (action.type) {
        case UtilityActionTypes.utility:
            return {
                ...state,
                utility: action.payload
            };
        case UtilityActionTypes.executedUtility:
            return {
                ...state,
                executedUtility: action.payload
            };
        case UtilityActionTypes.documentTypeDetailsList:
            return {
                ...state,
                documentTypeDetailsList: action.payload
            };
        case UtilityActionTypes.medicineTypeList:
            return {
                ...state,
                medicineTypeDetailsList: action.payload
            };
        case UtilityActionTypes.restrictedDrugList:
            return {
                ...state,
                restrictedDrugDetailsList: action.payload
            };
        case UtilityActionTypes.householdItemCategoryAndSubcategoryDetailsList:
            return {
                ...state,
                houseHoldItemCategoryAndSubCategoryList: action.payload
            };
        case UtilityActionTypes.documentDetailsFetched:
            return {
                ...state,
                documentDetailsFetched: action.payload
            };
        case UtilityActionTypes.commercialTypeDetailsList:
            return {
                ...state,
                commercialDetailsList: action.payload
            };
        case UtilityActionTypes.commercialDetailsFetched:
            return {
                ...state,
                commercialDetailsFetched: action.payload
            };
        case UtilityActionTypes.userMenuLists:
            return {
                ...state,
                userMenuLists: action.payload
            };
        case UtilityActionTypes.userMenuListsFetched:
            return {
                ...state,
                userMenuListsFetched: action.payload
            };
        case UtilityActionTypes.relationList:
            return {
                ...state,
                relationList: action.payload
            };
        default:
            return state;
    }
}