import React from "react";
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'



export default function RecentImages ({
    images,
    API_URL
  }: {
    images: string[],
    API_URL: string
  }): JSX.Element {

   return (
             <ImageList sx={{ width: 500, height: 450 }} cols={3} rowHeight={164}>
          {images.map((img_url) => (
              <Zoom>
            <ImageListItem key={img_url}>

              <img
                src={`${API_URL+"/"+img_url}`}
                srcSet={`${API_URL+"/"+img_url}`} 
                alt={img_url}
                loading="lazy"
              />
            </ImageListItem>
            </Zoom>
          ))}
        </ImageList>


)}