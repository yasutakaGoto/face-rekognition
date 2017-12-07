#!/bin/sh

#s3上にある顔写真をコレクションに保存するシェル
#1〜file_count分ループ

#入力が必要な箇所
#Bucket名
#collectionId


#s3上のファイル名
file_name=""
#処理数（=s3上のファイル数）
file_count=150

for ((i=1 ; i<=file_count;  i++))
do
 file_name="${i}.jpg"
 echo $file_name
 aws rekognition index-faces --image '{"S3Object":{"Bucket":"","Name":"'$file_name'"}}' --collection-id "" --external-image-id $file_name --region us-west-2 --profile adminuser
done
