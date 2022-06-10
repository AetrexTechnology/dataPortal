import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
showHeader:boolean= false;
  constructor() {}

  ngOnInit(): void {
  }
  @HostListener('window:scroll', ['$event']) 
    scrollHandler(event:any) {
      this.showHeader= true;
      console.debug("Scroll Event");
    }

    
}
