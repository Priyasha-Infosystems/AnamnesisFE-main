import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommercialUserSignupComponent } from './commercial-user-signup/commercial-user-signup.component';
import { LoginComponent } from './login.component';
import { RegularUserSignupComponent } from './regular-user-signup/regular-user-signup.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'regular-user-signup', component: RegularUserSignupComponent },
  { path: 'commercial-user-signup', component: CommercialUserSignupComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule { }
