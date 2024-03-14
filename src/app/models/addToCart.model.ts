export interface IAddCartRequest{
  userID:string;
  cartItemSeqNo: number;
  orderID: string;
  prescriptionID: string;
  itemType: string;
  itemCode: string;
  quantity: number;
  commercialID: string;
  scheduleIndicator: string;
  scheduleDate: string;
  scheduleTime: string;
}
