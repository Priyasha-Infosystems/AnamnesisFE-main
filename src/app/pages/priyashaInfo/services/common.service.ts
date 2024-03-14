import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor() { }

  checkUserNumber(input: string) {
    let response = true;
    const checkerValue = '0123456789';
    if (input) {
      for (let index = 0; index < input.length; index++) {
        if (checkerValue.indexOf(input.substring(index, index + 1)) < 0) {
          response = false;
        }
      }
    }
    return response;
  }
  checkUserName(input: string) {
    let response = true;
    const checkerValue = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ';
    if (input) {
      for (let index = 0; index < input.length; index++) {
        if (checkerValue.indexOf(input.substring(index, index + 1)) < 0) {
          response = false;
        }
      }
    }
    return response;
  }
}
