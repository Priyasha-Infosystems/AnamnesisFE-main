export class Constants {

}

export const STATIC_DATA = {
  ERR_MSG_REQUIERD_EMAIL: "Contact Number or Alternate User ID is required",
  ERR_MSG_REQUIERD_PASSWORD: "Password is required",
  ERR_MSG_REQUIERD_SECURITY_QUESTION: "Please answer to the security question",
  ERR_MSG_REQUIERD_OTP: "Please enter the OTP",
}

export const ADDRESS_ERROR_MESSAGE = {
  ERR_MSG_REQUIERD_NAME: "Name is required",
  ERR_MSG_REQUIERD_ADDRESS: "Address is required",
  ERR_MSG_REQUIERD_LANDMARK: "Landmark is required",
  ERR_MSG_REQUIERD_CONTACT: "Contact number is required",
  ERR_MSG_REQUIERD_CITY: "City is required",
  ERR_MSG_REQUIERD_STATE: "Please select the state",
  ERR_MSG_REQUIERD_PIN: "Pin is required",
  ERR_MSG_REQUIERD_TYPE: "Please select the address type",
  ERR_MSG_REQUIERD_IDENTIFIER: "Please select the address Identifier"
}

export const DIAGONOSTIC_ERROR_MESSAGE = {
  ERR_MSG_REQUIERD_LABTEST_DEPT_NAME: 'Lab test department is required',
  ERR_MSG_REQUIERD_LABTEST_CHARGES: 'Lab test charges is required',
  ERR_MSG_REQUIERD_APPROX_TESTING_TIME: 'Approx testing time is required',
  ERR_MSG_REQUIERD_SCHEDULE_DAY: 'Schedule day is required',
  ERR_MSG_REQUIERD_SCHEDULE_START_TIME: 'Required',
  ERR_MSG_REQUIERD_SCHEDULE_END_TIME: ' Required',
  ERR_MSG_MAX_LENGTH_SCHEDULE_END_TIME: 'The maximum allowed number of characters is 100 for scheduleInformatin field',
  ERR_MSG_REQUIERD_HOLIDAY_START_DATE: 'Required',
  ERR_MSG_REQUIERD_HOLIDAY_END_DATE: 'Required',
  ERR_MSG_REQUIERD_HOLIDAY_DESCRIPTION: 'Required',
  ERR_MSG_MAX_LENGTH_HOLIDAY_DESCRIPTION: ' The maximum allowed number of characters is 100 for Additional Infotmation field',
}

export const BUSYHOURS_ERROR_MSG = {
  ERR_MSG_REQUIERD_BUSYHOURS_DAY: 'Required',
  ERR_MSG_REQUIERD_BUSYHOURS_START_TIME: 'Required',
  ERR_MSG_REQUIERD_BUSYHOURS_END_TIME: 'Required',
}

export const PHYSICIAN_SCHEDULE_ERR_MSG = {
  ERR_MSG_REQUIERD_healthClinicID: 'Please slect health clinic',
  ERR_MSG_REQUIERD_consultationFee: 'Consultation Fees is required',
  ERR_MSG_REQUIERD_consultationTime: 'Consultation time is required',
  ERR_MSG_REQUIERD_weekDay: 'Required',
  ERR_MSG_REQUIERD_startTime: 'Required',
  ERR_MSG_REQUIERD_endTime: 'Required',
  // ERR_MSG_REQUIERD_healthClinicID:'Please slect health clinic',
  // ERR_MSG_REQUIERD_healthClinicID:'Please slect health clinic',
  // ERR_MSG_REQUIERD_healthClinicID:'Please slect health clinic',
}

