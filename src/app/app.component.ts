import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { TableauComponent } from './tableau/tableau.component';
import { Router,NavigationEnd,ActivatedRoute } from '@angular/router';
import { SharedServiceService } from './shared-service.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild(TableauComponent) child!:TableauComponent;
  @ViewChild(MatSidenav)
 sidenav!: MatSidenav;
 title = 'material';
 reload:boolean = false;
dashboard1:boolean= true;
dashboard2:boolean= true;
dashboard3:boolean= true;


  constructor(private observer: BreakpointObserver,public router: Router,private service: SharedServiceService,private activatedRoute: ActivatedRoute) {}

  ngAfterViewInit() {
    this.observer.observe(['(max-width: 800px)']).subscribe((res) => {
      if (res.matches) {
        this.sidenav.mode = 'over';
        this.sidenav.close();
      } else {
        this.sidenav.mode = 'side';
        this.sidenav.open();
      }
    });
  }
  clickEvent(){
    this.reload = true;
    this.service.send(this.reload);
  }
}