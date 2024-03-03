import dynamic from "next/dynamic";
import {Metadata} from "next";

const PDFResumeViewer = dynamic(() => import("@/components/PDFResumeViewer"));

export const metadata: Metadata = {
  title: "Curriculum Vitae",
  description: "A passionate individual who always thrives to work on end-to-end products which develop sustainable and scalable social and technical systems to create impact.",
};

export default function CVPage() {
  return (
    <main className={"about-page"}>
      <section className={"section-container"}>
        <h1 style={{textAlign: "center", fontSize: 32, padding: 24}}>
          Front-end Software Engineer
        </h1>
        
        <div className={"section-wrapper"}>
          <PDFResumeViewer />
        </div>
      </section>
    </main>
  );
}
