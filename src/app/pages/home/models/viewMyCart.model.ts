export interface IAddressDetails{
  addressID: string;
  addressIdentifier: string;
  addressType: string;
  displayName: string;
  addressLine: string;
  landmark: string;
  city: string;
  pincode: string;
  country: string,
  contactNumber: string;
  state: string;
  default: Boolean
}

export interface IPricingDetails{
  totalItemCount: number;
  totalMRP: number;
  totalSavings: number;
  discountCode1: string;
  discountDescription1: string;
  discountPercent1: number;
  discountAmount1: number;
  discountCode2: string;
  discountDescription2: string;
  discountPercent2: number;
  discountAmount2: number;
  discountCode3: string;
  discountDescription3: string;
  discountAmount3: number;
  discountPercent3: number;
  chargeCode1: string;
  chargeCodeDescription1: string;
  chargeCodeAmount1: number;
  chargeCode2: string;
  chargeCodeDescription2: string;
  chargeCodeAmount2: number;
  couponCode: string;
  taxTotalGSTDescription: string;
  taxTotalGSTPercent: number;
  taxTotalGSTAmount: number;
  taxCGSTDescription: string;
  taxCGSTPercent: number;
  taxCGSTAmount: number;
  taxSGSTDescription: string;
  taxSGSTPercent: number;
  taxSGSTAmount: number;
  taxIGSTDescription: string;
  taxIGSTPercent: number;
  taxIGSTAmount: number;
  taxOtherDescription: string;
  taxOtherPercent: number;
  taxOtherAmount: number;
}
