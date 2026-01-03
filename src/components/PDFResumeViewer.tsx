"use client";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

export default function PDFResumeViewer(){
  return (
    <div style={{textAlign: "center"}}>
      <div  style={{width: "100%", maxWidth: 1200, padding: 12, display: "inline-block"}}>
        <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js`}>
          <Viewer fileUrl={`/SoftwareEngineer_NguyenLePhong_0985490107_NoRefs.pdf`} initialPage={2} />
          {/*<Viewer fileUrl={`/Frontend_NguyenLePhong_0985490107.pdf`} initialPage={2} />*/}
        </Worker>
      </div>
    </div>
  )
}
