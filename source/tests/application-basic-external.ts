import {Component, NgModule} from '@angular/core';

import {BrowserModule} from '@angular/platform-browser';

@Component({
  moduleId: module.id,
  selector: 'application',
  templateUrl: './application-basic-external.html'
})
export class BasicExternalComponent {}

@NgModule({
  imports: [BrowserModule],
  declarations: [BasicExternalComponent],
  bootstrap: [BasicExternalComponent],
})
export class BasicExternalModule {}
