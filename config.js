import firebase from 'firebase'
require('@firebase/firestore')

var firebaseConfig = {
    apiKey: "AIzaSyAQ0PFhdQ-y3u_5RViyfnj126M-OwKDyS0",
    authDomain: "wili-123.firebaseapp.com",
    databaseURL: "https://wili-123.firebaseio.com",
    projectId: "wili-123",
    storageBucket: "wili-123.appspot.com",
    messagingSenderId: "372264296617",
    appId: "1:372264296617:web:87e8ea5f03e83d9051c9b8"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore()