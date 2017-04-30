import {Component, NgZone, ViewEncapsulation} from '@angular/core';

import {MdDialog, MdSnackBar} from '@angular/material';

import {DialogContent} from './dialog/dialog-content.component';

@Component({
  selector: 'application',
  templateUrl: 'root.component.html',
  styleUrls: [
    '../node_modules/@angular/material/prebuilt-themes/indigo-pink.css',
    './root.component.css'
  ],
  encapsulation: ViewEncapsulation.None
})
export class RootComponent {
  public foods = [
    {name: 'Pizza', rating: 'Excellent'},
    {name: 'Burritos', rating: 'Great'},
    {name: 'French fries', rating: 'Pretty good'},
  ];

  public progress: number = 0;

  private timer;

  constructor(
    private dialog: MdDialog,
    private snackbar: MdSnackBar,
    private zone: NgZone
  ) {}

  ngOnInit() {
    const update = () => this.zone.run(() => {
      this.progress = (this.progress + Math.floor(Math.random() * 4) + 1) % 100;
    });

    this.timer = setInterval(() => update, 200);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  openDialog() {
    this.dialog.open(DialogContent);
  }

  showSnackbar() {
    this.snackbar.open('Yum snacks', 'Chew');
  }
}
