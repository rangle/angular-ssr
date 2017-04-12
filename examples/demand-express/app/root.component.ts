import {Component, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'application',
  template: `<router-outlet></router-outlet>`,
  styleUrls: [
    '../node_modules/@angular/material/prebuilt-themes/indigo-pink.css',
  ],
  encapsulation: ViewEncapsulation.None
})
export class RootComponent {}
