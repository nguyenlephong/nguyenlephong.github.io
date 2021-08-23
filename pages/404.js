import React, {useEffect} from 'react';
import WrapperProvider from "../components/WrapperProvider";
import {Helmet} from "react-helmet";

const PageNotFound = props => {
  
  return (
    <WrapperProvider>
      <Helmet>
        <title>Page Not Found - Nguyễn Lê Phong | FullStack Software Engineer</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta
          name="description"
          content="Nguyễn Lê Phong - FullStack Software Engineer. A passionate individual who always thrives to work on end-to-end products which develop sustainable and scalable social and technical systems to create impact."
        />
      </Helmet>
  
      <div className={"page-not-found"}>
        <div className={"title"}>
          <h1 className="text-center">404</h1>
        </div>
        <div className="four_zero_four_bg">
        </div>
    
        <div className="info_box_404">
          <h3>Look like you're lost</h3>
      
          <p>The page you are looking for not available!</p>
      
          <a href="/" className="link_404">Go to Home</a>
        </div>
      </div>
    </WrapperProvider>
    
  )
}

export default PageNotFound;
