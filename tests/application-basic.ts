import {Component, NgModule} from '@angular/core';

import {BrowserModule} from '@angular/platform-browser';

@Component({
  selector: 'application',
  template: `<div>Hello!</div>`
})
export class BasicComponent {}

@NgModule({
  imports: [BrowserModule],
  declarations: [BasicComponent],
  bootstrap: [BasicComponent]
})
export class BasicModule {}
