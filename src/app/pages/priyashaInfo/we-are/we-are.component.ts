import { Component, OnInit } from '@angular/core';
import { IF_LOGIN_ALLOW } from '@constant/constants';

@Component({
  selector: 'app-we-are',
  templateUrl: './we-are.component.html',
  styleUrls: ['./we-are.component.css']
})
export class WeAreComponent implements OnInit {
  prod: boolean = IF_LOGIN_ALLOW;
  commingSoonPopUp: boolean = false;
  termNCndPopUp:boolean = false;
  weAreText = [
    { Text: `Journey of Anamnesis started a year back when Sourav, a staunch technical evangelist and process expert realized the significance and an urgent need of digitized health records. While he was still in drawing board, he realized there is a significant gap and lack of personalization in health care service delivery. With a team of Technology enthusiasts, process experts and many others, today Anamnesis is ready to enable users order medicine, avail consultation & lab booking online. Anamnesis platform in Web and mobile devices are generating health trends for its community users and increasing awareness of global health through blogs, news and many more channels..` },
    { Text: `With extension of services by Anamnesis, we are planning to expand our operation in many cities in India in coming days. So, stay tuned and please subscribe..` },

    { Datatext: ' ' }
  ]
  weAreimg = [
    { image: 'vision-1' },
    { image: 'vision-2' }
  ]
  Vision = [
    { Head: '' },
    { Text: 'Our main vision is to develop world class applications that can be available to every general person and they will work as the key applications to limit their everyday hassles.' },
    { Text: ' Also, maintaining the quality of our services by fulfilling the requirements of the users is another vision of our team.' },
  ]
  directoryUser: any;

  constructor() { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  scrollToDiv(id: any) {
    if (id === 'Login') {
      this.commingSoonPopUp = true;
    }
  }

  closeCommingSoonPopUp() {
    this.commingSoonPopUp = false;
  }

  openTermNCndPopUp(){
    this.termNCndPopUp = true;
  }
  closeTermNCndPopUp(){
    this.termNCndPopUp = false;
  }

}
