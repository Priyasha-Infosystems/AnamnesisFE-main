import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '@pages/home/home.component';
import { AuthGuard } from '@services/auth.guard';
import { UnauthorisedComponent } from './components/unauthorised/unauthorised.component';

const routes: Routes = [
  {
    path: '', loadChildren: () => import('./pages/priyashaInfo/priyasha-info.module').then(m => m.PriyashaInfoModule)
  },
  {
    path: 'login', loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'priyashaInfo', loadChildren: () => import('./pages/priyashaInfo/priyasha-info.module').then(m => m.PriyashaInfoModule)
  },
  {
    path: 'home', loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'administration', loadChildren: () => import('./pages/administration/administration.module').then(m => m.AdministrationModule)
  },
  {
    path: 'menu-pages', loadChildren: () => import('./pages/menu-pages/menu-pages.module').then(m => m.MenuPagesModule)
  },
  {
    path: 'un-authorised-pages', component: UnauthorisedComponent
  },
  {
    path: '**', loadChildren: () => import('./pages/priyashaInfo/priyasha-info.module').then(m => m.PriyashaInfoModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
