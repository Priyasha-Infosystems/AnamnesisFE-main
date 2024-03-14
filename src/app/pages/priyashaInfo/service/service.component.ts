import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.css']
})
export class ServiceComponent implements OnInit {

  service =[
    {image:'Music' , headLine:'Anamnesis: My Health Book' , 
    Description:'This is our main project that aims to generate high quality healthcare support to every person living in any part of Bengal, especially in the rural part of the state. To make healthcare facility available we are currently working hard on this project.',
    DescriptionText :``,
    },
    {image:'art' , headLine:'Senescence Care' , 
    Description:'Here we provide one of the best healthcare supports to elder people who are living In India without their close relatives. It is a warm regard to them that will be a support for them in elderly.',
    DescriptionText :` `,
    },
    {image:'art' , headLine:'Software development' , 
    Description:'Our team is aimed to develop world class software that can create a huge change in people’s life.',
    DescriptionText :` `,
    },
    {image:'art' , headLine:'Testing ' , 
    Description:'By the help of black box as well as white box testing methods we perform testing of software developed and maintained by our team to check the workability of the software.',
    DescriptionText :` `,
    },
    {image:'art' , headLine:'Further maintenance and development' , 
    Description:'Not just creation and testing, we also further update and develop software developed by us. Also, we will maintain them to manage the workability of the software.',
    DescriptionText :` `,
    }
  ]
 

  constructor() { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  evenCheck(index:number){
    if(index === 0){
      return true;
    }
    else if(index %2 === 0){
      return true
    }
    else{
      return false
    }
  }

}
