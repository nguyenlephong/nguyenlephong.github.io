import {profileInfo} from "@/app/app.const";
import Image from "next/image"
import Link from "next/link";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Enjoy watching movies (movies can bring life skills enhancement lessons), singing on weekends, holidays with friends and relatives.",
};

export default function GalleryPage() {
  return (
    <main className={"about-page"}>
      <section className={"section-container"}>
        <h1 style={{textAlign: "center", fontSize: 32, padding: 24}}>
          Software Engineer
        </h1>
        
        <div className={"section-wrapper"}>
          <h2 className={"box-title"}>Certifications</h2>
          <div className="grid-item_wrapper">
            {profileInfo.gallery.certificates.map((photo: any) => {
              return (
                <div key={photo.src} id={"photo-" + photo.src}>
                  <Link href={photo?.refs || photo.src} target={"_blank"}>
                    <Image
                      src={photo.src}
                      alt={photo.alt} width={232} height={232}
                      style={{
                        objectFit: "cover",
                        width: photo.width > 100 ? photo.width : '',
                        height: photo.height > 100 ? photo.height : '',
                        borderRadius: 12
                      }}
                    />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
        
        <div className={"section-wrapper"}>
          <h2 className={"box-title"}>Projects</h2>
          <div className="grid-item_wrapper">
            {profileInfo.gallery.projects.map((photo) => {
              return (
                <div key={photo.src} id={"photo-" + photo.src}>
                  <Link href={photo.src} target={"_blank"}>
                    <Image
                      src={photo.src}
                      alt={photo.alt} width={232} height={232}
                      style={{
                        objectFit: "cover",
                        borderRadius: 12
                      }}/>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
        
        <div className={"section-wrapper"}>
          <h2 className={"box-title"}>Awards</h2>
          <div className="grid-item_wrapper">
            {profileInfo.gallery.awards.map((photo) => {
              return (
                <div key={photo.src} id={"photo-" + photo.src}>
                  <Link href={photo.src} target={"_blank"}>
                    <Image
                      src={photo.src} alt={photo.alt} width={232} height={232}
                      style={{
                        objectFit: "cover",
                        width: photo.width > 100 ? photo.width : '',
                        height: photo.height > 100 ? photo.height : '',
                        borderRadius: 12
                      }}/>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
        
        <div className={"section-wrapper"}>
          <h2 className={"box-title"}>Activities</h2>
          <div className="grid-item_wrapper">
            {profileInfo.gallery.activities.map((photo) => {
              return (
                <div key={photo.src} id={"photo-" + photo.src}>
                  <Link href={photo.src} target={"_blank"}>
                    <Image
                      src={photo.src} alt={photo.alt}
                      width={232} height={232}
                      style={{
                        objectFit: "cover",
                        borderRadius: 12
                      }}/>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
        
        {1 < 0 && (
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
        )}
      </section>
    </main>
  )
}
