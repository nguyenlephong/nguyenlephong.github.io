import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import HALO_EFFECT from "vanta/dist/vanta.halo.min";
import BIRDS_EFFECT from "vanta/dist/vanta.birds.min";
import WARES_EFFECT from "vanta/dist/vanta.waves.min";
import GLOBE_EFFECT from "vanta/dist/vanta.globe.min";
import DOTS_EFFECT from "vanta/dist/vanta.dots.min";
// import CLOUDS_EFFECT from "vanta/dist/vanta.clouds.min";
import FOG_EFFECT from "vanta/dist/vanta.fog.min";
import { useWindowSize } from "react-use";
import ListOfToolContainer from "../../components/containers/tools/ListOfToolContainer";

export default function wrapperToolsPage() {
  const [vantaEffect, setVantaEffect] = useState(0);
  const refToolPageDetail = useRef(null);
  const {width, height} = useWindowSize();

  const getBackgroundEffectRandom = () => {
    let randomNumb = Math.floor(Math.random() * 6) + 1
    switch (randomNumb) {
      case 1:
        return HALO_EFFECT({
          el: refToolPageDetail.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: height,
          minWidth: width,
        })

      case 2:
        return BIRDS_EFFECT({
          el: refToolPageDetail.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: height,
          minWidth: width,
          scale: 1.00,
          scaleMobile: 1.00,
          colorMode: "variance",
          birdSize: 1.10,
          wingSpan: 35.00,
          speedLimit: 4.00,
          separation: 37.00,
          alignment: 1.00,
          cohesion: 41.00
        })

      case 3:
        return WARES_EFFECT({
          el: refToolPageDetail.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: height,
          minWidth: width,
          scale: 1.00,
          scaleMobile: 1.00,
        })

      case 4:
        return GLOBE_EFFECT({
          el: refToolPageDetail.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: height,
          minWidth: width,
          scale: 1.00,
          scaleMobile: 1.00,
        })

      case 5:
        return DOTS_EFFECT({
          el: refToolPageDetail.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: height,
          minWidth: width,
          scale: 1.00,
          scaleMobile: 1.00,
        })

      case 6:
        return GLOBE_EFFECT({
          el: refToolPageDetail.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: height,
          minWidth: width,
          scale: 1.00,
          scaleMobile: 1.00,
        })

      case 7:
        return FOG_EFFECT({
          el: refToolPageDetail.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: height,
          minWidth: width,
          scale: 1.00,
          scaleMobile: 1.00,
        })

      default:
        return HALO_EFFECT({
          el: refToolPageDetail.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: height,
          minWidth: width,
        })

    }
  }

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(getBackgroundEffectRandom());
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);


  return (
    <React.Fragment>
      <Head>
        <title>Tools For Developer - Nguyễn Lê Phong | FullStack Software Engineer</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta
          name="description"
          content="Tools For Developer. A passionate individual who always thrives to work on end-to-end products which develop sustainable and scalable social and technical systems to create impact."
        />
      </Head>
      <div className={"tools-page"}>
        <div ref={refToolPageDetail} id={"tools-page-wrap"} className={"tools-page-wrap"}>
            <ListOfToolContainer/>
        </div>
      </div>
    </React.Fragment>
  );
};