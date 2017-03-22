import {Component, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'application',
  template: `<router-outlet></router-outlet>`,
  styleUrls: [
    '../node_modules/@angular/material/core/theming/prebuilt/deeppurple-amber.css'
  ],
  encapsulation: ViewEncapsulation.None
})
export class RootComponent {}
