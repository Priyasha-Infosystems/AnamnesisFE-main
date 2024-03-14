export interface ISelectedMedicine{
  medicineCode:string;
  medicineName: string;
  composition: string;
  count: number;
  medicineQuantityLimit?:number;
  errorMsg?: string;
}

export interface IMedicine{
  medicineCode: string;
  medicineName: string;
  medicineComposition: string;
  medicineDescription: string;
  medicineUnitPrice: string;
  medicineQuantity: string;
  medicineTotalPrice: string;
  medicineQuantityLimit: number;
  medicinePrescription: string;
}
