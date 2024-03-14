import { Component, HostListener } from '@angular/core';
import { select, Store } from '@ngrx/store'
import * as $ from 'jquery'
import { Subscription } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { LocalStorageService } from '@services/localService/localStorage.service';
import { LOCAL_STORAGE } from '@constant/constants';
import { isUserMenuListFetched, userMenuLists } from 'src/store/actions/utility.actions';
import { userProfile } from 'src/store/actions/login.actions';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'my-Health-Book';
  msg: string = "";
  user: number = 0;
  subscription: Subscription;
  browserRefresh: boolean = true;
  isLoginClicked: boolean = false;
  
  @HostListener('contextmenu', ['$event'])
  onRightClick(event:any) {
    event.preventDefault();
  }
  constructor(
    private userStore: Store<{ loginState: any }>,
    private router: Router,
    private localStorage: LocalStorageService,
    private store: Store<any>,
    private toastr: ToastrService,
  ) {
    this.store.pipe(select('loginState')).subscribe(val => {
      if (val?.isLoginClicked) {
        this.isLoginClicked = true;
      }
    })
    

    const isLocal = window.location.href === "http://localhost:4200/" ? true : false
    if (!isLocal) {
      window.addEventListener('beforeunload', function (e) {
        e.preventDefault();
        e.returnValue = '';
      });
      this.subscription = this.router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.browserRefresh = !this.router.navigated;
        }
      });
    }

    
  }

  async ngOnInit() {
    window.addEventListener('beforeunload',(event)=>{
      event.preventDefault()
      event.returnValue = ''
    })
    window.addEventListener('keyup',this.disableF5)
    window.addEventListener('keydown',this.disableF5)
    if (this.browserRefresh) {
      const token = await this.localStorage.getDataFromIndexedDB(LOCAL_STORAGE.TOKEN);
      if (token !== null) {
        this.router.navigate(['/home/my-profile'], { skipLocationChange: true });
      } else {
        if (this.isLoginClicked) {
          this.router.navigate(['/login'], { skipLocationChange: true });
        } else {
          const currentUrl = window.location.href;
          const baseUrl = window.location.origin;
          const endpoint = currentUrl.replace(baseUrl, '');
          if (endpoint === '/') {
            this.router.navigate(['/priyashaInfo'], { skipLocationChange: true });
          } else {
            this.router.navigate([endpoint]);
          }
        }
        localStorage.clear();
        this.store.dispatch(new userMenuLists([]));
        this.store.dispatch(new isUserMenuListFetched(false));
        this.store.dispatch(new userProfile([]));
      }
    }
  }

  disableF5(e:any){
    if ((e.which || e.keyCode) == 116)  {
      window.alert('This action not allowed!!!')
      e.preventDefault();
      // this.toastr.error('This action not allowed!!!')
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
