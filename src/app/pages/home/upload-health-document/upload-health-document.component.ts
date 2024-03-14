import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@services/common.service';
import { FileUploadService } from '@services/fileUpload.service';
import { UploadDocumentService } from '@services/uploadDocument.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-upload-health-document',
  templateUrl: './upload-health-document.component.html',
  styleUrls: ['./upload-health-document.component.css']
})
export class UploadHealthDocumentComponent implements OnInit {

  public docUploadParam: FormGroup;
  docUploadError: string = "";
  myFiles: any = [];
  myLabFiles: any = [];
  fileError: string = "";
  labFileError: string = "";

  constructor(
    private fb: FormBuilder,
    public documentUploadService: UploadDocumentService,
    private fileUploadService: FileUploadService,
    private toastr: ToastrService,
    private commonService: CommonService,
  ) {
    this.docUploadParam = this.fb.group({
      file: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  resetError() {
    this.docUploadError = "";
  }

  onChanges(): void {
    this.docUploadParam.valueChanges.subscribe(val => {
      this.resetError();
    });
  }

  async uploadDoc(data: any) {
    let progress: number = 0;
    const index = this.myFiles.indexOf(data);
    const formData = new FormData();
    formData.append('File', data);
    (await
      this.fileUploadService.uploadDoc(
        formData, 'PCU', ''
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
          this.toastr.error(error ? error : "Documents couldn't be updated due some error");
        })

  }

  async onPfFileChange(event: any) {
    let extensionAllowed: any = { "png": true, "jpeg": true, "pdf": true, "jpg": true };
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
    this.fileError = '';
    const target = event.target.files[0];
    target.progress = 0;
    target.response = [];
    this.myFiles.push(target);
    this.docUploadParam.controls["file"].setValue(this.myFiles);
    await this.uploadDoc(event.target.files[0])
    event.target.value = '';
  }

 removeItem = async (index: any,fileDetails:any) => {
    if(fileDetails.error){
      this.myFiles.splice(index, 1);
    }
    else{
      const reqData: any = {
        apiRequest: fileDetails.response[0]
      }
      reqData.apiRequest.actionIndicator = '';
      await this.fileUploadService.singleFileDelete(reqData,'NCSR')
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
    }
  }

  async uploadLabDoc(data: any) {
    let progress: number = 0;
    const index = this.myLabFiles.indexOf(data);
    const formData = new FormData();
    formData.append('File', data);
    (await
      this.fileUploadService.uploadDoc(
        formData, 'LRU', ''
      )).subscribe((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            progress = Math.round(event.loaded / event.total! * 100);
            this.myLabFiles[index].progress = progress;
            break;
          case HttpEventType.Response:
            if (!this.fileUploadService.isDocUploadApiError(event.body)) {
              const responseFiles = { ...event.body.apiResponse }
              this.myLabFiles[index].response.push(responseFiles);
            } else {
              this.myLabFiles[index].error = true;
            }
            setTimeout(() => {
              // progress = 0;
            }, 1500);
        }
      },
        (error) => {
          this.myLabFiles[index].error = true;
          this.toastr.error(error ? error : "Documents couldn't be updated due some error");
        })
  }

  async onLrfFileChange(event: any) {
    let extensionAllowed: any = { "png": true, "jpeg": true, "pdf": true, "jpg": true };
    if (event.target.files[0].size / 1024 / 1024 > 2) {
      this.labFileError = "File is too large. Allowed maximum size is 2 MB"
      event.target.value = '';
      return;
    }
    if (extensionAllowed) {
      var nam = event.target.files[0].name.split('.').pop();
      if (!extensionAllowed[nam]) {
        this.labFileError = "Please upload " + Object.keys(extensionAllowed) + " file."
        event.target.value = '';
        return;
      }
    }
    this.labFileError = '';
    const target = event.target.files[0];
    target.progress = 0;
    target.response = [];
    this.myLabFiles.push(target);
    this.docUploadParam.controls["file"].setValue(this.myLabFiles);
    await this.uploadLabDoc(event.target.files[0])
    event.target.value = '';
  }

  removeLabItem = async (index: any,fileDetails:any) => {
    if(fileDetails.error){
      this.myLabFiles.splice(index, 1);
    }
    else{
      const reqData: any = {
        apiRequest: fileDetails.response[0]
      }
      reqData.apiRequest.actionIndicator = '';
      await this.fileUploadService.singleFileDelete(reqData,'NCSR')
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.myLabFiles.splice(index, 1);
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error("File couldn't delete due some error");
          }
        })
    }
  }

  async handleUpload() {
    if (this.myFiles.length > 0 || this.myLabFiles.length > 0) {
      const fileDetailsList: any = [];
      if (this.myFiles.length > 0) {
        this.myFiles.forEach((file: any) => {
          let responseObj: any = {}
          if (file.response.length > 0) {
            responseObj = file.response[0];
            responseObj.fileSeqNo = fileDetailsList.length + 1;
            fileDetailsList.push(responseObj);
          }
        })
      }
      if (this.myLabFiles.length > 0) {
        this.myLabFiles.forEach((file: any) => {
          let responseObj: any = {}
          if (file.response.length > 0) {
            responseObj = file.response[0];
            responseObj.fileSeqNo = fileDetailsList.length + 1;
            fileDetailsList.push(responseObj);
          }
        })
      }
      const reqData = {
        apiRequest: {
          fileCount: fileDetailsList.length,
          fileDetailsList: fileDetailsList
        },
      }
      await this.documentUploadService.uploadHealthDocument(reqData)
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            window.scrollTo(0, 0);
            this.toastr.success("Documents uploaded successfully");
            this.myFiles = [];
            this.myLabFiles = [];
          } else {
            this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage)
          }
        })
        .catch((err: any) => {
          if(err.status !== 401){
          this.toastr.error("Documents couldn't be updated due some error")
          }
        })
    } else {
      this.toastr.error("Please select a document first to upload")
    }
  }

}
