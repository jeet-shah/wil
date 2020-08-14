import React from 'react';
import { Text, View,StyleSheet,TouchableOpacity,Image,TextInput,KeyboardAvoidingView,ToastAndroid } from 'react-native';
import {BarCodeScanner} from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import db from '../config';
import firebase from 'firebase';

export default class BookTransactionScreen extends React.Component {
  constructor(){
    super()
    this.state={hascamerapermission:null,
      scanned:false,
      scanneddata:'',
      buttonstate:"normal",
      scannedbookid:'',
      scannedstudentid:'',
      transactionmsg:''
    }
  }
  initiatebookissue=()=>{
    db.collection("transaction").add({
      'studentID':this.state.scannedstudentid,
      'bookId':this.state.scannedbookid,
      'date':firebase.firestore.Timestamp.now().toDate(),
      'transactiontype':"issue",
    })
    db.collection("books").doc(this.state.scannedbookid).update({
      'bookAvailability':false,
    })
    db.collection("students").doc(this.state.scannedstudentid).update({
      'noofbooksissued':firebase.firestore.FieldValue.increment(1)
    })
  }
  initiatebookreturn=()=>{
    db.collection("transaction").add({
      'studentID':this.state.scannedstudentid,
      'bookId':this.state.scannedbookid,
      'date':firebase.firestore.Timestamp.now().toDate(),
      'transactiontype':"return",
    })
    db.collection("books").doc(this.state.scannedbookid).update({
      'bookAvailability':true,
    })
    db.collection("students").doc(this.state.scannedstudentid).update({
      'noofbooksissued':firebase.firestore.FieldValue.increment(-1)
    })
  }
  getcamerapermission = async(ID)=>{
    const {status} = await Permissions.askAsync(Permissions.CAMERA)
    this.setState({
      hascamerapermission:status === "granted",
      buttonstate:ID,
      scanned:false  
    })
  }
  handlebarcodescan=async({type,data})=>{
    const {buttonstate}= this.state.buttonstate
    if(buttonstate === "bookID"){
      this.setState({
        scanned:true,
        scannedbookid:data,
        buttonstate:"normal"
      })
    }else{
      this.setState({
        scanned:true,
        scannedstudentid:data,
        buttonstate:"normal"
      }) 
    }
  }
  handletransactions=()=>{
    var transactionmsg = null
    db.collection("books").doc(this.state.scannedbookid).get().then((doc)=>{
      var book = doc.data()
      if(book.bookAvailability === true){
        this.initiatebookissue()
        transactionmsg = "Book Issued"
        ToastAndroid.show(transactionmsg,ToastAndroid.SHORT)
      }else{
        this.initiatebookrtn()
        transactionmsg = "Book Returned"
        ToastAndroid.show(transactionmsg,ToastAndroid.SHORT)
      }
    })
    this.setState({
      transactionmsg:transactionmsg
    })
  }
    render() {
      const hascamerapermission = this.state.hascamerapermission
      const scanned = this.state.scanned
      const buttonstate = this.state.buttonstate
      if(buttonstate === 'clicked' && hascamerapermission){
        return(
          <BarCodeScanner
          onBarCodeScanned ={scanned ? undefined:this.handlebarcodescan}
          style={StyleSheet.absoluteFillObject}
          />
        )
      }else if(buttonstate === 'normal'){
        return (
          <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View>
              <Image source={require("../assets/booklogo.jpg")} style={{width:20,height:200}}/>
              <Text style={{textAlign:"center",fontSize:30}}> Wily </Text>
            </View>
            <View style={styles.inputview}>
              <TextInput style={styles.inputbox}
              placeholder="Book id"
              onChangeText={text=>this.setState({
                scannedbookid:text
              })}
              value={this.state.scannedbookid}
              />
              <TouchableOpacity style={styles.scanbutton} onPress={this.getcamerapermission("bookID")}>
                <Text style={styles.buttontext}> Scan </Text>
              </TouchableOpacity>
              <TextInput style={styles.inputbox} 
              placeholder="Student id"
              onChangeText={text=>this.setState({
                scannedstudentid:text
              })}
              value={this.state.scannedstudentid}
              />
              <TouchableOpacity style={styles.scanbutton} onPress={this.getcamerapermission("studentID")}>
                <Text style={styles.buttontext}> Scan </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submit} onPress={async()=>{var transactionmsg= this.handletransactions()}}>
                <Text style={styles.submittext}> Submit </Text>
              </TouchableOpacity>
            </View>
          </View>
          </KeyboardAvoidingView>
        );
      }
    }
  }
  const styles = StyleSheet.create({
    displayText:{
      fontSize:15,
      textDecorationLine:'underline',
    },
    scanbutton:{
      backgroundColor:'aqua',
      padding:10,
      margin:10
    },
    buttontext:{
      fontSize:20
    },
    inputview:{
      flexDirection:"row",
      margin:20,
    },
    inputbox:{
      width:200,
      height:40,
      borderBottomWidth:1.5,
      borderRightWidth:0,
      fontSize:20
    },
    scanbutton:{
      backgroundColor:'#66bb6a',
      width:50,
      borderWidth:1.5,
      borderLeftWidth:0
    },
    submit:{
      backgroundColor:'#fbc02d',
      width:100,
      height:50
    },
    submittext:{
      padding:10,
      textAlign:"center",
      fontSize:20,
      fontWeight:'bold',
      color:'white'
    },
    container:{
      flex:1,
      justifyContent:"center",
      alignItems:"center"
    }
  })