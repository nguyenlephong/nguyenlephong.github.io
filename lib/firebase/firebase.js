import configs from "../config/app-config"
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/analytics";
import 'firebase/firestore';
import 'firebase/database';
import 'firebase/storage';

let database, firestore, storage, messaging, firebaseConfig;

if (configs.feature.IS_USING_FIREBASE) {
  if (!firebase.apps.length) {
    firebase.initializeApp(configs.firebaseConfig);
    
    database = firebase?.database();
    
    firestore = firebase?.firestore();
    
    storage = firebase?.storage();
   
  }
}

export {database, firestore, storage, messaging, firebaseConfig};