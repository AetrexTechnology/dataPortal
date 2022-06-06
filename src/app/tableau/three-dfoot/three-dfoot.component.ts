import { Component, Input, OnInit } from '@angular/core';
import {MatTableModule } from '@angular/material/table'
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-thrre-dfoot',
  templateUrl: './three-dfoot.component.html',
  styleUrls: ['./three-dfoot.component.scss']
})
export class ThreeDfootComponent implements OnInit {
  displayedColumns = ['position', 'name', 'weight', 'symbol'];
  dataSource = ELEMENT_DATA;
  selectedValue1: any;
  selectedValue2: any;
  selectedValue3: any;
  @Input() user = '3eca8f3390f700a35b54a0e40bbbf6cf';
  @Input() showRecommendationInfo = true;
  @Input() domain = 'aetrex'
  @Input() sku = 'AE683W';
  footData: any;
  selectedFootData: any;
  selectedFoot = 'leftfoot';
  recommended_shoe_size:any;

  items = [{
    value : "United States",
    viewValue : "Country-United States"
  },{
    value : "India",
    viewValue : "country-India"
  },{
    value : "Korea",
    viewValue : "country-Korea"
  }];

  items2 = [{
    value : "Male",
    viewValue : "Gender-Male"
  },{
    value : "Female",
    viewValue : "Female"
  }];

  items3 = [{
    value : "7",
    viewValue : "size-7"
  },{
    value : "8",
    viewValue : "size-8"
  },{
    value : "10",
    viewValue : "size-10"
  }];
  constructor() { }

  ngOnInit(): void {
  }

}
export interface Element {

}

const ELEMENT_DATA: Element[] = [
  {position: 1,L_Length: 24.3, R_Length: 24.3, L_Width: 8.72, R_Width:8.72, L_Girth:22.25, R_Girth:22.25, L_Arch_Height:1.45, R_Arch_Height:1.45, L_Instep_Height:6.29, R_Instep_Height:6.29,Size_7_F_US:0,},
 
];
// export class ThreeDfootComponent implements OnInit {

//   @Input() user = '3eca8f3390f700a35b54a0e40bbbf6cf';
//   @Input() showRecommendationInfo = true;
//   @Input() domain = 'aetrex'
//   @Input() sku = 'AE683W';

//   footData: any;
//   selectedFootData: any;
//   selectedFoot = 'leftfoot';
//   lfoot;
//   rfoot;
//   recommended_shoe_size;
//   constructor(private appService: AppService) { }

//   // ngOnChanges(): void {
//   //   this.appService.getProfileLastScan(this.user).subscribe(data => {
//   //     console.log(data);
//   //   })
//   // }

//   ngOnInit(): void {
//     // this.appService.getProfileLastScan(this.user,).subscribe(data => {
//     if (this.user && this.domain && this.sku) {
//       // this.appService.getShoesize(this.user, this.domain, this.sku).subscribe(data => {
//       //   if (data && data['footdata']) {
//       //     this.footData = data['footdata'];
//       //     this.selectFoot(this.selectedFoot);
//       //   }
//       // })
//       this.lfoot = "https://s3.amazonaws.com/aetrex-scanneros-scans/QA/7b8a15af330a274b1629363f358f52e9a24904f03117523bdd4295f856e086c9/CurrentTest/3DModel/left_foot.obj";
//       this.rfoot = "https://s3.amazonaws.com/aetrex-scanneros-scans/QA/7b8a15af330a274b1629363f358f52e9a24904f03117523bdd4295f856e086c9/CurrentTest/3DModel/right_foot.obj";
//     }
//   }

//   selectFoot(foot: string) {
//     this.selectedFoot = foot;
//     this.selectedFootData = this.footData[foot];
//   }

//   // openDialog() {
//   //   const dialogRef = this.dialog.open(InfoComponent, {
//   //     data: { user: this.user },
//   //     width: '50%;',
//   //   });
//   // }

// }