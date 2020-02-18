import { Injectable } from '@angular/core';
import { Http, Jsonp, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Utils } from "./Utils";
import { ConfigProvider } from './config';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { AlertController, ToastController, Events, Platform } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';
import { LoadingController } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { PhoneDeviceProvider } from './phone-device';
@Injectable()
export class HttpServicesProvider {

  public CONTENTTYPE_FORMURLENCODE = 'application/x-www-form-urlencoded;charset=UTF-8';
  //设置post的格式
  public formurlencodeheaders = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' });
  private headers = new Headers({ 'Content-Type': 'application/json;charset=UTF-8' });
  public filepath: string;
  public environment = {};
  public cordova: any;
  public timer=null;
  constructor(public http: Http,
    public jsonp: Jsonp,
    public config: ConfigProvider,
    private transfer: FileTransfer,
    public alertCtrl: AlertController,
    public appVersion: AppVersion,
    public loading: LoadingController,
    public file: File,
    public fileopen: FileOpener,
    public toastCtrl: ToastController,
    public permission: AndroidPermissions,
    public events: Events,
    public phoneDevice:PhoneDeviceProvider,
    public platform:Platform
  ) {
    if (ConfigProvider.environment == 'formalEnvironment') {
      this.environment['shortcut'] = 'rbKv';
      this.environment['apikey'] = '0172b4fa887c2d07aef5d69d5987ec72';
      this.environment['appkey'] = '0118fc17e7b7bcad28a459b799628fe8';
    } else if (ConfigProvider.environment == 'jmtcEnvironment') {
      this.environment['shortcut'] = 'evr4';
      this.environment['apikey'] = '0172b4fa887c2d07aef5d69d5987ec72';
      this.environment['appkey'] = '65ac4880ec328478f7cf3023f397a040';
    } else if (ConfigProvider.environment == 'yskbEnvironment') {
      this.environment['shortcut'] = 'bBhZ';
      this.environment['apikey'] = '0172b4fa887c2d07aef5d69d5987ec72';
      this.environment['appkey'] = 'cd8a32f0b57d4fb387d4fe51d89b7450';
    }
    else if (ConfigProvider.environment == 'delopmentEnvironment') {
      this.environment['shortcut'] = 'AxIZ';
      this.environment['apikey'] = '0172b4fa887c2d07aef5d69d5987ec72';
      this.environment['appkey'] = '0c79ea39b2e53b7ce4886ffea16dcf89';
    }
    else if (ConfigProvider.environment == 'hhwEnvironment') {
      this.environment['shortcut'] = '837R';
      this.environment['apikey'] = '0172b4fa887c2d07aef5d69d5987ec72';
      this.environment['appkey'] = 'bad7116b7204b8156ac478d67db82f41';
    }
  }
  //手机权限检查
  checkPermissions() {
    this.permission.requestPermission(this.permission.PERMISSION.READ_EXTERNAL_STORAGE).then(res => { console.log(res) });
    this.permission.requestPermission(this.permission.PERMISSION.WRITE_EXTERNAL_STORAGE).then(res => { console.log(res) });
  }
  //检查是否需要更新
  Upgrader() {
    this.appVersion.getVersionNumber().then((app) => {
      var url = 'http://www.pgyer.com/apiv2/app/getByShortcut'
      this.http.post(url, 'buildShortcutUrl=' + this.environment['shortcut'] + '&&_api_key=' + this.environment['apikey'], { headers: this.formurlencodeheaders }).subscribe((res) => {
        console.log(res.json());
        if (res.json().data.buildVersion) {
          console.log(res.json().data.buildVersion);
          if (app < res.json().data.buildVersion) {
            this.showUpdateComfirm(res.json().data);
          }
        }
      });
    })

  }
  //检查蒲公英版本更新
  showUpdateComfirm(appdata) {
    let now = 0;
    this.alertCtrl.create({
      title: '发现新版本v' + appdata.buildVersion + '   大小:' + ((appdata.buildFileSize) / 1024 / 1024).toFixed(1) + 'MB',
      subTitle: appdata.buildUpdateDescription,
      cssClass: 'AlertList',
      buttons: [{
        text: '确定更新',
        handler: () => {
          let loading = this.loading.create({
            content: '下载进度:0%',
            dismissOnPageChange: true
          })
          loading.present();
          var url = 'http://www.pgyer.com/apiv2/app/install?appKey=' + this.environment['appkey'] + '&_api_key=' + this.environment['apikey']+'&buildPassword=bkc';

          this.filepath = this.file.externalDataDirectory + 'tiankaiyun.apk';
          let filetransfer: FileTransferObject = this.transfer.create();
          filetransfer.onProgress((progressEvent) => {
            if (progressEvent.lengthComputable) {
              now = progressEvent.loaded / progressEvent.total * 100;
            }
          })
          filetransfer.download(url, this.filepath, true).then(() => {
            this.checkPermissions();
            this.fileopen.open(this.filepath, 'application/vnd.android.package-archive').then((data) => {
              console.log(data + '1111111');
            }, (err) => {
              console.log(err);
              console.log('文件打开失败');
              this.toastCtrl.create({
                position: 'middle',
                message: '文件打开失败',
                duration: 2000
              }).present();
            })
          }, (err) => {
            this.toastCtrl.create({
              position: 'middle',
              message: '文件下载失败',
              duration: 2000
            }).present();
          })
          let timer = setInterval(() => {
            loading.setContent('下载进度:' + Math.floor(now) + '%');
            if (now > 100) {
              clearInterval(timer);
              console.log('filePath' + this.filepath);

            }
          }, 300)
        }
      }, {
        text: '稍后更新',
        handler: () => {
        }
      }]
    }).present();
  }
  getApkfrom
  /**
   * 
   * @param url 
   * // apiUrl :   api/focus
     // apiUrl :   api/plist?page=1
   * @param paramMap 
   * @param callback 
   */
  get(url: string, paramMap?: any, callback?: any) {
    url = Utils.dealUrl(url);
    this.http.get(url, new RequestOptions({
      search: HttpServicesProvider.buildURLSearchParams(paramMap),
      headers: this.headers,
    })).subscribe((result) => {
      callback(result.json());
    })
  }

