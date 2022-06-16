import { Component, OnInit } from '@angular/core';
import { ApiService } from "../../auth/api.service";
import {TableauComponent} from "../../tableau/tableau.component"
import { Subscription }   from 'rxjs';
import { SharedServiceService } from '../../shared-service.service'
import {Router, NavigationEnd,ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { Observable, throwError } from 'rxjs';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  subscription:Subscription;
  reload:any;
  data:any;
  staticdata = {
    "AnkleGirth": {
        "Female": 24.5936,
        "Male": 26.8557
    },
    "ArchHeight": {
        "Female": 1.96987,
        "Male": 2.14442
    },
    "BallGirth": {
        "Female": 22.427,
        "Male": 24.8075
    },
    "BallHeight": {
        "Female": 4.29078,
        "Male": 4.7201
    },
    "BallWidth": {
        "Female": 9.06376,
        "Male": 10.0011
    },
    "DorsalHeight": {
        "Female": 6.25621,
        "Male": 6.98525
    },
    "Girth": {
        "Female": 23.2937,
        "Male": 26.16
    },
    "HeelWidth": {
        "Female": 6.39459,
        "Male": 7.0136
    },
    "InstepWidth": {
        "Female": 8.29558,
        "Male": 9.32744
    },
    "Length": {
        "Female": 24.2915,
        "Male": 26.8672
    },
    "LengthToFifthMetHead": {
        "Female": 15.2855,
        "Male": 16.9114
    },
    "LengthToFirstMetHead": {
        "Female": 17.4691,
        "Male": 19.3273
    },
    "LongHeelGirth": {
        "Female": 31.9515,
        "Male": 35.5106
    },
    "MaxToeHeight": {
        "Female": 3.03087,
        "Male": 3.36414
    },
    "ShortHeelGirth": {
        "Female": 30.7264,
        "Male": 34.1059
    },
    "US Size": {
        "Female": 8.5,
        "Male": 2121.5
    },
    "Width": {
        "Female": 9.3363,
        "Male": 10.3037
    }
}
  constructor(public dialog: MatDialog ,private apiService:ApiService,private router: Router,private shared:SharedServiceService,private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.router.navigate(['/dashboard']);
     if (!localStorage.getItem('foo')) { 
    localStorage.setItem('foo', 'no reload') 
    location.reload() 
  } else {
    localStorage.removeItem('foo') 
  }
  this.apiService.getsummarystatus().subscribe(data=>{
    if (data) {
      this.data = data;
         }
    else{
      this.data = this.staticdata;
      console.log('data not available')
    }
  })
    // this.subscription =  this.shared.subj$.subscribe(val=>{
    //   alert(val);
    //   this.reload = val;
    //   if(this.reload){
    //     window.location.reload();
    //   }
    //   console.log(val);
    // })
  }
  logout(){
    this.apiService.logout();
  }
  openDialog() {
    const dialogRef = this.dialog.open(DialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
