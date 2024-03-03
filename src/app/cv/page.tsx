import dynamic from "next/dynamic";

const PDFResumeViewer = dynamic(() => import("@/components/PDFResumeViewer"));

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
