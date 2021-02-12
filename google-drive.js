/******************** GLOBAL VARIABLES ********************/

var CLIENT_ID = '260098077441-mt2bd7d1omaonr3mpjj24bjeb14lnon7.apps.googleusercontent.com';
var API_KEY = 'AIzaSyC1NB_72GMR2c54ZmsJtYsoJe-nsjVPF6w';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
var SCOPES = 'https://www.googleapis.com/auth/drive';
var FOLDER_NAME = "";
var FOLDER_ID = "root";
var FOLDER_PERMISSION = true;
var FOLDER_LEVEL = 0;
var NO_OF_FILES = 100;
var DRIVE_FILES = [];
var FILE_COUNTER = 0;
var FOLDER_ARRAY = [];
var url="https://www.googleapis.com/upload/drive/v3/files?uploadType=media";
/******************** AUTHENTICATION ********************/

var loginPage = document.getElementById('login');
var drivePage = document.getElementById('drive');

var authorizeButton = document.getElementById('loginBtn');
var signoutButton = document.getElementById('logoutBtn');

authorizeButton.onclick = handleAuthClick;
signoutButton.onclick = handleSignoutClick;

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
  }

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
   
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

}, function(error) {
    appendPre(JSON.stringify(error, null, 2));
});
}

    function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        loginPage.classList.add("d-none");
        drivePage.classList.remove("d-none");
        getDriveFiles();
    } else {
          loginPage.classList.remove("d-none");
          drivePage.classList.add("d-none");
    }
    }


    function handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
      }

      /**
       *  Sign out the user upon button click.
       */
      function handleSignoutClick(event) {
        gapi.auth2.getAuthInstance().signOut();
      }
/******************** END AUTHENTICATION ********************/

let uploadButton = document.getElementById('uploadBtn');
let reloadButton = document.getElementById('refreshBtn');
let addfolderButton = document.getElementById('addFolderBtn');

uploadButton.onclick = handleUploadClick;
reloadButton.onclick = handleReloadClick;
addfolderButton.onclick = handleAddFolderClick;

function handleReloadClick(){
  getDriveFiles();
}

function handleAddFolderClick(){
  var folderName = prompt("Enter folder Name: ");
  if( folderName == null || folderName == "" ){
    handleAddFolderClick();
  }
  else{
    var access_token = gapi.auth.getToken().access_token;
    var request = gapi.client.request({
      'path' : '/drive/v3/files/',
      'method' : 'POST',
      'headers' :{
          'Content-Type':'application/json',
          'Authorization' : 'Bearer' + access_token,
       },
       'body':{
         "title" : folderName,
         "mimeType" : "application/vnd.google-apps.folder",
         "parents":[{
           "kind" : "drive#file",
           "id" : FOLDER_ID
         }]
       }

    });
    request.execute(function(resp){
      if(!resp.error){
        alert("Folder Added Succesfully");
        getDriveFiles();
      }
      else{
        alert(resp.error.message);
      }
    });

  }
}



function handleUploadClick(){
    document.getElementById('fUpload').click();
}

document.getElementById('fUpload').addEventListener('change',handleUploadFile);


