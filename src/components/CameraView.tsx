import React, { ChangeEvent } from "react";
import Camera from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';



export default function CameraView ({
    onPictureTaken,
  }: {
    onPictureTaken: (imageData: string) => void;
  }): JSX.Element {

   return (
       <div>
    <Camera
    onTakePhoto = { (dataUri: string) => { onPictureTaken(dataUri); return ; } }
  />)
  </div>


)}