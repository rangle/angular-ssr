import {Component, Optional, OnInit, OnDestroy} from '@angular/core';

import {MdDialog, MdDialogRef, MdSnackBar} from '@angular/material';

import {DialogContent} from './dialog-content.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  public isDarkTheme: boolean = false;

  public foods = [
    {name: 'Pizza', rating: 'Excellent'},
    {name: 'Burritos', rating: 'Great'},
    {name: 'French fries', rating: 'Pretty good'},
  ];

  public progress: number = 0;

  private timer;

  constructor(private dialog: MdDialog, private snackbar: MdSnackBar) {}

  ngOnInit() {
    const update = () => this.progress = (this.progress + Math.floor(Math.random() * 4) + 1) % 100;

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