  //post 提交数据
  post(url: string, data?: any, callback?: any, contenttype?: string) {
    url = Utils.dealUrl(url);
    var posthead = null;
    var postdata = null;
    if (contenttype != null && contenttype == this.CONTENTTYPE_FORMURLENCODE) {
      posthead = this.formurlencodeheaders;
      postdata = null;
      postdata = Object.keys(data).map(function (key) {
        return encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
      }).join("&");
    } else {
      posthead = this.headers;
      postdata = JSON.stringify(data);
    }
    this.http.post(url, postdata, { headers: posthead }).subscribe((result) => {
      callback(result.json());
    });
  }

  postform(url: string, prefix?: string, data?: any, callback?: any) {
    url = Utils.dealUrl(url);
    var posthead = this.formurlencodeheaders;
    var postdata = Object.keys(data).map(function (key) {
      if (prefix == null || prefix == "") {
        return encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
      } else {
        var value = encodeURIComponent(data[key]);
        if (value == null || value == 'null') {
          value = "";
        }
        if (key == 'version') {
          return encodeURIComponent(key) + "=" + value;
        } else {
          return encodeURIComponent(prefix + "." + key) + "=" + value;
        }
      }
    }).join("&");
    // console.log(postdata);
    this.http.post(url, postdata, { headers: posthead }).subscribe((result) => {
      callback(result.json());
    });
  }