async function handleUploadFile(e){
    // console.log("uploaded successfully");
    var file=e.target.files[0];
    var metadata={
        'title' : file.name,
        'description' : "File Upload",
        'mimeType': file.type || 'appplicatoin/octet-stream',
        "parents":[{
                "kind" : "drive#file",
                "id" :FOLDER_ID
            }]
           };
    try{
        // var file1=file;
        // var token=gapi.auth.getToken().access_token;
        // var metadata1=metadata;
        // var params={
        //     convert:false,
        //     ocr: false
        // }

        console.log(file);
        console.log(metadata);
        // let resp = await fetch(url,{
        //     method: "POST",
        //     body: metadata,
        //     headers : {
        //         "Authorization":'Bearer'+ token,
        //         "Content-Type": 'application/json',
        //         "Content-Length": file.size
        //     }
        // })
        // let data= await resp.json();
        // console.log(data);
    }
    catch(err){
        alert(err);
    }

    };

      function appendPre(message) {
        var pre = document.getElementById('content');
        var textContent = document.createTextNode(message + '\n');
        pre.appendChild(textContent);
      }



      function listFiles() {
        gapi.client.drive.files.list({
          'pageSize': 10,
          'fields': "nextPageToken, files(id, name)"
        }).then(function(response) {
          appendPre('Files:');
          var files = response.result.files;
          if (files && files.length > 0) {
            for (var i = 0; i < files.length; i++) {
              var file = files[i];
              appendPre(file.name + ' (' + file.id + ')');
            }
          } else {
            appendPre('No files found.');
          }
        });
    }

    /*************DRIVER API ***********/

    function getDriveFiles(){
        console.log("Loading Google Drive files...");
        gapi.client.load('drive', 'v3', getFiles);
    }  

    function getFiles(){
        var query = "";
        var request = gapi.client.drive.files.list({
            'maxResults': NO_OF_FILES,
            'q': query
        });
    
        request.execute(function (resp) {
           if (!resp.error) {
               var data="";
                showUserInfo();
                DRIVE_FILES = resp.files;
                console.log(DRIVE_FILES.length);
                if(DRIVE_FILES.length>0){
                document.getElementById("drive-content").innerHTML="";
                DRIVE_FILES.forEach(buildFile1);
                console.log(data);
                }
                else
                {
                    alert("no files found");
                }
           }else{
               alert("get files request :"+resp.error.message);
           }
        });
    }

    function showUserInfo(){
        var request = gapi.client.drive.about.get({
            'fields': "user,storageQuota"
          });
        request.execute(function(resp) { 
           if (!resp.error) {
               document.getElementById('name').innerHTML=resp.user.displayName;
                document.getElementById('totalQuota').innerHTML=formatBytes(resp.storageQuota.limit);
                document.getElementById('usedQuota').innerHTML=formatBytes(resp.storageQuota.usage);
           }else{
                alert("userInfo :"+resp.error.message);
           }
       });
    }

    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + " Bytes";
        else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + " KB";
        else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + " MB";
        else return (bytes / 1073741824).toFixed(3) + " GB";
    };


      function buildFile1(item,index){
        return gapi.client.drive.files.get({
            'fileId' : item.id,
            'fields' : '*'
        }).then(function(response) {
                    
                    var df_data=[];
                    var fText="";
                     console.log("Response", response.result);
                    df_data.textContentURL="";
                    df_data.id=response.result.id;
                    df_data.level=(parseInt(FOLDER_LEVEL)+1).toString();
                    df_data.parentID=(response.result.parents.length>0)?response.result.parents[0].id:"";
                    df_data.thumbnailLink=response.result.thumbnailLink||'';
                    df_data.webViewLink=response.result.webViewLink;
                    df_data.fileType=(response.result.fileExtension==null)?"folder" : "file";
                    df_data.permissionRole=response.result.permissions[0].role;
                    df_data.hasPermission=(response.result.permissions[0].role=="owner" || response.result.permissionRole[0].role=="writer");
                    var textContentURL='';
                    df_data.textTitle=(df_data.fileType!="file")?"Browse <br>"+response.result.name : response.result.name;
                    fText+="<div class='p-3'>";
                    fText+="<div class='container text-center'>";
                    console.log(df_data.fileType);
                    if(df_data.fileType!="file"){
                    fText+="<img src='images/folder.png' style='width:100px;height:100px'/>";
                    }
                    else{
                        if(df_data.thumbnailLink){
                            fText+="<a href='"+df_data.webViewLink+"' target='_blank'><img src='"+df_data.thumbnailLink+"' style='width:100px;height:100px'/></a>";
                        }
                            else
                          {
                            fText+="<a href='"+df_data.webViewLink+"' target='_blank'><img src='images/"+df_data.fileExtension+"-icon.png'/></a>";
                          }        
                        
                    }
                    fText+="</div>"
                    fText+=" <div class='p-3 text-center'>"+df_data.textTitle+"</div>";
                    fText+=" <div class='p-1 text-center'>"
                    if(df_data.fileType!="folder"){
                        fText+=" <i class='fas fa-download p-2 mx-3' id='downloadBtn' title='Download' data-id='"+df_data.id+"'></i>"
                    }

                    if(df_data.hasPermission){
                        if(df_data.permissionRole=="owner"){
                        fText+="<i class='fas fa-trash-alt p-2 mx-3' id='deleteBtn' title='Delete' data-id='"+df_data.id+"'></i>"
                        }else if(df_data.fileType!="folder"){
                            fText+=" <i class='fas fa-trash-alt p-2 mx-3' id='deleteBtn' title='Delete' data-id='"+df_data.id+"'></i>"
                        }
                    }
                    // <i class="fas fa-trash-alt p-2 mx-3" id="refreshBtn" title="Refresh"></i>
                    // <i class="fas fa-download p-2 mx-3" id="uploadBtn" title="Upload to Google Drive" ></i>
                    fText+="</div></div>"
                    console.log(fText);
                    document.getElementById("drive-content").innerHTML+=fText;
                   
                  },
                  function(err) { console.error("Execute error", err); });
      }

      
    
   
    
