import { Injectable } from '@angular/core';
import {  throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BlockChainService {

  private apiUrl = environment.apiUrl;
  constructor(private httpSvc: HttpClient) {
  }

  makeRequest(payload: any, pageUrl: any) {
    const endpoint = this.apiUrl + pageUrl;

    if(payload.EnterpriseID == null)
    {
      payload.EnterpriseID = "3C867F52-2F94-45D0-8AE3-1F1AD885678B";
    }
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/json',
        'Authorization': 'kjdkuiujsmncbklsksjjjs'
      })
    };

    return this.httpSvc.post<any>(endpoint, payload, httpOptions)
    .pipe(
        catchError((err => {
            if (err.status === 400) {
                // auto logout if 400 response returned from api
                // this.handleError(err);
            }
            const error = err.error.message || err.statusText;
            alert(error)
            return "";
            //return throwError(error);
        })),
    );
  }


}