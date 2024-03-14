
export interface I{
  medicineName?: string;
  manufcturedBy?: string;
  composition?: string;
  medicineCount?: string;
  prescriptionRequerd?: boolean;
  lowTemperature?: boolean;
  medicineDescriptionHeader?: string;
  medicineDescriptionDetails?: string;
  usesDetails?: string;
  sideEffects?: Array<string>;
  medicineimageNameList?: Array<string>;
}

export interface IMadicineDetails{
  medicineCode?: string,
  medicineComposition?: string,
  medicineDescription?: string,
  medicineManufacturer?: string,
  medicineName?: string,
  medicinePrescription?: string,
  medicinePrice?: number,
  medicineQuantityLimit?: number,
  medicineRefrigerator?: string,
  medicineShortName?: string,
  medicineUsage?: string,
  safetyMeasures?: string,
  sideEffects?: string,
  medicineFileIDList?:Array<string>
}