export const MEDICINE_SELECTION_ERROR_MESSAGE = {
  ERR_MSG_REQUIERD_MEDICINE: 'Medicine is required',
  ERR_MSG__MINLENGTH_MEDICINE: 'The maximum allowed number of characters is 100 for Medicine field',
  ERR_MSG_REQUIERD_MEDICINE_COUNT: 'Medicine Count is required',
  ERR_MSG_MIN_VALUE_MEDICINE_COUNT: 'Medicine Count should be positive number',
  ERR_MSG_MAX_VALUE_MEDICINE_COUNT: 'Medicine limit is ',
}
export const HOUSE_HOLD_SELECTION_ERROR_MESSAGE = {
  ERR_MSG_REQUIERD_HOUSE_HOLD: 'House hold item is required',
  ERR_MSG__MINLENGTH_HOUSE_HOLD: 'The maximum allowed number of characters is 100 for Medicine field',
  ERR_MSG_REQUIERD_HOUSE_HOLD_COUNT: 'House hold item Count is required',
  ERR_MSG_MIN_VALUE_HOUSE_HOLD_COUNT: 'House hold item Count should be positive number',
  ERR_MSG_MAX_VALUE_HOUSE_HOLD_COUNT: 'House hold item limit is ',
}

export const MEDICINE_ENTRY_ERROR_MESSAGE = {
  ERR_MSG_REQUIERD_MEDICINENAME: 'Medicine name is required',
  ERR_MSG_MAXLENGTH_MEDICINENAME: 'The maximum allowed number of characters is 10 for medicine name',
  ERR_MSG_REQUIERD_MEDICINESHORTNAME: 'Medicine short name is required',
  ERR_MSG_REQUIERD_MEDICINE_TYPE: 'Medicine type is required',
  ERR_MSG_REQUIERD_MEDICINE_STATUS: 'Medicine status is required',
  ERR_MSG_REQUIERD_MEDICINEDESCRIPTION: 'Medicine description is required',
  ERR_MSG_REQUIERD_COMPOSITION: 'Medicine composition is required',
  ERR_MSG_REQUIERD_MANUFACTURER: 'Medicine manufacturer is required',
  ERR_MSG_REQUIERD_medicineManufacturerAddress: 'Manufacturer address is required',
  ERR_MSG_REQUIERD_PRICE: 'Medicine price is required',
  ERR_MSG_REQUIERD_USESDESCRIPTION: 'Medicine uses is required',
  ERR_MSG_REQUIERD_safetyAdviceInteraction: 'Safety advice interaction is required',
}
export const HOUSEHOLD_ITEM_ENTRY_ERROR_MESSAGE = {
  ERR_MSG_REQUIERD_HOUSEHOLDENAME: 'Household item name is required',
  ERR_MSG_REQUIERD_HOUSEHOLDESHORTNAME: 'Household item short name is required',
  ERR_MSG_REQUIERD_HOUSEHOLDDESCRIPTION: 'Household item description is required',
  ERR_MSG_REQUIERD_householdItemIntroduction: 'Household item introduction is required',
  ERR_MSG_REQUIERD_householdItemIngredients: 'Household item ingredients is required',
  ERR_MSG_REQUIERD_MANUFACTURER: 'Manufacturer is required',
  ERR_MSG_REQUIERD_MANUFACTURER_ADDRESS: 'Manufacturer address is required',
  ERR_MSG_REQUIERD_householdItemCategory: 'Household item category is required',
  ERR_MSG_REQUIERD_householdItemSubCategory: 'Household item subcategory is required',
  ERR_MSG_REQUIERD_PRICE: 'Household item price is required',
  ERR_MSG_REQUIERD_STATUS: 'Household item status is required',
}

