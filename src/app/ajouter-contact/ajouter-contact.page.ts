import { Component, OnInit } from '@angular/core';
import { ContactAuthService } from '../services/contact-auth.service';
import { ContactAcessService } from '../services/contact-acess.service';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

import { NavController } from '@ionic/angular';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-ajouter-contact',
  templateUrl: './ajouter-contact.page.html',
  styleUrls: ['./ajouter-contact.page.scss'],
})
export class AjouterContactPage implements OnInit {
  ajouterContactForm: FormGroup;

  ngFireUploadTask: AngularFireUploadTask;
  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;

  FileName: string;
  FileSize: number;
  FilePath: string;
  isImgUploading: boolean;
  isImgUploaded: boolean;

  image_source: string;
  progressSnapshot: Observable<any>;

  constructor(
    private fireauth: ContactAuthService,
    private firestore: ContactAcessService,
    private navCtrl: NavController,
    private formBuilder: FormBuilder,
    private angularFireStorage: AngularFireStorage,
    private storage: AngularFireStorage
  ) {
    this.isImgUploading = false;
    this.isImgUploaded = false;
    this.ajouterContactForm = this.formBuilder.group({
      nom: [''],
      prenom: [''],
      email: [''],
      tel: [''],
      adresse: [''],
      ville: [''],
      service: [''],
      imageURL: [''],
    });
  }

  ngOnInit() {}

  loadImageFromDevice(event) {
    const file = event.target.files[0];
    this.FileName = file.name;
    this.isImgUploading = true;
    this.isImgUploaded = false;

    const filePath = `filesStorage/${new Date().getTime()}`;
    const ref = this.storage.ref(filePath);
    const fileRef = this.storage.ref(filePath);

    //this.ajouterContactForm.value.imageURL = 'testImage';
    const task = this.storage.upload(filePath, file);
    this.FilePath = filePath;
    //console.log(this.FilePath);
    //this.storage.ref('filesStorage/1644066420289').getDownloadURL().subscribe((imgUrl) => {console.log(imgUrl);});
    this.uploadPercent = task.percentageChanges();
    // get notified when the download URL is available
    //console.log(filePath); // filesStorage/1643985890814_ok.PNG
  }

  nouveauContact() {
    this.fireauth.userDetails().subscribe(
      (res) => {
        this.storage
          .ref(this.FilePath)
          .getDownloadURL()
          .subscribe((imgUrl) => {
            if (res !== null) {
              this.ajouterContactForm.value.imageURL = imgUrl;
              this.firestore.newPersonalContact(
                res.email,
                this.ajouterContactForm.value
              );
              this.navCtrl.navigateForward('/liste-contacts');
            } else {
              this.navCtrl.navigateForward('/authentification');
            }
          });

        console.log('second');
      },
      (err) => {
        console.log('err', err);
      }
    );
  }
}