  /**
   * 上传附件图片
   * @param busstype 
   * @param bussid 
   * @param imageData 
   */
  uploadify(busstype: string, bussid: String, imageData: any, callback?: any) {

    const fileTransfer: FileTransferObject = this.transfer.create();
    var api = '/uploadify/upload?busstype=' + busstype + "&bussid=" + bussid;
    api = Utils.dealUrl(api);
    let filename = Utils.dateFormat(new Date(), 'yyyy-MM-dd hh_mm_ss');
    let options: FileUploadOptions = {
      fileKey: 'file',
      fileName: filename + '.jpg',
      mimeType: 'image/jpeg',
      httpMethod: "POST",
    }
    fileTransfer.upload(imageData, encodeURI(api), options).then((result) => {
      callback(result);
    });
  }
  /**
   * 上传视频文件
   * @param busstype 
   * @param bussid 
   * @param imageData 
   * @param callback 
   */
  uploadvideo(busstype: string, bussid: String, imageData: any, callback?: any) {
    const fileTransfer: FileTransferObject = this.transfer.create();
    var api = '/uploadify/upload?busstype=' + busstype + "&bussid=" + bussid;
    api = Utils.dealUrl(api);
    let filename = Utils.dateFormat(new Date(), 'yyyy-MM-ddhh:mm:ss');
    let options: FileUploadOptions = {
      fileKey: 'file',
      fileName: filename + '.mp4',
      mimeType: 'video/mp4'
    }
    fileTransfer.upload(imageData, encodeURI(api), options).then((res) => {
      callback(res);
    }).then((err) => {
      console.log(err);
    })
  }
  /**
   * 上传音频文件
   * @param busstype 
   * @param bussid 
   * @param callback 
   */
  uploadmedia(busstype: string, bussid: String, imageData: any, filename: any, callback?: any) {
    const fileTransfer: FileTransferObject = this.transfer.create();
    var api = '/uploadify/upload?busstype=' + busstype + "&bussid=" + bussid;
    api = Utils.dealUrl(api);
    // let filename = Utils.dateFormat(new Date(), 'yyyy-MM-dd hh:mm:ss');
    let options: FileUploadOptions = {
      fileKey: 'file',
      fileName: filename,
      mimeType: 'audio/wav'
    }
    fileTransfer.upload(imageData, encodeURI(api), options).then((res) => {
      callback(res);
    }).then((err) => {
      console.log(err);
    })
  }
  /**
   * 获取附件列表信息
   * @param busstype 
   * @param bussid 
   * @param callback 
   */
  getFiles(busstype: string, bussid: String, callback: any) {
    var url = "/kindeditor/initfiles?busstype=" + busstype + "&bussid=" + bussid;

    this.post(url, null, (result) => {
      if (result.code == 0) {
        for (let i = 0; i < result.data.length; i++) {
          if (result.data.length > 0) {
            if (ConfigProvider.environment == 'testEnvironment' || ConfigProvider.environment == 'delopmentEnvironment') {
              result.data[i]['url']='http://120.79.223.161'+result.data[i]['url'];
              // result.data[i]['url'] = 'http://jmtc.gdwm.cn:4434' + result.data[i]['url'];
              // result.data[i]['url']='http://tikyun.com'+result.data[i]['url'];
            } else if (ConfigProvider.environment == 'jmtcEnvironment') {
              result.data[i]['url'] = 'http://jmtc.gdwm.cn:4434' + result.data[i]['url'];
              // result.data[i]['url']='http://tikyun.com:8080'+result.data[i]['url'];
              // result.data[i]['url']='http://tikyun.com:8081'+result.data[i]['url']; 
            } else if (ConfigProvider.environment == 'formalEnvironment') {
              // result.data[i]['url']='http://www.tikyun.com'+result.data[i]['url'];
              // result.data[i]['url']='http://tikyun.com'+result.data[i]['url'];
              result.data[i]['url'] = 'http://120.79.223.161' + result.data[i]['url'];
              // result.data[i]['url']='http://tikyun.com:8081'+result.data[i]['url']; 
            } else if (ConfigProvider.environment == 'yskbEnvironment') {
              // result.data[i]['url']='http://www.tikyun.com'+result.data[i]['url'];
              result.data[i]['url'] = 'http://tikyun.com:8081' + result.data[i]['url'];
              // result.data[i]['url']='http://tikyun.com:8081'+result.data[i]['url']; 
            } else if (ConfigProvider.environment === 'hhwEnvironment') {
              result.data[i]['url'] = 'http://10.28.15.16' + result.data[i]['url'];
            }
          }
        }
      }
      callback(result);
    }, null);
  }
  /**
   * @param bussid
   * @param busstype
   *
   * @param callback
   */
  getOtherFiles(bussid, busstype, callback) {
    let url = '/kindeditor/initfiles';
    let obj = { "bussid": bussid, "busstype": busstype };
    // let data =JSON.stringify
    this.post(url, obj, res => {
      callback(res);
    }, this.CONTENTTYPE_FORMURLENCODE);
  }
  public static buildURLSearchParams(paramMap): URLSearchParams {
    let params = new URLSearchParams();
    if (!paramMap) {
      return params;
    }
    for (let key in paramMap) {
      let val = paramMap[key];
      if (val instanceof Date) {
        val = Utils.dateFormat(val, 'yyyy-MM-dd hh:mm:ss')
      }
      params.set(key, val);
    }
    return params;
  }

  //获取数据字典信息
  getDict(dictcode: string, callback?: any) {
    var url = "/dict/getDict/" + dictcode;
    return this.get(url, null, (result) => {
      return callback(result);
    });
  }

