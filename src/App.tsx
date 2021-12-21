import React, { ChangeEvent, useEffect, useState } from 'react';
import './App.css';
import AddButton from './components/AddButton';
import RecentImages from './components/RecentImages';
import loadImage, { LoadImageResult } from 'blueimp-load-image';
import { API_URL } from './Constants';
import CameraView from './components/CameraView';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';


import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Camera from 'react-html5-camera-photo';

// Got that as a view wrapper to center elements
// from the MUI docuementation.
// Sorry but in three hours, that's what you get :)
const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

function App() {
  const [cameraModeEnabled, setCameraModeEnabled] = useState<boolean>(false)
  const [recentImages, setRecentImages] = useState<string[]>([])

  // Fetch recently uploaded images from the community
  let getRecentImages = async () => {
    const response = await fetch(API_URL + '/recent_images', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (response.status !== 200) {
      throw new Error("Bad response from server");
    }
    const data = await response.json();
    setRecentImages(data.paths);    
  }


  useEffect(() => {
    // Fetch recent images on mount
    (async function () {
      getRecentImages()
    })()


  }, []);

  // Upload an base64 image string to the server and return the unserialized
  // json response.
  const uploadImageToServer = async (imageBase64: string) => {
    let data = {
      b64_img: imageBase64,

    }

    const response = await fetch(API_URL + '/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (response.status >= 400 && response.status < 600) {
      throw new Error("Bad response from server");
    }

    return response.json();

  }

  // Take a selected image from the disk (<input type=file/>) and upload it to the server.
  // Then update the recent images list state.
  let onImageSelectedFromDisk = (file: File) => {
    loadImage(
      file,
      {
        maxWidth: 400,
        maxHeight: 400,
        canvas: true
      })
      .then(async (imageData: LoadImageResult) => {

        let image = imageData.image as HTMLCanvasElement

        let imageBase64 = image.toDataURL("image/png")
        await uploadImageToServer(imageBase64)
        await getRecentImages()
      })

      .catch(error => {
        console.error(error)
      })
  }

  let onImageAdd = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelectedFromDisk(e.target.files[0])
    } else {
      console.error("No file was picked")
    }
  }

  // Callback function for selfie shot using the user's camera.
  // The image is uploaded to the server and the recent images list is updated.
  const handleTakePhoto = async(imageBase64: string) => {
    await uploadImageToServer(imageBase64)
    await getRecentImages()
    setCameraModeEnabled(false)
  }


  if (cameraModeEnabled === true) {
    return <CameraView onPictureTaken={handleTakePhoto} />
  } else {

    // It's been a long time I did not touch a grid system so here is the best I could do 
    // in a few minutes.
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Item>
            <h1>Welcome to Photoroom Hair Styler</h1>
            <Stack direction="row" justifyContent="center">
              <Button variant="contained" onClick={() => {
                setCameraModeEnabled(true)
              }}>Take a selfie</Button>
              <AddButton onImageAdd={onImageAdd}/>
            </Stack>
            <Stack direction="row" justifyContent="center">
              <RecentImages images={recentImages} API_URL={API_URL} />
            </Stack>
          </Item>
        </Grid>
      </Grid>
    );
  }
}

export default App;
