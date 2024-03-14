import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BASE_IMAGE_URL, BASE_IMAGE_URL_FOR_CampaignPhotosDownlod, BASE_IMAGE_URL_FOR_REQ } from '@constant/constants';
import { CommonService } from '@services/common.service';
import { UserSetupService } from '@services/user-setup.service';
import * as XLSX from 'xlsx';
import * as fs from 'file-saver';
@Component({
  selector: 'app-user-setup',
  templateUrl: './user-setup.component.html',
  styleUrls: ['./user-setup.component.css']
})
export class UserSetupComponent implements OnInit {
  @ViewChild('fileInput') fileInputVariable: ElementRef;
  showBulkUserSetUp:boolean = false;
  showSingleUserSetUp:boolean = true;
  finalData:any;
  xlData: Array<any> = [];
  fileUploadDisable:boolean = false;
  fileForm: FormGroup;
  file:any = false;
  fileErrMsg:string;
  fileUploadProgress:number =0;
  requestKeyDetails: any;
  imageBaseUrl: string = BASE_IMAGE_URL_FOR_CampaignPhotosDownlod;
  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private userSetupService: UserSetupService,
  ) {
    this.fileForm = this.fb.group({
      fileSource: [{ value: '', disabled: false }],
    })
   }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.commonService.getUtilityService();
    this.commonService.setRequestKeyDetails().then(res => {
      this.requestKeyDetails = res;
    })
  }
  onFileChange(event:any){
    if(event.target.files.length){
      let extensionAllowed: any = { "xlsx": true};
      if (event.target.files[0].size / 1024 / 1024 > 2) {
        this.fileErrMsg = "File is too large. Allowed maximum size is 2 MB"
        event.target.value = '';
        return;
      }
      if (extensionAllowed) {
        var nam = event.target.files[0].name.split('.').pop();
        if (!extensionAllowed[nam]) {
          this.fileErrMsg = "Please upload " + Object.keys(extensionAllowed) + " file."
          event.target.value = '';
          return;
        }
      }
      this.file = event;
      this.fileErrMsg = ''
    }else{
      this.fileUploadProgress = 0;
    }
  }

  upload() {
    for (let index = 1; index <= 100; index++) {
      setTimeout(() => {
        this.fileUploadProgress = index
      }, 600);
    }
    if(this.file){
      const evt = this.file;
      /* wire up file reader */
      const target: DataTransfer = <DataTransfer>(evt.target);
      if (target.files.length !== 1) throw new Error('Cannot use multiple files');
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        /* read workbook */
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

        /* grab first sheet */
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        /* save data */
        const xlData = <any>(XLSX.utils.sheet_to_json(ws, { header: 1 }));
        this.formatXlData(xlData)
      };
      reader.readAsBinaryString(target.files[0]);
    }else{
      this.fileErrMsg = 'please select a file to upload';
    }


  }

  formatXlData(data: any) {
    this.xlData = []
    setTimeout(() => {
      const tempxlData: Array<any> = [];
      data.forEach((val: any, i: number) => {
        if (val.length) {
          if (val[0] === 'Sl. No.' || val[1] === 'First Name' || val[2] === 'Middle Name' || val[3] === 'Last Name' || val[4] === 'Contact No' || val[5] === 'eMail ID' || val[6] ==='Commercial ID') {
          } else {
            const tempUserDetails = {
              firstName: val[1],
              middleName: val[2] ? val[2] : '',
              lastName: val[3],
              emailID: val[5],
              contactNo: (val[4] as string).toString(),
              commercialID:val[6]?val[6]:'',
              isXlData: true,
              errMsg: '',
              actionIndicator: 'ADD'
            }
            tempxlData.push(tempUserDetails)
          }
        }
      })
      this.xlData = tempxlData;
      this.file = false;
      this.fileUploadProgress = 0;
    }, 800);
  }

  singleUserClose(data:any){
    if(data){
      this.finalData = data;
      this.fileUploadDisable = true;
      this.showBulkUserSetUp= true;
      this.showSingleUserSetUp = false;
      this.fileUploadProgress = 0;
    }
  }

  blukUserClose(data:any){
    if(!data){
      this.xlData  = [];
      this.showSingleUserSetUp = true;
      this.showBulkUserSetUp= false;
    }else{
      this.xlData = data.bulkUserSetupdetailsList;
      this.showSingleUserSetUp = true;
      this.showBulkUserSetUp= false;
    }
    this.fileUploadDisable = false;
  }

  async fileDownload(){
    await this.userSetupService.getXlsxBlob()
    .then(async (res: any) => {
      
    })
    .catch((err: any) => {
      const blob = new Blob([err.error.text], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'BlukUserSetup.xlsx');
    })
  }
}
