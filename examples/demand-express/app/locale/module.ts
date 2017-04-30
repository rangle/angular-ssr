import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import {MdSelectModule} from '@angular/material';

import {LocaleSelectorComponent} from './selector.component';

import {LocaleService} from './service';

@NgModule({
  declarations: [LocaleSelectorComponent],
  exports: [LocaleSelectorComponent],
  imports: [CommonModule, FormsModule, MdSelectModule],
  providers: [LocaleService]
})
export class LocaleModule {}