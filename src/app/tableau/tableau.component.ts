import { Component, Input, OnInit,OnChanges, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { SharedServiceService } from '../shared-service.service'; 
import { Subscription }   from 'rxjs';

@Component({
  selector: 'app-tableau',
  templateUrl: './tableau.component.html',
  styleUrls: ['./tableau.component.scss']
})
export class TableauComponent implements  OnInit {
reload:any;
  constructor(public router: Router,private shared:SharedServiceService) {}
    subscription: Subscription;
  ngOnInit(): void {
    this.router.navigate(['/dashboard2']);
    if (!localStorage.getItem('foo')) { 
      localStorage.setItem('foo', 'no reload') 
      location.reload() 
    } else {
      localStorage.removeItem('foo') 
    }
    // this.subscription =  this.shared.subj$.subscribe(val=>{
    //   alert(val);
    //   this.reload = val;
    //   if(this.reload){
    //     window.location.reload();
    //   }
    //   console.log(val);
    // })
  }
}
