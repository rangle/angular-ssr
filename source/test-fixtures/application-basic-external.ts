import {ApplicationModule, Component, NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';

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