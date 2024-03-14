import { HttpEvent, HttpEventType } from '@angular/common/http';
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@services/common.service';
import { FileUploadService } from '@services/fileUpload.service';
import { FormService } from '@services/form.service';
import { SupplierRequisitionService } from '@services/supplier-requisition.service';
import { ToastrService } from 'ngx-toastr';
import SignaturePad from 'signature_pad';
import { Buffer } from 'buffer';
@Component({
  selector: 'app-supplier-requisition-confirmation',
  templateUrl: './supplier-requisition-confirmation.component.html',
  styleUrls: ['./supplier-requisition-confirmation.component.css']
})
export class SupplierRequisitionConfirmationComponent implements OnInit, AfterViewInit {

  @Output()
  close: EventEmitter<{}> = new EventEmitter<{}>();
  @Input()
  supplierRequestData: any;
  documentForm: FormGroup;
  title = 'Signature Pad by Baidurja Khunte';
  signPad: any;
  @ViewChild('signPadCanvas', { static: false }) signaturePadElement: any;
  signImage: any;
  confirmationCheck:boolean = false;
  confirmationErrMsg:string = '';

  constructor(
    private fb: FormBuilder,
    private formService: FormService,
    private toastr: ToastrService,
    private commonService: CommonService,
    private fileUploadService: FileUploadService,
    public supplierRequisitionService: SupplierRequisitionService,
  ) {
    this.documentForm = this.fb.group({
      fileType: ['SIG'],
      documentNumber: [''],
      fileSource: [{ value: '', disabled: false }],
      document: [''],
      dataSet: [false],
      toSave: [false],
      fileName: [''],
      fileID: ['', Validators.required],
      progress: [''],
      response: [''],
      error: [''],
      fileError: [''],
    })
  }

  chengeConfirmationCheck(){
    this.confirmationCheck = !this.confirmationCheck;
  }

  ngAfterViewInit() {
    this.signPad = new SignaturePad(this.signaturePadElement.nativeElement);
  }

  ngOnInit(): void {
  }

  startSignPadDrawing(event: Event) {

  }
  /*It's work in devices*/
  movedFinger(event: Event) {
  }

  /*Clean whole the signature*/
  clearSignPad() {
    this.signPad.clear();
  }

  /*Undo last step from the signature*/
  undoSign() {
    const data = this.signPad.toData();
    if (data) {
      data.pop(); // remove the last step
      this.signPad.fromData(data);
    }
  }
  /*Here you can save the signature as a Image*/
  async saveSignPad() {
    if (this.signPad.toData().length) {
      const base64ImageData = this.signPad.toDataURL();
      this.signImage = base64ImageData;
      await this.uploadDoc(this.signImage, this.documentForm)
    }
    //Here you can save your signature image using your API call.
  }


  async save() {
    if(this.confirmationCheck){
      const reqData: any = {
        apiRequest: {
          requisitionNumber: this.supplierRequestData.requisitionNumber,
          itemCount: this.supplierRequestData.itemList.length,
          signatureFileID: "SXM202302WB0001-MED-00142",
          updateDeliveryQuantityRequestList: []
        }
      }
      this.supplierRequestData.itemList.forEach((value: any) => {
        const tempItem = {
          itemCode: value.itemCode,
          updateQuantity: value.updatedQuantity ? +value.updatedQuantity : value.quantity
        }
        reqData.apiRequest.updateDeliveryQuantityRequestList.push(tempItem)
      })
      await this.supplierRequisitionService.SaveSupplierRequisitionDetails(reqData, 'SPRQ')
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.close.emit(true)
            this.toastr.success('Requisition Saved')
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error("Requisition couldn't update due some error");
          }
        })
    }else{
      this.confirmationErrMsg = 'Please check this checkbox';
      setTimeout(() => {
        this.confirmationErrMsg = '';
      }, 1500);
    }
  }

  totalItem() {
    let totalQuantity = 0
    this.supplierRequestData.itemList?.forEach((res: any) => {
      if (res.updatedQuantity) {
        totalQuantity = totalQuantity + (+res.updatedQuantity)
      } else {
        totalQuantity = totalQuantity + (+res.quantity)
      }
    })
    return totalQuantity;
  }

  closePopup() {
    this.close.emit(false)
  }

  convertToBlob(base64Link: any) {
    const base64Data = base64Link.replace(/^data:image\/(.*);base64,/, '')
    const byteString = window.atob(base64Data);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/png' });
    // const imageFile = new File([blob], 'Signature.png', { type: 'image/png' });
    return blob
  }

  async uploadDoc(data: any, control: any) {
    const image = this.convertToBlob(data)
    const formData = new FormData();
    // formData.append('File', image);
    formData.append('file', image, 'uploaded_file.png');
    (await
      this.fileUploadService.uploadDoc(
        formData, control.value.fileType, control.value.documentNumber
      )).subscribe((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.Response:
            if (!this.fileUploadService.isDocUploadApiError(event.body)) {
              const responseFiles = { ...event.body.apiResponse }
              control.get('response').setValue(responseFiles);
              control.get('fileName').setValue(responseFiles.fileName);
              control.get('fileID').setValue(responseFiles.fileID);
              control.get('toSave').setValue(true);
              control.get('dataSet').setValue(true);
              control.get('error').setValue(false);
            } else {
              control.controls.error.setValue(true);
              control.controls.fileName.setValue('Signature');
            }
            setTimeout(() => {
              // progress = 0;
            }, 1500);
        }
      },
        (error) => {
          this.toastr.error(error ? error : '');
        })
  }

  DataURIToBlob(dataURI: string) {
    const splitDataURI = dataURI.split(',')
    const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1])
    const mimeString = splitDataURI[0].split(':')[1].split(';')[0]
    const ia = new Uint8Array(byteString.length)
    for (let i = 0; i < byteString.length; i++)
      ia[i] = byteString.charCodeAt(i)
    return new Blob([ia], { type: mimeString })
  }

  async onFileUpload(event: any) {
    const control: any = this.documentForm;
    control.controls.fileError.setValue("")
    let extensionAllowed: any = { "png": true, "jpeg": true, "pdf": true, "jpg": true };
    if (event.target.files[0].size / 1024 / 1024 > 2) {
      control.controls.fileError.setValue("File is too large. Allowed maximum size is 2 MB");
      // this.fileError = "File is too large. Allowed maximum size is 2 MB"
      event.target.value = '';
      return;
    }
    if (extensionAllowed) {
      var nam = event.target.files[0].name.split('.').pop();
      if (!extensionAllowed[nam]) {
        control.controls.fileError.setValue("Please upload " + Object.keys(extensionAllowed) + " file.")
        event.target.value = '';
        return;
      }
    }
    const target = event.target.files[0];
    target.progress = 0;
    target.response = [];
    control.controls.document.setValue(target);
    await this.uploadDoc(event.target.files[0], control)
    event.target.value = '';
  }

}
