import dynamic from "next/dynamic";

const PDFResumeViewer = dynamic(() => import("@/components/PDFResumeViewer"));

export default function Home() {
  return (
    <main>
      <PDFResumeViewer />
    </main>
  );
}
