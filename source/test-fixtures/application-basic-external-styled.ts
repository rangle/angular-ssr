import {ApplicationModule, Component, NgModule} from '@angular/core/index';

import {CommonModule} from '@angular/common/index';

@Component({
  moduleId: module.id,
  selector: 'application',
  template: `<div>Hello World!</div>`,
  styleUrls: ['./application-basic-external-styled.scss']
})
export class BasicExternalStyledComponent {}

@NgModule({
  imports: [ApplicationModule, CommonModule],
  declarations: [BasicExternalStyledComponent],
  bootstrap: [BasicExternalStyledComponent]
})
export class BasicExternalStyledModule {}