  //获取数据字典名称
  getDictName(dictcode: string, dictvalue: string, callback?: any) {
    var url = "/dict/getDict/" + dictcode;
    this.get(url, null, (result) => {
      var dictname = "";
      if (result.length > 0) {
        for (var i = 0; i < result.length; i++) {
          if (result[i].value == dictvalue) {
            dictname = result[i].name;
          }
        }
      }
      callback(dictname);
    });
  }

  //根据部门id获取部门名称
  getDeptName(deptid: string, callback?: any) {
    var url = "/dept/getDeptName/" + deptid;
    this.get(url, null, (result) => {
      callback(result);
    });
  }

  //获取用户名称
  getUsername(userid: string, callback?: any) {
    var url = "/user/getUserName/" + userid;
    return new Promise((resolve, reject) => {
      this.get(url, null, (result) => {

        if (result.code == 0) {
          // callback(result);
          resolve(result.data);
        }
      });
    })
  }
  //获取用户名称
  getUserName(userid: string, callback?: any) {
    var url = "/user/getUserName/" + userid;

    this.get(url, null, (result) => {

      if (result.code == 0) {
        callback(result);
      }
    });

  }

  //获取根据id获取厂站信息
  getSiteName(siteid: string, callback?: any) {
    var url = "/query/system/site/findOne?id=" + siteid;
    this.get(url, null, (result) => {
      callback(result);
    });
  }

