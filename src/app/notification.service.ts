import { Injectable } from '@angular/core';
   
import { ToastrService } from 'ngx-toastr';
   
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
   
  constructor(private toastr: ToastrService) { }
   
  showSuccess(message: string, title: string){
    this.toastr.toastrConfig.positionClass = 'toast-center-center'
    this.toastr.toastrConfig.messageClass  = 'toast-success'
      this.toastr.success(message, title, {positionClass: 'toast-center-center', messageClass: 'toast-success'})
  }
   
  showError(message: string, title: string){
      this.toastr.error(message, title)
  }
   
  showInfo(message: string, title: string){
      this.toastr.info(message, title)
  }
   
  showWarning(message: string, title: string){
      this.toastr.warning(message, title)
  }
   
}