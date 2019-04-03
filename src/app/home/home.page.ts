import { Component, OnInit} from '@angular/core';
import { NavController, ActionSheetController, LoadingController, Platform } from '@ionic/angular';
import { Camera, PictureSourceType } from '@ionic-native/camera/ngx';
import * as Tesseract from 'tesseract.js'
import { NgProgress } from '@ngx-progressbar/core';
import { ApiService } from '../services/api.service';
import { Observable } from 'rxjs';
import { UploadReceipt } from '../model/uploadReceipt';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  receipts = [];

  results: Observable<any>;
  searchTerm: string = '';
  selectedImage: string;
  imageText: string;
fileUpload:UploadReceipt
  /**
   * Constructor of our first page
   * @param apiService The api Service to get data
   */

    constructor(private apiService: ApiService, private plt: Platform, public navCtrl: NavController, private camera: Camera, private actionSheetCtrl: ActionSheetController, public progress: NgProgress) {
    }

    ngOnInit() { }

    loadData(refresh = false, refresher?) {
    //  this.apiService.uploadReceipt(refresh).subscribe(res => {
    //    this.receipts = res;
    //   if (refresher) {
    //      refresher.target.complete();
    //    }
    //  });
    }
/*
    updateUser(id) {
      this.apiService.updateUser(id, {name: 'Simon', job: 'CEO'}).subscribe();
    }*/

    async selectSource() {
      let actionSheet = await this.actionSheetCtrl.create({
        buttons: [
          {
            text: 'Use Library',
            handler: () => {
              this.getPicture(this.camera.PictureSourceType.PHOTOLIBRARY);
            }
          }, {
            text: 'Capture Image',
            handler: () => {
              this.getPicture(this.camera.PictureSourceType.CAMERA);
            }
          }, {
            text: 'Cancel',
            role: 'cancel'
          }
        ]
      });
      await actionSheet.present();
    }

    getPicture(sourceType: PictureSourceType) {
      this.camera.getPicture({
        quality: 100,
        destinationType: this.camera.DestinationType.DATA_URL,
        sourceType: sourceType,
        allowEdit: true,
        saveToPhotoAlbum: false,
        correctOrientation: true
      }).then((imageData) => {
        this.selectedImage = 'data:image/jpeg;base64,'+imageData;
      });
    }


    recognizeImage() {
      var ddd=this.dataURLtoFile(this.selectedImage,"testingimage.jpg");
      this.fileUpload.receiptImage=ddd;
      this.results = this.apiService.uploadReceipt(this.fileUpload);

    //  this.apiService.uploadReceipt.subscribe();
    /*  Tesseract.recognize(this.selectedImage)
      .progress(message => {
        if (message.status === 'recognizing text')
        this.progress.set(message.progress);
      })
      .catch(err => console.error(err))
      .then(result => {
        this.imageText = result.text;
      })
      .finally(resultOrError => {
        this.progress.complete();
      });*/
    }
    dataURLtoFile(dataurl, filename) {
      var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while(n--){
          u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, {type:mime});
  }
}
