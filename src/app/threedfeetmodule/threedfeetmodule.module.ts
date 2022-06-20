import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ThreedfeetmoduleRoutingModule } from './threedfeetmodule-routing.module';
import { ThreedfeetmoduleComponent } from './threedfeetmodule.component';
import { ThreeDFeetService } from './threedfeet/three-d-feet.service';
import { FootService } from './threedfeet/foot.service';
import { FeetRendererComponent } from '../threedfeetmodule/threedfeet/feet-renderer/feet-renderer.component';

@NgModule({
  declarations: [
    FeetRendererComponent,
    ThreedfeetmoduleComponent
  ],
  imports: [
    CommonModule,
    ThreedfeetmoduleRoutingModule
  ], 
  exports:[ThreedfeetmoduleComponent],
  providers: [
    ThreeDFeetService, FootService
  ]
})
export class ThreedfeetmoduleModule { }
