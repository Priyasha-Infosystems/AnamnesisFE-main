import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PriyashaInfoComponent } from './priyasha-info.component';
import { PriyashaInfoRoutingModule } from './priyasha-info-routing.module';
import { HeaderComponent } from './header/header.component';
import { ContactComponent } from './contact/contact.component';
import { ServiceComponent } from './service/service.component';
import { HomeComponent } from './home/home.component';
import { BlogComponent } from './blog/blog.component';
import { FooterComponent } from './footer/footer.component';
import { WeAreComponent } from './we-are/we-are.component';
import { SlickCarouselComponent } from './slick-carousel/slick-carousel.component';
import { CommonService } from './services/common.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { PriyaInfiSystemsService } from '@services/priya-infi-systems.service';
import { ValidationMessageModule } from 'src/app/components/validation-message/validation-message/validation-message.module';
import { CommingSoonComponent } from 'src/app/components/comming-soon/comming-soon.component';
import { TermNCendComponent } from 'src/app/components/term-ncend/term-ncend.component';
import { AllPipesModule } from '@pipes/all-pipes/all-pipes.module';

@NgModule({
  declarations: [
    PriyashaInfoComponent,
    HeaderComponent,
    ContactComponent,
    HomeComponent,
    ServiceComponent,
    FooterComponent,
    BlogComponent,
    WeAreComponent,
    SlickCarouselComponent,
    CommingSoonComponent,
    TermNCendComponent
  ],
  imports: [
    CommonModule,
    PriyashaInfoRoutingModule,
    SlickCarouselModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ValidationMessageModule,
    AllPipesModule
  ],
  providers: [CommonService,PriyaInfiSystemsService,DatePipe],
  bootstrap: [PriyashaInfoComponent],

  exports:[
    HeaderComponent,
  ],
})
export class PriyashaInfoModule { }
