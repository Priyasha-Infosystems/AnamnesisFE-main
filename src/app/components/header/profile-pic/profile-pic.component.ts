import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FileUploadService } from '@services/fileUpload.service';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { CommonService } from '@services/common.service';

@Component({
  selector: 'app-profile-pic',
  templateUrl: './profile-pic.component.html',
  styleUrls: ['./profile-pic.component.css']
})
export class ProfilePicComponent implements OnInit {
  @Input() displayName: any
  @Input() profilePicDetails: any
  @Input() isProfilePicFetched: any
  selectedFile: any
  fileError: string = "";
  myFiles: any = [];
  @ViewChild('fileInput') fileInput: ElementRef;

  constructor(
    private fileUploadService: FileUploadService,
    private commonService: CommonService,
  ) { }

  ngOnInit(): void {
    this.selectedFile = this.profilePicDetails;
  }

  openFileUpload() {
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: any) {
    let extensionAllowed: any = { "png": true, "jpeg": true, "jpg": true };
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
    const file: File = event.target.files[0];
    this.fileError = '';
    const target = event.target.files[0];
    target.progress = 0;
    target.response = [];
    this.myFiles.push(target);
    await this.uploadDoc(event.target.files[0], file)
    event.target.value = '';
  }

  async uploadDoc(data: any, file: any) {
    let progress: number = 0;
    const index = this.myFiles.indexOf(data);
    const formData = new FormData();
    formData.append('File', data);
    (await
      this.fileUploadService.uploadProfileImage(
        formData, '', ''
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
              this.commonService.updateUserMenuList();
              this.isProfilePicFetched = true;
              if (file) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                  this.selectedFile = reader.result;
                };
              }
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
        })
  }

  removeItem = () => {
    this.myFiles = [];
    this.selectedFile = null;
  }

  deleteProfileImage = () => {
    this.isProfilePicFetched = false;
    this.selectedFile = "../../../../assets/images/profile-pic-dummy.png"
  }
}