export const ANAMNESIS_SETUP_ERROR_MESSAGE = {
  ERR_MSG_REQUIERD_USERID: 'User id is required',
  ERR_MSG_REQUIERD_name: 'please enter valid user id',
  ERR_MSG_MAX_LENGTH_USERID: ' The maximum allowed number of characters is 10 for User code field',
  ERR_MSG_MIN_LENGTH_USERID: ' The minemum allowed number of characters is 10 for User code field',
  ERR_MSG_REQUIERD_ROLE_TYPE: 'Role Type name is required',
  ERR_MSG_REQUIERD_deliveryRegion: 'Delivery region is required',
  ERR_MSG_REQUIERD_distributionZone: 'Distribution zone is required',
  ERR_MSG_REQUIERD_deliveryZone: 'Delivery zone is required',
  ERR_MSG_REQUIERD_laboratoryTestCode: 'Laboratory test code  is required',
  ERR_MSG_REQUIERD_laboratoryPackageName: 'Laboratory package name is required',
  ERR_MSG_MINLENGTH_laboratoryPackageName: 'The minemum allowed number of characters is 2 for laboratory package name field',
  ERR_MSG_REQUIERD_laboratoryTestName: 'Laboratory test name is required',
  ERR_MSG_MINLENGTH_laboratoryTestName: 'The minemum allowed number of characters is 2 for laboratory test name field',
  ERR_MSG_REQUIERD_specimenType: 'Specimen type is required',
  ERR_MSG_REQUIERD_trendChartType: 'Trend chart type is required',
  ERR_MSG_REQUIERD_normalRangeLow: 'Normal low range  is required',
  ERR_MSG_REQUIERD_normalRangeHigh: 'Normal high range is required',
  ERR_MSG_REQUIERD_banchMark: 'BanchMark is required',
  ERR_MSG_REQUIERD_resultType: 'Result type is required',
  ERR_MSG_REQUIERD_componentName: 'Labtest component name is required',
  ERR_MSG_REQUIERD_unit: 'Labtest unit is required',
  ERR_MSG_REQUIERD_departmentCode: 'Labtest department is required',
  ERR_MSG_REQUIERD_dignosticCenterName: 'Dignostic center name is required',
  ERR_MSG_MINLENGTH_dignosticCenterName: 'The minemum allowed number of characters is 2 for dignostic center name field',
  ERR_MSG_REQUIERD_location: 'Landmark is required',
  ERR_MSG_REQUIERD_adsressLine: 'Address line is required',
  ERR_MSG_REQUIERD_city: 'City is required',
  ERR_MSG_REQUIERD_stateCode: 'State is required',
  ERR_MSG_REQUIERD_pinCode: 'Pincode is required',
  ERR_MSG_REQUIERD_openingTime: 'Opening time is required',
  ERR_MSG_REQUIERD_closingTime: 'Closing time is required',
  ERR_MSG_REQUIERD_commercialType: 'Commercial type is required',
  ERR_MSG_REQUIERD_contactNo: 'Contact number is required',
  ERR_MSG_REQUIERD_emailID: 'Email id is required',

  ERR_MSG_REQUIERD_physicianAddressType: 'Address type is required',
  ERR_MSG_REQUIERD_physicianDisplayName: 'Display name is required',
  ERR_MSG_REQUIERD_physicianfirstName: 'First name is required',
  ERR_MSG_REQUIERD_physicianlastName: 'Last name is required',
  ERR_MSG_REQUIERD_physicianSpecialisation: 'Physician specialisation is required',
  ERR_MSG_REQUIERD_physicianQualification: 'Physician qualification is required',
  ERR_MSG_REQUIERD_physicianRegistrationNumber: 'Registration number is required',
  ERR_MSG_REQUIERD_physicianRegistrationAuthority: 'Registration authority is required',
  ERR_MSG_REQUIERD_physicianPrimaryContactNumber: 'Primary contact number is required',
  ERR_MSG_REQUIERD_physicianEmailID: 'Email ID is required',
  ERR_MSG_REQUIERD_physicianHealthClinicID: 'Please select a health clinic',


  ERR_MSG_REQUIERD_GST_itemCode: 'Please select a item',
  ERR_MSG_REQUIERD_GST_hsnSbaCode: 'HSN/SBA code is required',
  ERR_MSG_REQUIERD_GST_gstpercentage: 'GST percentage is required',
  ERR_MSG_REQUIERD_GST_cessRate: 'CESS rate is required',
  ERR_MSG_REQUIERD_GST_gstRateVariation: 'GST variation is required',
  ERR_MSG_REQUIERD_GST_gstRate: 'GST rate is required',

  ERR_MSG_REQUIERD_DISCOUNT_couponCode: 'Coupon code is required',
  ERR_MSG_MINLENGTH_DISCOUNT_couponCode: 'Coupon code should be 10 characters',
  ERR_MSG_MAXLENGTH_DISCOUNT_couponCode: 'Coupon code should be 10 characters',
  ERR_MSG_REQUIERD_DISCOUNT_CouponCodeDescription: 'Coupon code description is required',
  ERR_MSG_REQUIERD_DISCOUNT_couponType: 'Coupon type is required',
  ERR_MSG_REQUIERD_DISCOUNT_OrderFloorLimit: 'Order floor limit is required',
  ERR_MSG_REQUIERD_DISCOUNT_discountPercent: 'Discount percent is required',
  ERR_MSG_REQUIERD_DISCOUNT_discountFlatAmount: 'Discount flat amount is required',
  ERR_MSG_REQUIERD_DISCOUNT_maxDiscountAmount: 'Max discount amount is required',

  ERR_MSG_REQUIERD_DISCOUNT_lastProcessedID: 'Last processed ID is required',
  ERR_MSG_REQUIERD_DISCOUNT_recordCount: 'Record count is required',
  ERR_MSG_REQUIERD_DISCOUNT_authenticationKey: 'Password is required',



}

