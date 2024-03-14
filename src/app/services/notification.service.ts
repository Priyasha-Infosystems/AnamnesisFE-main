import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})

export class NotificationAlertService {

    constructor(public toastService: ToastrService) { }

    showError(message: any) {
        const warningMessage = this.parseErrorMessage(message);
        this.toastService.error(warningMessage);
    }

    parseErrorMessage(message: any) {
        let errorMessage = '';
        try {
            errorMessage = (JSON.parse(message)).message;
        } catch (e) {
            if (typeof message === 'object') {
                errorMessage = message.message;
            } else {
                errorMessage = message;
            }
        }
        return errorMessage;
    }
}