  //获取企业信息目录名称
  getEnterprise(enterid: string, callback?: any) {
    var url = "/query/bdm/bdmEnterprisedir/findOne?id=" + enterid;
    this.get(url, null, (result) => {
      callback(result);
    });
  }
  //获取表单控制
  getPageControl(pagecode: string, wfstatus: string, callback?: any) {
    var url = "/page/pageControl/" + pagecode;
    if (wfstatus != null || wfstatus != "") {
      url = url + "?wfstatus=" + wfstatus;
    }
    this.get(url, null, (result) => {
      callback(result);
    });
  }
  /**获取物资编码
   * @param 表明tablecode
   * @param 列名colcode
   * @param 回调callback
   */
  getSeqNum(tablecode, colcode, callback) {
    let url = '/seqnum/siteCodeGenerator/' + tablecode + '/' + colcode
    this.get(url, null, res => {
      if (res.code == 0) {
        callback(res.data);
      } else {
        callback('');
      }
    })
  }
  /**获取我的任务
   * @param key string类型用可以传多个用字符串隔开
   * @param callback
   */
  getTodoList(key = '', callback) {
    let url = '/workflow/task/todo/list'
    if (key != '') {
      url = url + '?key=' + key;
    }
    this.get(url, null, res => {
      callback(res);
    })

  }
  //删除附件
  deleteImage(data?: any, callback?: any, contenttype?: string) {

    let url = '/attach/removeids';
    url = Utils.dealUrl(url);
    var posthead = null;
    var postdata = null;
    if (contenttype != null && contenttype == this.CONTENTTYPE_FORMURLENCODE) {
      posthead = this.formurlencodeheaders;
      postdata = null;
      postdata = Object.keys(data).map(function (key) {
        return encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
      }).join("&");
    } else {
      posthead = this.headers;
      postdata = JSON.stringify(data);
    }
    this.http.post(url, postdata, { headers: posthead }).subscribe((result) => {
      callback(result.json());
    });
  }
  //删除ids
  removeIds(data?: any, callback?: any, contenttype?: any) {
    let url = '/prjRecord/remove?ids=' + data;
    url = Utils.dealUrl(url);
    var posthead = null;
    var postdata = null;
    if (contenttype != null && contenttype == this.CONTENTTYPE_FORMURLENCODE) {
      posthead = this.formurlencodeheaders;
      postdata = null;
      postdata = Object.keys(data).map(function (key) {
        return encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
      }).join("&");
    } else {
      posthead = this.headers;
      postdata = JSON.stringify(data);
    }
    this.http.post(url, null, { headers: posthead }).subscribe((result) => {
      callback(result.json());
    });
  }
  remove(data?: any, callback?: any, contenttype?: any) {
    let url = '/prjRecord/remove?ids=' + data;
    url = Utils.dealUrl(url);
    var posthead = null;
    var postdata = null;
    if (contenttype != null && contenttype == this.CONTENTTYPE_FORMURLENCODE) {
      posthead = this.formurlencodeheaders;
      postdata = null;
      postdata = Object.keys(data).map(function (key) {
        return encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
      }).join("&");
    } else {
      posthead = this.headers;
      postdata = JSON.stringify(data);
    }
    this.http.post(url, null, { headers: posthead }).subscribe((result) => {
      callback(result.json());
    });
  }
  //获取工作流页面配置
  workflowPageControl(formcode, wfstatus, wfid, callback) {
    let url = '/page/pageControl/' + formcode + '?' + 'wfstatus=' + wfstatus + '&wfid=' + wfid;
    this.get(url, null, res => {
      callback(res);
    })
  }
  //检查工作流是否存在
  workflowCheckAuth(wfid, callback) {
    let url = '/workflow/checkAuth/' + wfid;
    this.get(url, null, res => {
      callback(res);
    })
  }
  //检查工作流程节点
  checkFetchBack(wfid, callback) {
    let url = '/workflow/checkFetchbackAuth/' + wfid;
    this.get(url, null, res => {
      callback(res);
    })
  }
  //工作流状态
  fecthBack(wfid, callback) {
    let url = '/workflow/fetchback/' + wfid;
    this.get(url, null, res => {
      callback(res);
    })
  }
  //更新密码
  updatePassword(user, callback) {
    let url = '/user/updatePassword';
    // user=JSON.stringify(user);
    url = Utils.dealUrl(url);
    let obj = Object.keys(user).map((value) => {
      return encodeURIComponent('user' + '.' + value) + '=' + encodeURIComponent(user[value]);
    }).join('&');
    console.log(obj);
    this.http.post(url, obj, { headers: this.formurlencodeheaders }
    ).subscribe(res => {
      callback(res.json());
    });
  }
  /**
   * 
   * @param fileType 获取文件类型mimetype
   */
  getFileMimeType(fileType){
    let mimeType:string='';
    switch (fileType) {
      case 'txt':
        mimeType = 'text/plain';
        break;
      case 'docx':
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case 'doc':
        mimeType = 'application/msword';
        break;
      case 'pptx':
        mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        break;
      case 'ppt':
        mimeType = 'application/vnd.ms-powerpoint';
        break;
      case 'xlsx':
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case 'xls':
        mimeType = 'application/vnd.ms-excel';
        break;
      case 'zip':
        mimeType = 'application/x-zip-compressed';
        break;
      case 'rar':
        mimeType = 'application/octet-stream';
        break;
      case 'pdf':
        mimeType = 'application/pdf';
        break;
      case 'jpg':
        mimeType = 'image/jpeg';
        break;
      case 'png':
        mimeType = 'image/png';
        break;
      case 'doc':
        mimeType='application/msword';
        break;
      default:
        mimeType = 'application/' + fileType;
        break;
      
    }
    return mimeType;
  }
  //打开文件
  openFiles(item){
      if (item['filetype']=='png' ||  item['filetype']=='gif' ||item['filetype']== "jpg" || item['filetype']=="jpeg") {
        this.phoneDevice.showBigimage(ConfigProvider.apiUrl + item['url']);
      } else {
              let now = 0;  
              // var url = 'http://jmtc.gdwm.cn:4434' + item['url'];
              var url = 'http://120.79.223.161'+ item['downurl'];
              if(this.platform.is('ios')){
                this.filepath=this.file.dataDirectory+item['downurl'];
              }else{  
                this.filepath = this.file.externalDataDirectory + item['name'];
              }
              let filetransfer: FileTransferObject = this.transfer.create();
              filetransfer.onProgress((progressEvent) => {
                if (progressEvent.lengthComputable) {
                  now = progressEvent.loaded / progressEvent.total * 100;
                }
              })
              filetransfer.download(url, this.filepath, true).then(() => {
                this.checkPermissions();
                this.fileopen.open(this.filepath, this.getFileMimeType(item['filetype'])).then((data) => {
                  console.log(data + '1111111');
                }, (err) => {
                  console.log(err);
                  console.log('文件打开失败');
                  this.toastCtrl.create({
                    position: 'middle',
                    message: '文件打开失败',
                    duration: 2000
                  }).present();
                })
              }, (err) => {
                this.toastCtrl.create({
                  position: 'middle',
                  message: '文件下载失败',
                  duration: 2000
                }).present();
              })
      }
    }
    /**
   * input 框输入 延迟请求
   */
  delayRequest(time){
    if(this.timer!=null){
      clearTimeout(this.timer);
    }
    return new Promise((res,rej)=>{
      this.timer=setTimeout(() => {
        res(1);
      }, time);
    })
   
  }
  
}
