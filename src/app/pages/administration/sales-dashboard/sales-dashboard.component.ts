import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonService } from '@services/common.service';
import { DashboardService } from '@services/dashboard.service';
import { UtilityService } from '@services/utility.service';

import { Chart, registerables } from 'chart.js';
import { ToastrService } from 'ngx-toastr';
Chart.register(...registerables)
@Component({
  selector: 'app-sales-dashboard',
  templateUrl: './sales-dashboard.component.html',
  styleUrls: ['./sales-dashboard.component.css']
})
export class SalesDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('TPUBarChart', {static: true}) private TPUBarChart:any;
  @ViewChild('MRRlineChart', {static: true}) private MRRlineChart:any;
  @ViewChild('CGMlineChart', {static: true}) private CGMlineChart:any; 
  @ViewChild('NPSTHisMonth', {static: true}) private NPSTHisMonth:any; 
  @ViewChild('SBCchart', {static: true}) private SBCchart:any; 
  @ViewChild('piechart', {static: true}) private piechart:any;
  salesDashboardData:any 
  constructor(
    private toastr: ToastrService,
    public commonService: CommonService,
    public utilityService: UtilityService,
    private dashboardService:DashboardService
  ) { }

  ngAfterViewInit(): void {
    this.createMRRMonthChart()
    this.createCustomerGrowByMonththChart()
    this.createTicketsPerUser()
    this.createNPSChart(75)
  }

  ngOnInit(): void {

  }
  async getSalesDashBoard(){
    await this.dashboardService.GetSalesDashboard()
         .then(async (res: any) => {
           if (!this.commonService.isApiError(res)) {
             this.salesDashboardData = res.apiResponse;
             this.createSaleByCategoryChart(res.apiResponse.itemCountByMonthList)
           } else {
             this.toastr.error(res.anamnesisErrorList.anErrorList[0].errorMessage);
           }
         })
         .catch((err: any) => {
           if(err.status !== 401){
           this.toastr.error("Dashboard data can't fetch due to some error");
           }
         })
   }

  createTicketsPerUser() {
    this.TPUBarChart = new Chart(this.TPUBarChart.nativeElement, {
      type: 'bar',
      data: {
        labels: ['abcd'],
        datasets: [
          {
            label: '',
            data: [0],
            borderColor: '#69CCF4',
            backgroundColor: '#69CCF4',
          },
          {
            label: '',
            data: [5],
            borderColor: '#69CCF4',
            backgroundColor: '#69CCF4',
          },
          {
            label: '',
            data: [10],
            borderColor: '#69CCF4',
            backgroundColor: '#69CCF4',
          },
          {
            label: '',
            data: [15],
            borderColor: '#69CCF4',
            backgroundColor: '#69CCF4',
          },
          {
            label: '',
            data: [20],
            borderColor: '#69CCF4',
            backgroundColor: '#69CCF4',
          },
          {
            label: '',
            data: [25],
            borderColor: '#69CCF4',
            backgroundColor: '#69CCF4',
          },
          {
            label: '',
            data: [30],
            borderColor: '#69CCF4',
            backgroundColor: '#69CCF4',
          },
          {
            label: '',
            data: [35],
            borderColor: '#69CCF4',
            backgroundColor: '#69CCF4',
          },
          {
            label: '',
            data: [40],
            borderColor: '#69CCF4',
            backgroundColor: '#69CCF4',
          },
          {
            label: '',
            data: [45],
            borderColor: '#69CCF4',
            backgroundColor: '#69CCF4',
          },
          {
            label: '',
            data: [50],
            borderColor: '#69CCF4',
            backgroundColor: '#69CCF4',
          },
          {
            label: '',
            data: [55],
            borderColor: '#69CCF4',
            backgroundColor: '#69CCF4',
          },
          {
            label: '',
            data: [600],
            borderColor: '#69CCF4',
            backgroundColor: '#69CCF4',
          },
        ]
      },
      options: {
        plugins: {
          legend: {
            display: false
          }
        }
      }
    })
  }

  createMRRMonthChart() {
    this.MRRlineChart = new Chart(this.MRRlineChart.nativeElement, {
      type: 'line',
      data: {
        labels: ['Jan', 'Apr', 'Jul'],
        datasets: [{
          label: '',
          data: [0, 4500, 4000],
          fill: true,
          borderColor: '#59C7EF',
          tension: 0.1
        }]
      },
      options: {
        plugins: {
          legend: {
            display: false
          }
        }
      }
    })
  }

  createCustomerGrowByMonththChart() {
    this.CGMlineChart = new Chart(this.CGMlineChart.nativeElement, {
      type: 'line',
      data: {
        labels: ['Jan', 'Apr', 'Jul'],
        datasets: [
          {
            label: 'Visitors',
            data: [5000, 5500, 10000],
            fill: true,
            borderColor: '#59C7EF',
            tension: 0.1
          },
          {
            label: 'Paying customers',
            data: [0, 4000, 8000],
            fill: true,
            borderColor: '#C6A622',
            tension: 0.1
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            display: true,
          }
        }
      }
    })
  }

  createNPSChart(avgVal:number) {
    const value = `${avgVal}`
    const gaugeNeedle = {
      id: 'gaugeNeedle',
      afterDatasetsDraw(chart: any, args: any, plugins: any) {
        const { ctx, data } = chart;
        ctx.save();
        const x = chart.getDatasetMeta(0).data[0].x
        const y = chart.getDatasetMeta(0).data[0].y
        const outerRadius = chart.getDatasetMeta(0).data[0].outerRadius;
        const angle = Math.PI;
        const dataTotal = data.datasets[0].data.reduce((a: any, b: any) => a + b, 0)
        let circumference = ((chart.getDatasetMeta(0).data[0].circumference / Math.PI) / data.datasets[0].data[0]) * +data.datasets[0].label;
        const needleAngleValue = circumference + 1.5;
        ctx.translate(x, y)
        ctx.rotate(angle * needleAngleValue);
        ctx.beginPath();
        ctx.strokeStyle = '#fff';
        ctx.fillStyle = '#fff';
        ctx.moveTo(0 - 4, 0);
        ctx.lineTo(0, -outerRadius);
        ctx.lineTo(0 + 4, 0);
        ctx.stroke();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, 6, angle * 0, angle * 2, false)
        ctx.fill();
        ctx.restore();
      }
    }
    this.NPSTHisMonth = new Chart(this.NPSTHisMonth.nativeElement, {
      type: 'doughnut',
      data: {
        labels: [
        ],
        datasets: [{
          label: value,
          data: [60, 40],
          backgroundColor: [
            '#A4A3B0',
            '#58CE49',
          ],
          hoverOffset: 4,
          circumference: 180,
          rotation: 270,
          // needleValue: 75,
        }],
      },
      options: {
        aspectRatio: 1.8,
        plugins: {
          legend: {
            display: false
          }
        }
      },
      plugins: [gaugeNeedle]
    });
  }

  createSaleByCategoryChart(data:any) {
    const labels:any = []
    const MedicineList:any =[]
    const HouseholdItemList:any =[]
    const PhysicianBookingList:any =[]
    const LaboratoryList:any =[]
    data.forEach((res:any)=>{
            labels.push(res.month)
            MedicineList.push(res.medicineCount)
            HouseholdItemList.push(res.householdItemCount)
            PhysicianBookingList.push(res.consultationCount)
            LaboratoryList.push(res.labtestCount)
        })
    this.SBCchart = new Chart(this.SBCchart.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: "Medicine",
            backgroundColor: "#56C9F1",
            borderColor: "#56C9F1",
            borderWidth: 1,
            data: MedicineList
          },
          {
            label: "Household Item",
            backgroundColor: "#E0C655",
            borderColor: "#E0C655",
            borderWidth: 1,
            data:HouseholdItemList
          },
          {
            label: "Physician Booking",
            backgroundColor: "#E0C655",
            borderColor: "#E0C655",
            borderWidth: 1,
            data: PhysicianBookingList
          },
          {
            label: "Laboratory",
            backgroundColor: "#E0C655",
            borderColor: "#E0C655",
            borderWidth: 1,
            data: LaboratoryList
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  createChart() {
    this.piechart = new Chart(this.piechart.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
          label: '# of Votes',
          data: [12, 19, 3, 5, 2, 3],
          borderWidth: 1,
        }],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

}
