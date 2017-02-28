import {Component, NgModule} from '@angular/core/index';

import {BrowserModule} from '@angular/platform-browser/index';

@Component({
  moduleId: module.id,
  selector: 'application',
  templateUrl: './application-basic-external.html'
})
export class BasicExternalComponent {}

@NgModule({
  imports: [BrowserModule],
  declarations: [BasicExternalComponent],
  bootstrap: [BasicExternalComponent]
})
export class BasicExternalModule {}