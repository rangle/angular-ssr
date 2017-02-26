import {ApplicationModule, Component, NgModule} from '@angular/core/index';

import {CommonModule} from '@angular/common/index';

@Component({
  moduleId: module.id,
  selector: 'application',
  templateUrl: './application-basic-external.html'
})
export class BasicExternalComponent {}

@NgModule({
  imports: [ApplicationModule, CommonModule],
  declarations: [BasicExternalComponent],
  bootstrap: [BasicExternalComponent]
})
export class BasicExternalModule {}