import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';
import { HttpServicesProvider } from '../../providers/http-services';

@IonicPage()
@Component({
  selector: 'page-scanner',
  templateUrl: 'scanner.html',
})
export class ScannerPage {
  public lightFlag:boolean=false;
  public type:string='';
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public qrscanner:QRScanner,
              public platform:Platform,
              public httpService:HttpServicesProvider,
              ) {
  }
  ionViewWillEnter(){
    this.platform.registerBackButtonAction(()=>{
      this.navCtrl.popToRoot();
    })
    this.lightFlag=false;
    this.qrscanner.destroy();
    this.scanQRScanner();
    this.type=this.navParams.get('type');
  }
  ionViewDidLeave(){
    this.qrscanner.hide();
    this.qrscanner.destroy();
  }
  //回退按钮
  back(){
    this.navCtrl.pop();
  }
  //调用插件开始扫码
  scanQRScanner(){
    if(typeof this.qrscanner!=undefined){
      this.qrscanner.prepare().then((status:QRScannerStatus)=>{
        if(status.authorized){
          // alert('成功授权');
          let scanSub=this.qrscanner.scan().subscribe((text:string)=>{
            // alert(text);
            if(this.type==='leasset'){
              let url ='/query/le/leAsset/findOne?id='+text;
              this.httpService.get(url,null,res=>{
                if(res.code===0){
                  if(res.data[0]['locationtype']!='system'){
                    this.navCtrl.push('LeassetinfoPage',{'assetinfo':res.data[0]});
                  }else{
                    this.navCtrl.push('LeassetPage',{'nodetypeCA':true});
                  }
                }
              })
            }
            this.qrscanner.hide(); 
            scanSub.unsubscribe();
            this.navCtrl.pop();
          })
          this.qrscanner.show();
        }else if (status.denied){
          //提醒用户权限没有开启  
          // alert('没有权限开启')
          this.qrscanner.openSettings();
        }else{
          
        }
      },(err)=>{
        alert('出错了'+err);
      })
    }else {
      
    }
    
  }
  //手机手电筒控制
  openlight(){
    this.lightFlag=!this.lightFlag;
    if(this.lightFlag==true){
      this.qrscanner.enableLight();
    }else{
      this.qrscanner.disableLight();
    }
  }
}
