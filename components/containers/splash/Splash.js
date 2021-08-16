import React, { useEffect } from "react";
import LoaderLogo from "../../components/LoaderLogo.js";
import { useRouter } from "next/router";

function AnimatedSplash(props) {
  return (
    <div className="logo_wrapper">
      <div className="screen" style={{ backgroundColor: props.theme.text }}>
        <LoaderLogo id="logo" theme={props.theme} />
      </div>
    </div>
  );
}

const Splash = (props) => {
  const router = useRouter();
  
  useEffect(() => {
    setTimeout(() => {
      router.push("/home");
    }, 2500);
  }, []);
  
  return (<AnimatedSplash theme={props.theme} />);
}
export default Splash;
