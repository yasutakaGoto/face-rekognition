$("#rekognitionButton").on("click", rekognitionTest);
$("#showImgButton").on("click", showTagegetImg);

var s3BucketName = ''; //s3バケット名
var s3RegionName = ''; //s3リージョン
var collectionId = ''; //Rekognition対象コレクションID

AWS.config.update({
    accessKeyId: '', //AWSアクセスキー
    secretAccessKey: '' //AWSシークレットキー
});

var rekognition = new AWS.Rekognition({
    region: s3RegionName
});

/********************************************/
//Rekognitionテスト処理
/********************************************/
// var addFunction;
// 
function rekognitionTest() {
// 
//     //Collection作成
//     var paramsCreate = {
//         CollectionId: collectionId
//     };
// 
//     rekognition.createCollection(paramsCreate, function (err, data) {
//         if (err) {
//             console.log(err, err.stack);
//         } else {
//             addFunction = addImage();
//             addFunction.next();
//         }
//     });

  searchImg();
// 
}

/********************************/
//Collectionに画像を追加する処理
/********************************/
// function* addImage() {
// 
//     for (var cnt = 2; cnt <= 6; cnt++) {
//         var paramsAdd = {
//             CollectionId: collectionId,
//             Image: {
//                 S3Object: {
//                     Bucket: s3BucketName,
//                     Name: '1.jpg'
//                 }
//             },
//             ExternalImageId: '1.jpg'
//         };
// 
//         rekognition.indexFaces(paramsAdd, function (err, data) {
//             if (err) {
//                 console.log(err, err.stack);
//             } else {
//                 console.log(data);
//                 addFunction.next();
//             }
//         });
// 
//         yield;
//     }
// 
//     searchImg();
// }

/********************************/
//Collection削除処理
/********************************/
// var deleteCollection = function () {
//     var paramsDelete = {
//         CollectionId: collectionId
//     };
//     rekognition.deleteCollection(paramsDelete, function (err, data) {
//         if (err) {
//             console.log(err, err.stack);
//         } else {
//             console.log(data);
//         }
//     });
// }

/********************************/
//画像認識(元画像と似ている画像を探す)
/********************************/
var searchImg = function () {
  
    var filename = ""
    filename = $('#targetFile').val();

    var params = {
        CollectionId: collectionId,
        Image: {
            S3Object: {
                Bucket: s3BucketName,
                Name: filename + '.jpg'
            }
        },
        FaceMatchThreshold: 0.0,
        MaxFaces: 10
    };
    rekognition.searchFacesByImage(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
        } else {
            console.log(data);
            showImgs(data);
        }
    });
}

/********************************/
// 画像詳細取得
/********************************/
// function detectFaces() {
var detectFaces = function () {
  
    var filename = ""
    filename = $('#targetFile').val();

    var params = {
        Image: {
            S3Object: {
                Bucket: s3BucketName,
                Name: filename + '.jpg'
            }
        },
        Attributes: ['ALL']
    };
    rekognition.detectFaces(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
        } else {
            console.log("Detect Face....");
            console.log(data);
        }
        
        var info = "";
        var faceData = "";
        
        faceData = data.FaceDetails[0];
        info = "<div><span>年齢レンジ：" + faceData.AgeRange.Low + " - " + faceData.AgeRange.High + "　/　</span>"
        + "<span>性別：" + faceData.Gender.Value + "　/　</span>"
        + "<span>あげ髭：" + faceData.Beard.Value + "　/　</span>"
        + "<span>口髭：" + faceData.Mustache.Value + "　/　</span>"
        + "<br/>"
        + "<span>メガネ：" + faceData.Eyeglasses.Value + "　/　</span>"
        + "<span>サングラス：" + faceData.Sunglasses.Value + "　/　</span>"
        + "<span>目を開いている：" + faceData.EyesOpen.Value + "　/　</span>"
        + "<span>感情：" + faceData.Emotions[0].Type +  "(" + Math.floor(faceData.Emotions[0].Confidence) + ")" +"　/　</span>"
        + "</div>"
        
        $("#targetImg").append(info);

    });
    
}

/********************************/
//画像表示処理(画像認識結果)
/********************************/
function showImgs(data) {
    var s3 = new AWS.S3({
        params: {
            Bucket: s3BucketName,
            Region: s3RegionName
        }
    });
    var htmlImg ="";
    for (var i = 0; i < data.FaceMatches.length;i++) {
        //URL取得
        var paramsSource = {
            Bucket: s3BucketName,
            Key: data.FaceMatches[i].Face.ExternalImageId
        };

        var sourceUrl = s3.getSignedUrl('getObject', paramsSource);

        htmlImg += "<div class='img_box'><img src='" + sourceUrl + "'/><br/>"
          + "<span>" + "Similarity：" + Math.floor(data.FaceMatches[i].Similarity) + "%" + "</span><br/>"
          + "<p>" + data.FaceMatches[i].Face.ExternalImageId + "</p>"
          + "</div>";
    }

    $("#imgList2").html(htmlImg);
    
}

/********************************/
//検索対象画像を表示する
/********************************/
function showTagegetImg() {

  $('.img_box').remove();
  var filename = ""
  filename = $('#targetFile').val();

  var s3 = new AWS.S3({
      params: {
          Bucket: s3BucketName,
          Region: s3RegionName
      }
  });

  var htmlImg ="";
  var paramsSource = {
      Bucket: s3BucketName,
      Key: filename + ".jpg"
  };
  var sourceUrl = s3.getSignedUrl('getObject', paramsSource);
  
  htmlImg += "<div class='img_box'><img src='" + sourceUrl + "'/>" + "</div>"
  $("#targetImg").html(htmlImg);
  
  detectFaces();
  
}
