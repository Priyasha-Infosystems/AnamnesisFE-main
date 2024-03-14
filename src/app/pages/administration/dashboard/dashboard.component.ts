import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonService } from '@services/common.service';
import { DashboardService } from '@services/dashboard.service';
import { UtilityService } from '@services/utility.service';

import { Chart, ChartDataset, registerables } from 'chart.js';
import { ToastrService } from 'ngx-toastr';


Chart.register(...registerables)
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit,AfterViewInit,OnDestroy {
  requestKeyDetails:any;
  adminDashboardData:any;
  ShowDashboard:any;
  @ViewChild('dayChart', {static: true}) private daychart:any;
  @ViewChild('monthchart', {static: true}) private monthchart:any;
  @ViewChild('AvgDelTime', {static: true}) private AvgDelTime:any;
  constructor(
    private toastr: ToastrService,
    public commonService: CommonService,
    public utilityService: UtilityService,
    private dashboardService:DashboardService
  ) {
 
  }
  
  ngAfterViewInit(): void {
    this.getAdminDashBoard();
  }

  ngOnInit(): void {
    
  }

  async getAdminDashBoard(){
   await this.dashboardService.GetAdminDashboard()
        .then(async (res: any) => {
          if (!this.commonService.isApiError(res)) {
            this.adminDashboardData = res.apiResponse;
            this.createDayChart(res.apiResponse.todayOrderReportList)
            this.createMonthChart(res.apiResponse.monthOrderCountReportList)
            this.createAvgDelTime(res.apiResponse.averageDeliveryTime?res.apiResponse.averageDeliveryTime:0)
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

  createMonthChart(data:any) {
    const chartData:any ={
      labels:[],
      medicineData:[],
      labtestData:[],
      HouseholdData:[]
    }
    data.forEach((res:any)=>{
      let medCount = 0;
      let labCount = 0;
      let HiCount = 0;
      res.orderCountList.forEach((val:any)=>{
        switch (val.key) {
          case 'MD':
            medCount = medCount+val.count
            break;
          case 'LT':
            labCount = labCount+val.count
            break;
          case 'HI':
            HiCount = HiCount+val.count
            break;
        
          default:
            break;
        }
      })
      chartData.medicineData.push(medCount)
      chartData.labtestData.push(labCount)
      chartData.HouseholdData.push(HiCount)
      chartData.labels.push(`${res.week} week`)
    })

    new Chart(this.monthchart.nativeElement, {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: "Medicine",
            backgroundColor: "rgb(0, 143, 251)",
            borderColor: "rgb(0, 143, 251)",
            borderWidth: 1,
            data: chartData.medicineData
          },
          {
            label: "Laboratry Test",
            backgroundColor: "rgb(0, 227, 150)",
            borderColor: "rgb(0, 227, 150)",
            borderWidth: 1,
            data: chartData.labtestData
          },
          {
            label: "Consumables",
            backgroundColor: "rgb(254, 176, 25)",
            borderColor: "rgb(254, 176, 25)",
            borderWidth: 1,
            data: chartData.HouseholdData
          }
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,

          },
        }
      }
    });
  }
  createDayChart(data:any) {
      const toDayData:any ={
        timeLabels : [],
        orderList :[],
        outForDeliveryList :[]
      }
      data.forEach((res:any)=>{
          const time = `${res.time.split(':')[0]}:${res.time.split(':')[1]}`
          toDayData.timeLabels.push(time);
          toDayData.orderList.push(res.orderCount);
          toDayData.outForDeliveryList.push(res.outFrorDeliveryOrderCount);
        })
      this.daychart = new Chart(this.daychart.nativeElement, {
        type: 'bar',
        data: {
          labels: toDayData.timeLabels,
          datasets: [
            {
              label: "Order",
              backgroundColor: "rgb(0, 143, 251)",
              borderColor: "rgb(0, 143, 251)",
              borderWidth: 1,
              data: toDayData.orderList
            },
            {
              label: "Out for delivery",
              backgroundColor: "rgb(254, 176, 25)",
              borderColor: "rgb(254, 176, 25)",
              borderWidth: 1,
              data: toDayData.outForDeliveryList
            }
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          }
        }
      });
    
    
  }
 async createAvgDelTime(avgVal:number) {
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
    const value = `${avgVal}`
   await new Chart(this.AvgDelTime.nativeElement, {
      type: 'doughnut',
      data: {
        labels: [
        ],
        datasets: [{
          label: value,
          data: [60, 40],
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)'
          ],
          hoverOffset: 4,
          circumference: 180,
          rotation: 270,
          // needleValue:75,

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
  ngOnDestroy(): void {
    // this.daychart.clear()
    // this.monthchart.clear()
    // this.AvgDelTime.clear()
  }
}
