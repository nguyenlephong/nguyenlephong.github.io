import {profileInfo} from "@/app/app.const";
import Image from "next/image"
import Link from "next/link";
export default function GalleryPage() {
  return (
    <main className={"about-page"}>
      <section className={"section-container"}>
        <h1 style={{textAlign: "center", fontSize: 32, padding: 24}}>
          Front-end Software Engineer
        </h1>
        
        <div className={"section-wrapper"}>
          <h2 className={"box-title"}>Photos</h2>
          <div className="grid-item_wrapper">
            {profileInfo.photos.map((photo) => {
              return (
                <div key={photo.src} id={"photo-" + photo.src}>
                  <Link href={photo.src} target={"_blank"}>
                    <Image src={photo.src} alt={photo.alt} width={232} height={232} style={{objectFit: "cover"}}/>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
        
        <div className={"section-wrapper"}>
          <h2 className={"box-title"}>Videos</h2>
          <div className="grid-item_wrapper">
            {profileInfo.videos.map((item, ind) => {
              return (
                <div
                  key={item.id}
                  id={`score_board-video_${ind}`}
                  className="item_videos"
                >
                  <iframe
                    width="100%"
                    height="315"
                    title={item.title}
                    src={`${item.url}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              );
            })}
          
          </div>
        </div>
      </section>
    </main>
  )
}
