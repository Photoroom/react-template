import React, { ChangeEvent, useEffect, useState } from 'react';
import './App.css';
import AddButton from './components/AddButton';
import CameraView from './components/CameraView';
import loadImage, { LoadImageResult } from 'blueimp-load-image';
import { API_URL } from './Constants';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Camera from 'react-html5-camera-photo';


function App() {
  const [result, setResult] = useState<string | null>(null)
  const [recentImages, setRecentImages] = useState<string[]>([])
  
  
  useEffect(() => {
    // Update the document title using the browser API
    (async function ()  {
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
      
      
    })()

    
  },[]);

  const uploadImageToServerBis = async (imageBase64: string) => {
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

    const result = await response.json();
    const imagePath = API_URL + result.path
    setResult(imagePath)

  }

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
        // let data = {
        //   b64_img: imageBase64,
        
        // }
        
        // const response = await fetch(API_URL + '/upload', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Accept': 'application/json',
        //   },
        //   body: JSON.stringify(data)
        // });

        // if (response.status >= 400 && response.status < 600) {
        //   throw new Error("Bad response from server");
        // }

        // const result = await response.json();
        // const imagePath = API_URL + result.path
        // setResult(imagePath)
        await uploadImageToServerBis(imageBase64)
        
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

  const handleTakePhoto = (imageBase64: string) => {
    uploadImageToServerBis(imageBase64)
  }
// return (<CameraView onPictureTaken={handleTakePhoto}/>)

  return (
    <div className="App">
      <header className="App-header">
        {!result && <AddButton onImageAdd={onImageAdd} />}
        {!result && <ImageList sx={{ width: 500, height: 450 }} cols={3} rowHeight={164}>
          {recentImages.map((img_url) => (
            <ImageListItem key={img_url}>
              <img
                src={`${API_URL+"/"+img_url}`}
                srcSet={`${API_URL+"/"+img_url}`} 
                alt={img_url}
                loading="lazy"
              />
            </ImageListItem>
          ))}
        </ImageList>}
        {result && <img src={result} width={300} alt="result from the API" />}
      </header>

    </div>
  );
}

export default App;
