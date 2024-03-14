import { Injectable, EventEmitter, ErrorHandler } from '@angular/core';

@Injectable()

export class GlobalErrorHandler implements ErrorHandler {

  handleError(error: any) {
    console.error('I will handle error myself', error);
    throw error;
  }
}
