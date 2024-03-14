import {Pipe,PipeTransform} from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import { BASE_IMAGE_URL_FOR_TEST } from '@constant/constants';
@Pipe({
  name:'truncPrice'
})
export class TruncPrice implements PipeTransform{
  transform(data:number){
    return (Math.round(data * 100) / 100).toFixed(2);
  }
}

@Pipe({ name: 'addressLine'})
export class AddressLine implements PipeTransform  {
  constructor(private sanitized: DomSanitizer) {}
  transform(value:any) {
    const data = value.replace('\n','<br>')
    return this.sanitized.bypassSecurityTrustHtml(data);
  }
}
@Pipe({ name: 'inrHtml'})
export class InrHTML implements PipeTransform  {
  constructor(private sanitized: DomSanitizer) {}
  transform(value:any) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}

@Pipe({ name: 'getFile'})
export class GetFile implements PipeTransform  {
  constructor() {}
  imageBaseUrl: string = BASE_IMAGE_URL_FOR_TEST;
  transform(fileName:any,fileType:any) {
    return `${this.imageBaseUrl}${fileType}/${fileName}`
  }
}