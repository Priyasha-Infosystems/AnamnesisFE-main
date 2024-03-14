import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { reducers } from 'src/store/reducers';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ApiService } from '@services/api.service';
import { FormService } from '@services/form.service';
import { LoginService } from '@services/login.service';
import { GlobalErrorHandler } from '@services/globalErrorHandler';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';
import { JwtModule } from '@auth0/angular-jwt';
import { UtilityService } from '@services/utility.service';
import { DatePipe } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'; 


function ownLogger(state: any, action: any) {
}

export function getToken() {
  return localStorage.getItem('token');
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    StoreModule.forRoot(reducers),
    ToastrModule.forRoot(),
    NgxSpinnerModule,
    BrowserAnimationsModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: getToken
      }
    }),
    StoreDevtoolsModule.instrument({
      name: 'NgRx Demo App',
      monitor: (state, action) => {
        ownLogger(state, action);
      }
    }),
    NgbModule
  ],
  providers: [
    ApiService,
    // FormService,
    LoginService,
    UtilityService,
    DatePipe,
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
