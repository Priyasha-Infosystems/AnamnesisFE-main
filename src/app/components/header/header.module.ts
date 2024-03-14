import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import { LoginService } from '@services/login.service';
import { ProfilePicComponent } from './profile-pic/profile-pic.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SenescenceCareComponent } from './senescence-care/senescence-care.component';
import { ProfileService } from '@services/profile.service';
import { WalletDetailsComponent } from '../wallet-details/wallet-details.component';
import { AllPipesModule } from '@pipes/all-pipes/all-pipes.module';
import { ViewMyCartService } from '@services/view-my-cart.service';

@NgModule({
  declarations: [
    HeaderComponent,
    ProfilePicComponent,
    SenescenceCareComponent,
    WalletDetailsComponent
  ],
  imports: [
    CommonModule,
    NgxSpinnerModule,
    AllPipesModule
  ],
  exports: [
    HeaderComponent,
    ProfilePicComponent
  ],
  providers:[
    LoginService,
    ProfileService,
    ViewMyCartService,
  ]
})
export class HeaderModule { }
