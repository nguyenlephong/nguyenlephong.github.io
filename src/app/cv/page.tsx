import dynamic from "next/dynamic";

const PDFResumeViewer = dynamic(() => import("@/components/PDFResumeViewer"));

export default function CVPage() {
  return (
    <main style={{marginTop: 60}}>
      <PDFResumeViewer />
    </main>
  );
}