export const LABTEST_SELECTION_ERROR_MESSAGE = {
  ERR_MSG_REQUIERD_LABTEST: 'Labtest name is required',
  ERR_MSG__MINLENGTH_LABTEST: 'The maximum allowed number of characters is 100 for Labtest name field',

}
export const CASE_ASSIGNMENT_ERROR_MSG = {
  ERR_MSG_MINLENGTH_searchKey: 'The maximum allowed number of characters is 100 for search keyword field',
  ERR_MSG_REQUIERD_searchKey: 'Search keyword Key is required',
  ERR_MSG_REQUIERD_selectedUser: 'Please select an healp desk user',
}

export const USER_SETUP_ERROR_MSG = {
  ERR_MSG_REQUIERD_firstName: 'First name is required',
  ERR_MSG_Max_LENGTH_firstName: 'The maximum allowed number of characters is 100 for first name field',
  ERR_MSG_REQUIERD_lastName: 'Last name is required',
  ERR_MSG_Max_LENGTH_lastName: 'The maximum allowed number of characters is 100 for last name field',
  ERR_MSG_REQUIERD_emailID: 'Email is required',
  ERR_MSG_VALID_emailID: 'Please enter valid email',
  ERR_MSG_REQUIERD_contactNo: 'Contact number is required',
  ERR_MSG_REQUIERD_commercialID: 'Commercial ID is required',
  ERR_MSG_MIN_LENGTH_contactNo: 'The minemum allowed number of characters is 10 for contact number field',
  ERR_MSG_Max_LENGTH_contactNo: 'The maximum allowed number of characters is 10 for contact number field',
}

export const LABTEST_REPORTUPLOAD = {
  ERR_MSG_REQUIERD_DIAGNOST_CENTRE: 'Diagnostic centre is required',
  ERR_MSG_REQUIERD_PATIENT: 'Patient is required',
  ERR_MSG_REQUIERD_LABTEST_DATE: 'Labtest date is required',
  ERR_MSG_REQUIERD_LABTEST: 'Labtest is required',
  ERR_MSG_REQUIERD_LABTEST_RESULT: 'Labtest result is required',
  ERR_MSG_REQUIERD_LABTEST_PROCEDURE: 'Test procedure is required',
  ERR_MSG_REQUIERD_LABTEST_FINDINGS: 'Test findings is required',
  ERR_MSG_REQUIERD_LABTEST_IMPRESSION: 'Test impression is required',
  ERR_MSG_REQUIERD_LABTEST_COMPONENT_RESULT: 'Labtest component result is required',
  ERR_MSG_REQUIERD_LABTEST_AUTHORISED_SIGNATORY: 'Authorised signatory is required',
}

