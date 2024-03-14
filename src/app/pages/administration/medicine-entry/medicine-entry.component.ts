import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BASE_IMAGE_URL, MEDICINE_ENTRY_ERROR_MESSAGE } from '@constant/constants';
import { Store, select } from '@ngrx/store';
import { CommonService } from '@services/common.service';
import { FileUploadService } from '@services/fileUpload.service';
import { FormService } from '@services/form.service';
import { MedicineDetailsService } from '@services/medicine-details.service';
import { MedicineEntryService } from '@services/medicine-entry.service';
import { MedicineSelectionService } from '@services/medicine-selection.service';
import { UtilityService } from '@services/utility.service';
import { ToastrService } from 'ngx-toastr';
import { medicineTypeDetails } from 'src/store/actions/utility.actions';
import * as xml2js from 'xml2js';
@Component({
  selector: 'app-medicine-entry',
  templateUrl: './medicine-entry.component.html',
  styleUrls: ['./medicine-entry.component.css']
})
export class MedicineEntryComponent implements OnInit {
  requestKeyDetails: any;
  imageBaseUrl: string = BASE_IMAGE_URL;
  medicineEntryForm: FormGroup;
  docUploadError: string = "";
  myFiles: any = [];
  fileError: string = "";
  medicineList:Array<any> = [];
  medicinetypeList:Array<any> = [];
  isSearch:boolean = false;
  public errorMessage: any = {};
  restrictedDrugsList:any =[];
  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    private utilityService: UtilityService,
    private commonService: CommonService,
    private medicineEntryService: MedicineEntryService,
    private fileUploadService: FileUploadService,
    private medicineSelectionService: MedicineSelectionService,
    private medicineDetailsService: MedicineDetailsService,
    private store: Store<any>,
  ) {
    this.intializingMedicineSeectionFormGroup()
    
  }

  async ngOnInit() {
    await this.commonService.getRestrictedDrugsList().then((res:any)=>{
      this.restrictedDrugsList = res;
    })
    await this.store.pipe(select('commonUtility')).subscribe(async val => {
      if(val?.medicineTypeDetailsList){
        this.medicinetypeList = val?.medicineTypeDetailsList
      }
    })
    await this.getMedicineTypeList()
    window.scrollTo(0, 0);
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
    })
    this.commonService.getUtilityService();
    this.intializingMessage();
    /**@todo add 10 sideEffects */
    for (let index = 0; index < 10; index++) {
      this.sideEffectList().push(this.addSeideEffects());
    }
    this.medicineEntryForm.get('medicineName')?.valueChanges.subscribe(res=>{
      this.medicineList = [];
    })
  }

  async getMedicineTypeList(){
    if(!this.medicinetypeList?.length){
      await this.medicineSelectionService.getMedicineTypeList()
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.medicinetypeList = res.apiResponse;
          this.store.dispatch(new medicineTypeDetails(res.apiResponse));
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Medicine List couldn't fetch due some error");
        }
      })
    }
  }

  medicineListFetch = async (searchString:string)=>{
    const reqData: any = {
      apiRequest: { medicineKeyword: searchString ,indicator: 'E' }
    }
    if(!this.isSearch && searchString.length){
      await this.medicineSelectionService.getMedicineList(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.medicineList = [...res.apiResponse.medicineSearchList];
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Medicine List couldn't fetch due some error");
        }
      })
    }
  }

  optionSelected= async(data:any)=>{
    const reqData: any = {
      apiRequest: {
        medicineCode: data.medicineCode,
        indicator:''
      }
    }
    await this.medicineDetailsService.getMedicineDetails(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          const medicineDetails = {
            ...res.apiResponse
          }
          medicineDetails.sideEffects = medicineDetails.sideEffects?this.sideEffectsParseXml(medicineDetails.sideEffects):[]
          this.medicineList = [];
          const tempMedicineDetails:any = {
            referenceNumber: medicineDetails.referenceNumber,
            medicineCode: medicineDetails.medicineCode,
            medicineName: medicineDetails.medicineName,
            medicineShortName: medicineDetails.medicineShortName,
            medicineType: medicineDetails.medicineType,
            medicineStatus: medicineDetails.medicineStatus,
            medicineDescription: medicineDetails.medicineDescription,
            medicineQuantityLimit: medicineDetails.medicineQuantityLimit,
            composition: medicineDetails.medicineComposition,
            medicineManufacturer: medicineDetails.medicineManufacturer,
            medicineManufacturerAddress: medicineDetails.medicineManufacturerAddress,
            price: medicineDetails.medicinePrice,
            prescriptionRequired: medicineDetails.medicinePrescription ==='Y'?true:false,
            StoreTemperatureRequird: medicineDetails.medicineRefrigerator,
            medicineCategory: medicineDetails.medicineCategory ==='G'?true:false,
            usesDescription: medicineDetails.medicineUsage,
            restrictedDrugsCategory:medicineDetails.restrictedDrugsCategory,
            sideEffectList: [],
            safetyMeasures: {
              Alcohol: {
                safetyAdviceDetails:'',
                safetyAdviceInteraction:'',
                actionIndicator:'ADD'
              },
              Pregnancy:{
                safetyAdviceDetails:'',
                safetyAdviceInteraction:'',
                actionIndicator:'ADD'
              },
              Kidney:{
                safetyAdviceDetails:'',
                safetyAdviceInteraction:'',
                actionIndicator:'ADD'
              },
              Driving:{
                safetyAdviceDetails:'',
                safetyAdviceInteraction:'',
                actionIndicator:'ADD'
              },
              Breastfeeding:{
                safetyAdviceDetails:'',
                safetyAdviceInteraction:'',
                actionIndicator:'ADD'
              },
              Liver:{
                safetyAdviceDetails:'',
                safetyAdviceInteraction:'',
                actionIndicator:'ADD'
              },
            },
            isAdd:false
          }
          medicineDetails.safetyAdviceInformationList?.forEach((val:any)=>{
            if(val.safetyAdviceCategory === 'Breast feeding'){
              const adviceInformation ={
                safetyAdviceDetails:val.safetyAdviceDetails,
                safetyAdviceInteraction:val.safetyAdviceInteraction,
                actionIndicator:val.actionIndicator?val.actionIndicator:''
              }
              tempMedicineDetails.safetyMeasures['Breastfeeding'] = adviceInformation;
            }else{
              const adviceInformation ={
                safetyAdviceDetails:val.safetyAdviceDetails,
                safetyAdviceInteraction:val.safetyAdviceInteraction,
                actionIndicator:val.actionIndicator?val.actionIndicator:''
              }
              tempMedicineDetails.safetyMeasures[val.safetyAdviceCategory] = adviceInformation;
            }
            
          })
          medicineDetails.sideEffects?.forEach((val:any)=>{
            const tempSideEffect:any ={
              sideEffect:val
            }
            tempMedicineDetails.sideEffectList.push(tempSideEffect);
          })
          this.medicineEntryForm.patchValue(tempMedicineDetails);
          this.medicineEntryForm.get('medicineName')?.disable();
          medicineDetails.medicineFileDetailsList.forEach((val:any)=>{
            const tempFile ={
              progress: 100,
              response: [
                  val
              ],
              error:false,
              isAdd:false,
              isDelete:false
            }
            this.myFiles.push(tempFile);
            this.isSearch = true;
          })
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Medicine Details couldn't fetch due some error");
        }
      })
  }

  medicineFormReset(){
    this.medicineEntryForm.reset();
    this.medicineEntryForm.get('StoreTemperatureRequird')?.setValue('N');
    this.medicineEntryForm.get('isAdd')?.setValue(true);
    this.medicineEntryForm.get('isChange')?.setValue(false);
     var controlArray = this.medicineEntryForm.get('sideEffectList') as FormArray;
     controlArray.clear();
    for (let index = 0; index < 10; index++) {
      this.sideEffectList().push(this.addSeideEffects());
    }
    this.myFiles = [];
    this.medicineEntryForm.get('medicineName')?.enable();
    this.isSearch = false;
  }

  addSeideEffects() {
    return this.fb.group({
      sideEffect: ['']
    })
  }

  changeMedicine(){
    if(!this.medicineEntryForm.get('isAdd')?.value){
      this.medicineEntryForm.get('isChange')?.setValue(true)
    }
  }

  changeSideEffect(key:any){
    this.changeMedicine();
    if(this.medicineEntryForm.get('safetyMeasures')?.get(key)?.get('safetyAdviceDetails')?.value 
    || this.medicineEntryForm.get('safetyMeasures')?.get(key)?.get('safetyAdviceInteraction')?.value){
      if(this.medicineEntryForm.get('safetyMeasures')?.get(key)?.get('safetyAdviceDetails')?.value){
        this.medicineEntryForm.get('safetyMeasures')?.get(key)?.get('safetyAdviceInteraction')?.addValidators([Validators.required]);
        this.medicineEntryForm.get('safetyMeasures')?.get(key)?.get('safetyAdviceInteraction')?.updateValueAndValidity()
      }else{
        this.medicineEntryForm.get('safetyMeasures')?.get(key)?.get('safetyAdviceInteraction')?.setValue('')
        this.medicineEntryForm.get('safetyMeasures')?.get(key)?.get('safetyAdviceInteraction')?.clearValidators();
        this.medicineEntryForm.get('safetyMeasures')?.get(key)?.get('safetyAdviceInteraction')?.updateValueAndValidity()
      }
      if(this.medicineEntryForm.get('isAdd')?.value){
        this.medicineEntryForm.get('safetyMeasures')?.get(key)?.get('actionIndicator')?.setValue('ADD')
      }else{
        if(this.medicineEntryForm.get('isChange')?.value){
          if(this.medicineEntryForm.get('safetyMeasures')?.get(key)?.get('actionIndicator')?.value === ''){
            this.medicineEntryForm.get('safetyMeasures')?.get(key)?.get('actionIndicator')?.setValue('UPD')
          } 
        }
      }
    }else{
      this.medicineEntryForm.get('safetyMeasures')?.get(key)?.get('safetyAdviceInteraction')?.clearValidators();
      this.medicineEntryForm.get('safetyMeasures')?.get(key)?.get('safetyAdviceInteraction')?.updateValueAndValidity()
      if(this.medicineEntryForm.get('isAdd')?.value){
        this.medicineEntryForm.get('safetyMeasures')?.get(key)?.get('actionIndicator')?.setValue('')
      }else{
        if(this.medicineEntryForm.get('isChange')?.value){
          this.medicineEntryForm.get('safetyMeasures')?.get(key)?.get('actionIndicator')?.setValue('DEL')
        }
      }
    }
  }

  getSafetyAdviceInteractioncontroll(key:any){
    let controll = this.medicineEntryForm.get('safetyMeasures')?.get(key)?.get('safetyAdviceInteraction') as FormControl;
    return controll;
  }

  sideEffectList() {
    return this.medicineEntryForm.get('sideEffectList') as FormArray
  }

  save(data: any, isValid: boolean) {
    this.formService.markFormGroupTouched(this.medicineEntryForm);
    if (isValid) {
      const deletedFileList = this.myFiles.filter((res:any)=>res.isDelete === true)
      if(deletedFileList.length){
        const reqData: any = {
          apiRequest: []
        }
        deletedFileList.forEach((file:any)=>{
          reqData.apiRequest.push(file.response[0])
        })
      this.fileUploadService.multyFileDelete(reqData,'MDDE')
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.finalSaveMedicine(data)
        } else {
          this.toastr.error('Something went wrong, Please try after sometime, Please try again');
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Medicine couldn't add due some error");
        }
      })
      }else{
        this.finalSaveMedicine(data)
      }
    } 
  }

  finalSaveMedicine(data:any){
    const reqData: any = {
      apiRequest: {
        referenceNumber: data.referenceNumber?data.referenceNumber:'N/A',
        medicineCode: data.medicineCode,
        medicineName: data.medicineName,
        medicineShortName: data.medicineShortName,
        medicineType: data.medicineType,
        medicineStatus: data.medicineStatus,
        medicineComposition: data.composition,
        medicineManufacturer: data.medicineManufacturer,
        medicineManufacturerAddress: data.medicineManufacturerAddress,
        medicineDescription: data.medicineDescription,
        medicineUsage: data.usesDescription,
        medicineQuantityLimit: data.medicineQuantityLimit,
        medicinePrice: data.price,
        medicinePrescription: (data.prescriptionRequired as boolean) ? 'Y' : 'N',
        medicineRefrigerator:data.StoreTemperatureRequird,
        medicineCategory: (data.medicineCategory as boolean) ? 'G' : 'B',
        restrictedDrugsCategory:data.restrictedDrugsCategory,
        sideEffects: [],
        safetyAdviceInformationList: [],
        fileCount: 0,
        fileDetailsList: [],
        actionIndicator:data.isAdd?'ADD':data.isChange?'UPD':''
      }
    }
    data.sideEffectList.forEach((sideEffect: any, index: number) => {
      if (sideEffect.sideEffect.length) {
        reqData.apiRequest.sideEffects.push(sideEffect.sideEffect);
      }
    })
    for (let key in data.safetyMeasures) {
      if (data.safetyMeasures[key]) {
        const tempSafetyMeasure = {
          safetyAdviceCategory: key,
          safetyAdviceDetails: data.safetyMeasures[key].safetyAdviceDetails,
          safetyAdviceInteraction: data.safetyMeasures[key].safetyAdviceInteraction,
          actionIndicator: '',
        }
        if(data.safetyMeasures[key].safetyAdviceDetails &&  data.safetyMeasures[key].safetyAdviceInteraction || data.safetyMeasures[key].actionIndicator ==='DEL'){
          tempSafetyMeasure.actionIndicator = data.safetyMeasures[key].actionIndicator
        }
        reqData.apiRequest.safetyAdviceInformationList.push(tempSafetyMeasure);
      }
    }
    this.myFiles.forEach((pictures: any, index: number) => {
      if(pictures.error === false){
        const tempPicture: any = {
          contentType: pictures.response[0].contentType,
          documentNumber: pictures.response[0].documentNumber,
          fileID: pictures.response[0].fileID,
          fileName: pictures.response[0].fileName,
          fileSeqNo: index + 1,
          fileType: pictures.response[0].fileType,
          actionIndicator: pictures.isAdd?'ADD':pictures.isDelete?'DEL':'',
        }
        reqData.apiRequest.fileCount = reqData.apiRequest.fileCount+1
        reqData.apiRequest.fileDetailsList.push(tempPicture);
      }
    })
    // console.log(reqData.apiRequest)
    this.medicineEntryService.saveMedicineDetails(reqData)
      .then(async (res: any) => {
        if (!this.commonService.isApiError(res)) {
          this.toastr.success('Medicine saved')
          if(!data.isAdd){
            this.medicineFormReset()
          }else{
            this.medicineEntryForm.get('medicineCode')?.setValue(res.apiResponse.medicineCode)
            this.medicineEntryForm.get('medicineName')?.disable()
          }
        } else {
          this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
        }
      })
      .catch((err: any) => {
        if(err.status !== 401){
        this.toastr.error("Medicine couldn't add due some error");
        }
      })
  }

  async uploadDoc(data: any) {
    let progress: number = 0;
    const index = this.myFiles.indexOf(data);
    const formData = new FormData();
    formData.append('File', data);
    (await
      this.fileUploadService.uploadDocMEDorHHI(
        formData, 'MED', this.medicineEntryForm.get('medicineCode')?.getRawValue()
      )).subscribe((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            progress = Math.round(event.loaded / event.total! * 100);
            this.myFiles[index].progress = progress;
            break;
          case HttpEventType.Response:
            if (!this.fileUploadService.isDocUploadApiError(event.body)) {
              const responseFiles = { ...event.body.apiResponse }
              this.myFiles[index].response.push(responseFiles);
              this.myFiles[index].error=false;
              this.myFiles[index].isAdd = false;
              this.myFiles[index].isDelete = false;
            } else {
              this.myFiles[index].error = true;
            }
            setTimeout(() => {
              // progress = 0;
            }, 1500);
        }
      },
        (error) => {
          this.myFiles[index].error = true;
          this.toastr.error(error ? error : '');
        })
  }

  async onPfFileChange(event: any) {
    let extensionAllowed: any = { "png": true, "jpeg": true, "pdf": true, "jpg": true ,"tif" : true , "tiff": true};
    if (event.target.files[0].size / 1024 / 1024 > 2) {
      this.fileError = "File is too large. Allowed maximum size is 2 MB"
      event.target.value = '';
      return;
    }
    if (extensionAllowed) {
      var nam = event.target.files[0].name.split('.').pop();
      if (!extensionAllowed[nam]) {
        this.fileError = "Please upload " + Object.keys(extensionAllowed) + " file."
        event.target.value = '';
        return;
      }
    }
    const target = event.target.files[0];
    target.progress = 0;
    target.response = [];
    this.myFiles.push(target);
    this.medicineEntryForm.controls["file"].setValue(this.myFiles);
    await this.uploadDoc(event.target.files[0])
    event.target.value = '';
  }

   async removeFile(index: number){
    if(this.myFiles[index].error === false){
        const reqData: any = {
          apiRequest: {
            fileSeqNo:this.myFiles[index].response[0].fileSeqNo,
            fileID:this.myFiles[index].response[0].fileID,
            fileType:this.myFiles[index].response[0].fileType,
            documentNumber:this.myFiles[index].response[0].documentNumber?this.myFiles[index].response[0].documentNumber:'',
            fileName:this.myFiles[index].response[0].fileName,
            contentType:this.myFiles[index].response[0].contentType,
            documentStatus:this.myFiles[index].response[0].documentStatus,
          }
        }
        await this.fileUploadService.singleFileDeleteMED(reqData,'MDDE')
            .then(async (res: any) => {
              if (!this.commonService.isApiError(res)) {
                this.myFiles.splice(index, 1);
              } else {
                this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
              }
            })
            .catch((err: any) => {
              if(err.status !== 401){
              this.toastr.error("File couldn't delete due some error");
              }
            })
    }else{
      this.myFiles.splice(index, 1);
    }
  }

  private intializingMedicineSeectionFormGroup() {
    this.medicineEntryForm = this.fb.group({
      referenceNumber: [''],
      medicineCode: [''],
      medicineName: ['', [Validators.required,Validators.maxLength(50)]],
      medicineShortName: ['', [Validators.required]],
      medicineType: ['', [Validators.required]],
      medicineStatus: ['', [Validators.required]],
      medicineDescription: ['', [Validators.required]],
      medicineQuantityLimit: [null,],
      composition: ['', [Validators.required]],
      medicineManufacturer: ['', [Validators.required]],
      medicineManufacturerAddress: ['', [Validators.required]],
      price: [null, [Validators.required]],
      prescriptionRequired: [false],
      StoreTemperatureRequird: ['N'],
      medicineCategory: [false],
      usesDescription: [''],
      restrictedDrugsCategory:[''],
      sideEffectList: this.fb.array([]),
      safetyMeasures:this.fb.group({
        Alcohol: this.fb.group({
          safetyAdviceDetails:[''],
          safetyAdviceInteraction:[''],
          actionIndicator:['']
        }),
        Pregnancy:this.fb.group({
          safetyAdviceDetails:[''],
          safetyAdviceInteraction:[''],
          actionIndicator:['']
        }),
        Kidney:this.fb.group({
          safetyAdviceDetails:[''],
          safetyAdviceInteraction:[''],
          actionIndicator:['']
        }),
        Driving:this.fb.group({
          safetyAdviceDetails:[''],
          safetyAdviceInteraction:[''],
          actionIndicator:['']
        }),
        Breastfeeding:this.fb.group({
          safetyAdviceDetails:[''],
          safetyAdviceInteraction:[''],
          actionIndicator:['']
        }),
        Liver:this.fb.group({
          safetyAdviceDetails:[''],
          safetyAdviceInteraction:[''],
          actionIndicator:['']
        }),
      }),
      file: [''],
      isAdd:[true],
      isChange:[false]
    })
  }
  private intializingMessage() {
    this.errorMessage.medicineName = {
      required: MEDICINE_ENTRY_ERROR_MESSAGE.ERR_MSG_REQUIERD_MEDICINENAME,
      maxLength:MEDICINE_ENTRY_ERROR_MESSAGE.ERR_MSG_MAXLENGTH_MEDICINENAME
    };
    this.errorMessage.medicineShortName = {
      required: MEDICINE_ENTRY_ERROR_MESSAGE.ERR_MSG_REQUIERD_MEDICINESHORTNAME,
    };
    this.errorMessage.medicineType = {
      required: MEDICINE_ENTRY_ERROR_MESSAGE.ERR_MSG_REQUIERD_MEDICINE_TYPE,
    };
    this.errorMessage.medicineStatus = {
      required: MEDICINE_ENTRY_ERROR_MESSAGE.ERR_MSG_REQUIERD_MEDICINE_STATUS,
    };
    this.errorMessage.medicineDescription = {
      required: MEDICINE_ENTRY_ERROR_MESSAGE.ERR_MSG_REQUIERD_MEDICINEDESCRIPTION,
    };
    this.errorMessage.composition = {
      required: MEDICINE_ENTRY_ERROR_MESSAGE.ERR_MSG_REQUIERD_COMPOSITION,
    };
    this.errorMessage.medicineManufacturer = {
      required: MEDICINE_ENTRY_ERROR_MESSAGE.ERR_MSG_REQUIERD_MANUFACTURER,
    };
    this.errorMessage.medicineManufacturerAddress = {
      required: MEDICINE_ENTRY_ERROR_MESSAGE.ERR_MSG_REQUIERD_medicineManufacturerAddress,
    };
    this.errorMessage.price = {
      required: MEDICINE_ENTRY_ERROR_MESSAGE.ERR_MSG_REQUIERD_PRICE,
    };
    this.errorMessage.usesDescription = {
      required: MEDICINE_ENTRY_ERROR_MESSAGE.ERR_MSG_REQUIERD_USESDESCRIPTION,
    };
    this.errorMessage.safetyAdviceInteraction = {
      required: MEDICINE_ENTRY_ERROR_MESSAGE.ERR_MSG_REQUIERD_safetyAdviceInteraction,
    };
  }

  private safetyMeasuresParseXml(xmlStr: any) {
    const safetyMeasures: Array<any> = []
    const parser = new xml2js.Parser(
      {
        trim: true,
        explicitArray: true
      });
    parser.parseString(xmlStr, function (err,result) {
      if(result.SAFETYMEASURES !==''){
        result.SAFETYMEASURES.EVENTDETAILS.forEach((val: any, index: number) => {
          const tempSafetyMeasure = {
            details: val.DETAILS[0],
            event: val.EVENT[0],
            icon: `img/icon/${val.EVENT[0]}.png`
          }
          safetyMeasures.push(tempSafetyMeasure)
        })
      }
    })
    return safetyMeasures
  }

  sideEffectsParseXml(xmlStr: any) {
    const sideEffects: Array<any> = []
    const parser = new xml2js.Parser(
      {
        trim: true,
        explicitArray: true
      });
    parser.parseString(xmlStr, function (err, result) {
      if(result.SIDEEFFECTS !== ''){
        result.SIDEEFFECTS.EFFECTS.forEach((val: any, index: number) => {
          sideEffects.push(val)
        })
      }
    })
    return sideEffects
  }
}
