import {Component, NgModule} from '@angular/core/index';

import {BrowserModule} from '@angular/platform-browser/index';

@Component({
  moduleId: module.id,
  selector: 'application',
  template: `<div>Hello World!</div>`,
  styleUrls: ['./application-basic-external-styled.scss']
})
export class BasicExternalStyledComponent {}

@NgModule({
  imports: [BrowserModule],
  declarations: [BasicExternalStyledComponent],
  bootstrap: [BasicExternalStyledComponent]
})
export class BasicExternalStyledModule {}