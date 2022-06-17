import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { ThreeDFeetService } from './threedfeet/three-d-feet.service';
import { FeetRendererComponent } from '../../app/threedfeetmodule/feet-renderer/feet-renderer.component';
@Component({
  selector: 'app-threedfeetmodule',
  templateUrl: './threedfeetmodule.component.html',
  styleUrls: ['./threedfeetmodule.component.scss']
})
export class ThreedfeetmoduleComponent implements OnInit,OnChanges{
  @Input() user:any;
  @Input() lfoot:any;
  @Input() rfoot:any;
  leftFoot:any;
  rightFoot:any;
  isLoaded = false;
  public treeDPosition = 'Init';
  threeDPosition = "Length";
  constructor(private threeDService: ThreeDFeetService, private appService: AppService ) {

    //handle drag/drop events
    this.threeDService.position.subscribe(pos => {
      this.threeDPosition = pos;
    })
  }

  ngOnInit() {
    this.leftFoot = this.lfoot;
    this.rightFoot = this.rfoot;
          // this.appService.getProfileLastScan(this.user).subscribe(data => {
      //   if (data['footdata']) {
      //     this.lfoot = data['footdata'].leftfoot.objurl;
      //     this.rfoot = data['footdata'].rightfoot.objurl;
      //     this.isLoaded = true;
      //   }
      // })
  }
  ngOnChanges() {
    this.leftFoot = this.lfoot;
    this.rightFoot = this.rfoot;
    /**********THIS FUNCTION WILL TRIGGER WHEN PARENT COMPONENT UPDATES 'someInput'**************/
    //Write your code here
    //  console.log(this.someInput);
    }   
}
