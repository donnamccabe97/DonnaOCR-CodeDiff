import { OfflineManagerService } from './offline-manager.service';
import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { NetworkService, ConnectionStatus } from './network.service';
import { Storage } from '@ionic/storage';
import { Observable, from ,throwError} from 'rxjs';
import { tap, map, catchError,retry } from "rxjs/operators";
import { UploadReceipt } from '../model/uploadReceipt';

const API_STORAGE_KEY = 'GN7ZWzYScNWcogyYvlvxOXNsdIY1HlZ5mTcegi6Omx0ewagQCcTSHaTLMxLytZOL';
const API_URL = 'https://api.tabscanner.com/';
const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'multipart/form-data' })
  };



@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient, private networkService: NetworkService, private storage: Storage, private offlineManager: OfflineManagerService) { }

  // Save result of API requests
  private setLocalData(key, data) {
    this.storage.set(`${API_STORAGE_KEY}-${key}`, data);
  }

  // Get cached API result
  private getLocalData(key) {
    return this.storage.get(`${API_STORAGE_KEY}-${key}`);
  }

  uploadReceipt(data: UploadReceipt): Observable<any[]> {
    let url = API_URL+API_STORAGE_KEY;
    if (this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Offline) {
      return from(this.offlineManager.storeRequest(url, 'POST', data));
    } else {
    return this.http.post<any[]>(API_URL+API_STORAGE_KEY+"/process", data, httpOptions)
    .pipe(  retry(1),
      catchError(err => {
        this.offlineManager.storeRequest(url, 'POST', data);
        throw new Error(err);
      })
    );
    }
  }

  getResult(token:string): Observable<any[]> {
    if (this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Offline || !token) {
      // Return the cached data from Storage
      return from(this.getLocalData('users'));//receipts
    } else {
      // Just to get some "random" data
      let page = Math.floor(Math.random() * Math.floor(6));

      return this.http.get<any[]>(API_URL+API_STORAGE_KEY+'/result/'+token)
      .pipe(
        map(res => res['data']),
        tap(res => {
          this.setLocalData('receipts', res);//receipts
        })
      );
    }
  }

  handleError(error) {

    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }



}
