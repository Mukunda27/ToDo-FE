import { Component, OnInit, ɵbypassSanitizationTrustResourceUrl } from '@angular/core';
import { faBell, faTimes, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { NotificationService } from 'src/app/notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  faBell = faBell;
  faTimes = faTimes;
  faExclamationCircle = faExclamationCircle;

  showMessage = false;
  showError = false;
  message: string;
  error: string;
  private messageTimer: NodeJS.Timer;
  private errorTimer: NodeJS.Timer;

  constructor(private notificationService: NotificationService) {

  }

  ngOnInit(): void {
    this.notificationService.showMessage.subscribe(message => {
      this.showMessageNotification(message);
    });
    this.notificationService.showError.subscribe(error => {
      this.showErrorNotification(error);
    });
  }

  showMessageNotification(message: string) {
    this.message = message;
    this.showError = false;
    this.showMessage = true;
    clearTimeout(this.errorTimer);
    this.messageTimer = setTimeout(() => {
      this.showMessage = false;
    }, 6000);
  }

  showErrorNotification(error: string) {
    this.error = error;
    this.showMessage = false;
    this.showError = true;
    clearTimeout(this.messageTimer);
    this.errorTimer = setTimeout(() => {
      this.showError = false;
    }, 6000);
  }

  closeMessage() {
    this.showMessage = false;
    clearTimeout(this.messageTimer);
  }

  closeError() {
    this.showError = false;
    clearTimeout(this.errorTimer);
  }
}