export const NEW_CASEREGISTRATION = {
  ERR_MSG_REQUIERD_workRequestType: 'Work request type centre is required',
  ERR_MSG_REQUIERD_wrCustomerID: 'Please select coustomer',
  ERR_MSG_REQUIERD_wrSummary: 'Work request summary is required',
  ERR_MSG_REQUIERD_wrDescription: 'Work request description is required',
  ERR_MSG_REQUIERD_wrResolutionNotes: 'Work request resolution notes is required',
  ERR_MSG_REQUIERD_fileType: 'File type is required',
  ERR_MSG_REQUIERD_documentNumber: 'Document number is required',
  ERR_MSG_REQUIERD_fileID: 'File is required',
}



export const GENERATE_PRESCRIPTION_ERROR_MSG = {
  // medicineForm
  ERR_MSG_REQUIERD_medicineName: 'Medicine  name is required',
  ERR_MSG_MINLENGTH_medicineName: 'The minemum allowed number of characters is 3 for Medicine  name search',
  ERR_MSG_REQUIERD_medicineCode: 'Please select medecine',
  ERR_MSG_REQUIERD_frequency: 'Frequency is required',
  ERR_MSG_REQUIERD_dose: 'Dose is required',
  ERR_MSG_REQUIERD_medicineTiming: 'Medicine  timing is required',
  ERR_MSG_REQUIERD_dayCount: 'Day is required',
  ERR_MSG_REQUIERD_MED_durationText: 'Medicine duration is missing. Please provide medicine duration',
  ERR_MSG_REQUIERD_spcialNotes: 'Spcial notes is required',
  // labtestForm
  ERR_MSG_REQUIERD_labtestCode: 'Please select Labtest',
  ERR_MSG_REQUIERD_durationText: 'Duration is required',
  //'House hold item
  ERR_MSG_REQUIERD_householdItemCode: 'House hold item is required',
  ERR_MSG_REQUIERD_comments: 'Comments is required',
  //prescriptionForm
  ERR_MSG_REQUIERD_physicianUserID: 'Please select physician',
  ERR_MSG_REQUIERD_healthClinicID: 'Please select health clinic',
  ERR_MSG_REQUIERD_patientUserCode: 'Please select patient',
  ERR_MSG_REQUIERD_visitDate: 'Please select a  visit date',
}

export const AUTHORISE_SIGNATORY_ERROR_MSG = {
  ERR_MSG_REQUIERD_rejectionReason: 'Rejection reason is required',
  ALL_DOCUMENT_STATUS_CHANGE_INDICATOR_ERR_MSG: 'This document status update remains',
  ALL_DOCUMENT_STATUS_REJECT_INDICATOR_ERR_MSG: 'This document already rejectes'
}
export const INVENTORY_MANAGEMENT = {
  ERR_MSG_REQUIERD_batchNo: 'Batch number is required',
  ERR_MSG_REQUIERD_expiryDate: 'Expiry date is required',
  ERR_MSG_pattern_expiryDate: 'Invalid format',
  ERR_MSG_REQUIERD_itemQuantity: 'Item quantity is required',
  ERR_MSG_REQUIERD_itemMRP: 'Item MRP is required',
  ERR_MSG_REQUIERD_invoiceLineComments: 'Comments is required',
  ERR_MSG_REQUIERD_hsnCode: 'HSN code is required',
  ERR_MSG_REQUIERD_gstPercentage: 'GST Percentage is required',
  ERR_MSG_REQUIERD_cessPercentage: 'CESS Percentage is required',
  ERR_MSG_REQUIERD_discountAmount: 'Discount amount is required',
  ERR_MSG_REQUIERD_taxAmount: 'Tax amount is required',
  ERR_MSG_REQUIERD_invoiceReferenceNumber: 'Invoice reference number is required',
  ERR_MSG_REQUIERD_fileID: 'Please upload invoice',
  ERR_MSG_REQUIERD_itemCode: 'Please select a item'
}

