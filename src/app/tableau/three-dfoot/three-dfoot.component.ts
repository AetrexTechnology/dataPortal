import { Component, Input, OnInit } from '@angular/core';
import {MatTableModule } from '@angular/material/table'
import { ApiService } from "../../auth/api.service";
import {MatDialog} from '@angular/material/dialog';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { FormControl, FormGroupDirective, FormBuilder ,FormGroup, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

// export class MyErrorStateMatcher implements ErrorStateMatcher
//   isErrorState(control: FormControl, form: FormGroupDirective | NgForm): boolean {
//     throw new Error('Method not implemented.');
//   }
@Component({
  selector: 'app-thrre-dfoot',
  templateUrl: './three-dfoot.component.html',
  styleUrls: ['./three-dfoot.component.scss']
})

export class ThreeDfootComponent implements OnInit {
  load3dFoot:boolean = false;
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
  fetch3dfootForm:FormGroup;
  Country = '';
  Gender = '';
  Size: any= '';
  scan_hash:string;
  lfoot:string;
  rfoot:string;
  matcher = new ErrorStateMatcher();
  
  items = [{
    value : "United States",
    viewValue : "Country-United States"
  },{
    value : "Canada",
    viewValue : "country-Canada"
  },{
    value : "Mexico",
    viewValue : "country-Mexico"
  },
  {
    value : "Puerto Rico",
    viewValue : "Country-Puerto-Rico"
  },{
    value : "Brazil",
    viewValue : "country-Brazil"
  },{
    value : "Germany",
    viewValue : "country-Germany"
  },
  {
    value : "United Kingdom",
    viewValue : "Country-United-Kingdom"
  },{
    value : "Netherlands",
    viewValue : "country-Netherlands"
  },{
    value : "Denmark",
    viewValue : "country-Denmark"
  },
  {
    value : "Spain",
    viewValue : "Country-Spain"
  },{
    value : "Israel",
    viewValue : "country-Israel"
  },{
    value : "United Arab Emirates",
    viewValue : "country-United-Arab-Emirates"
  },
  {
    value : "Thailand",
    viewValue : "Country-Thailand"
  },{
    value : "Indonesia",
    viewValue : "country-Indonesia"
  },{
    value : "China",
    viewValue : "country-China"
  },
  {
    value : "South Korea",
    viewValue : "Country-South-Korea"
  },{
    value : "Japan",
    viewValue : "country-Japan"
  },{
    value : "Russia",
    viewValue : "country-Russia"
  }];

  items2 = [{
    value : "Male",
    viewValue : "Gender-Male"
  },{
    value : "Female",
    viewValue : "Female"
  }];

  items3 = [{
    value : "2",
    viewValue : "size-10"
  },{
    value : "2.5",
    viewValue : "size-10"
  },{
    value : "3",
    viewValue : "size-10"
  },{
    value : "3.5",
    viewValue : "size-10"
  },{
    value : "4",
    viewValue : "size-10"
  },{
    value : "4.5",
    viewValue : "size-10"
  },{
    value : "5",
    viewValue : "size-10"
  },{
    value : "5.5",
    viewValue : "size-10"
  },{
    value : "6",
    viewValue : "size-10"
  },{
    value : "6.5",
    viewValue : "size-10"
  },{
    value : "7",
    viewValue : "size-7"
  },{
    value : "7.5",
    viewValue : "size-8"
  },{
    value : "8",
    viewValue : "size-8"
  },
  {
    value : "8.5",
    viewValue : "size-8.5"
  },
  {
    value : "9",
    viewValue : "size-9"
  },{
    value : "9.5",
    viewValue : "size-9.5"
  },
  {
    value : "10",
    viewValue : "size-10"
  },
  {
    value : "10.5",
    viewValue : "size-10.5"
  },
  {
    value : "11",
    viewValue : "size-11"
  },
  {
    value : "11.5",
    viewValue : "size-11.5"
  },
  {
    value : "12",
    viewValue : "size-12.5"
  },
  {
    value : "12.5",
    viewValue : "size-12.5"
  },
  {
    value : "13",
    viewValue : "size-13"
  },
  {
    value : "13.5",
    viewValue : "size-13.5"
  },
  {
    value : "14",
    viewValue : "size-14"
  },
  {
    value : "14.5",
    viewValue : "size-14.5"
  },
  {
    value : "15",
    viewValue : "size-15"
  },
  {
    value : "15.5",
    viewValue : "size-16.5"
  },
  {
    value : "16",
    viewValue : "size-16"
  },
  {
    value : "16.5",
    viewValue : "size-16.5"
  },
  {
    value : "17",
    viewValue : "size-16"
  },
  {
    value : "17.5",
    viewValue : "size-16.5"
  },
  {
    value : "18",
    viewValue : "size-16"
  }];
  constructor(public dialog: MatDialog, public formBuilder: FormBuilder, public apiService: ApiService) { }

  ngOnInit(): void {
    this.fetch3dfootForm = this.formBuilder.group({
      items : ['', Validators.required],
      items2 : ['', Validators.required],
      items3: ['', Validators.required],
    });
  }
  onformSubmit(){
    if(this.fetch3dfootForm.valid){
      if(this.fetch3dfootForm.value){
        if(this.fetch3dfootForm.value.items !== 'United States')
        {
          let region = this.fetch3dfootForm.value.items;
          let gender = this.fetch3dfootForm.value.items2;
          let shoe_size = this.fetch3dfootForm.value.items3;
          this.apiService.get3dfoot(region,gender,shoe_size).subscribe(data=>{
            if (data) {
              this.scan_hash = data['matched_foot'].scan_hash;
              this.launch3dfoot(this.scan_hash);
              console.log("this is the output "+ this.scan_hash);
                 }
            else{
              console.log('data not available')
            }
          })
        }
      }
      console.log(this.fetch3dfootForm.value);
    }
    else{
      console.log('error')
    }
  }
  launch3dfoot(scan_hash:any){
    let url = "https://s3.amazonaws.com/aetrex-scanneros-scans/PROD/"
    let url2 = "/CurrentTest/3DModel/left_foot.obj"
    let url3 = "/CurrentTest/3DModel/right_foot.obj"
    this.lfoot = url + scan_hash +url2;
    this.rfoot = url + scan_hash +url3;
    this.load3dFoot= true;
  }
  openDialog() {
    const dialogRef = this.dialog.open(DialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
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