
import React from 'react';
import { Image } from 'react-bootstrap';
import PreloaderLogo from "../assets/media/loader.gif";

export default (props) => {
  const { show } = props;
  
  return (
    <div className={`preloader bg-soft flex-column justify-content-center align-items-center ${show ? "" : "show"}`}>
      <Image className="loader-element" src={PreloaderLogo} height={60} />
    </div>
  );
};