export const DELIVERY_PICKUP = {
  ERR_MSG_REQUIERD_batchNo: 'Batch number is required',
}

export const CASE_LOG_ERROR_MSG = {
  ERR_MSG_REQUIERD_comments: 'Comments is required',
}

export const ENCRDECR = {
  ENCRDECR_CODE: '123456$#@$^@1ERF'
}

export const LOCAL_STORAGE = {
  ID: 'id',
  EMAIL: 'email',
  NAME: 'name',
  USER_ID: 'userId',
  USER_CODE: 'userCode',
  ROLE_DETAILS_LIST: 'roleDetailsList',
  ALTERNATE_USER_ID: 'alternateUserID',
  CURRENT_ROLE: 'currentRole',
  ENROLMENT_STATUS: 'enrolmentStatus',
  USER_ROLE_COUNT: 'userRoleCount',
  MOBILE_NUMBER: 'mobileNumber',
  USER_TYPE: 'userType',
  TOKEN: 'token',
  LANGUAGE: 'language',
  SET_TOKEN: 'setToken',
  DEVICE_ID: 'deviceId',
  DEVICE_TOKEN: 'deviceToken',
  USER_TYPES: 'userTypes',
  PROFILE_IMAGE: 'thumbImagePath',
  ACTIVE_TAB: 'activeTab',
  ADD_EDIT_USER_INFO: 'addEditUserInfo',
  ACTIVE_TAB_BY_ROLE: 'activeTabByRole',
  SESSION_TIME: 'sessionTime',
  APP_TOKEN: 'apptoken',
  DEVICE_TYPE: 'devicetype',
  DATA_MAIN_ACTIVE_TAB: "data_main_active_tab",
  DATA_ACTIVE_TAB: "data_active_tab",
  DATA_ACTIVE_FUNCTION: "data_active_function",
  DATA_ACTIVE_EDIT_DATA: "data_active_edit_data",
  FORGOT_EMAIL: "forgot_email",
  FORGOT_TYPE: "forgot_type",
  FORGOT_OTP: "forgot_otp",
  FORGOT_UUID: "uuid"
};

export const constants = {
  NO_INTERNET_CONNECTION_MSG: 'No Internet Connection',
  INITIAL_PAGE: 1
};

export const USER_ROUTES = {
  SIGN_UP: 'auth/login',
  OTP_SIGN_UP: 'auth/verify-otp',
  RESEND_OTP: 'auth/resend-otp',
  OTP_AUTH_OPTION: 'auth/select-2fa-method',
  FORGOT_PASSWORD: 'auth/forgot-password',
  RESET_PASSWORD: 'auth/reset-password',
  CHANGE_PASSWORD: '/user/change-password',
  DEVICE_INFO: 'auth/device',
  USER_LIST: 'user/list',
  USER_PROFILE: 'user/profile',
  USER_STATUS: 'user/list/status',
  USER_CHANGE_PASS: 'user/changePassword'
};

export const stateList = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli',
  'Daman and Diu',
  'West Bengal'
];

export const REDIRECT_AFTER_ERROR_CODE = [401]

export const ERROR_CODE = [400, 500]

const BASE_URL = window.location.href === "http://localhost:4200/" ? "https://www.myhealthbook.co.in/" : window.location.href;

export const BASE_IMAGE_URL = BASE_URL + "api/Utility/FileDownload/"
export const BASE_IMAGE_URL_FOR_REQ = BASE_URL + "api/Utility/FileDownload/"
export const BASE_IMAGE_URL_FOR_TEST = BASE_URL + "api/File/download/"
export const BASE_IMAGE_URL_FOR_CampaignPhotosDownlod = BASE_URL + "api/Utility/CampaignPhotosDownload/"

export const IF_LOGIN_ALLOW = true;
export const COMMING_SOON_DATE = '2024-03-31T00:00:00.000Z';
export const PROD = false;