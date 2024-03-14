export interface IHealthEquipment{
  hcEquipmentCode: string;
  hcEquipmentName: string;
  hcEquipmentDescription: string;
  hcEquipmentUnitPrice: string;
  hcEquipmentQuantity: string;
  hcEquipmentTotalPrice: string;
}

export interface ISelectedHealthEquipment{
  cartItemCode?: string;
  hcEquipmentSeqNo?: number;
  hcEquipmentCode: string;
  hcEquipmentName: string;
  hcEquipmentDescription: string;
  hcEquipmentUnitPrice?: string;
  hcEquipmentQuantity: number;
  hcEquipmentTotalPrice?: string;
  errorMsg?: string;
}
