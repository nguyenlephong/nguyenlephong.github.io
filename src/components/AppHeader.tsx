import Link from "next/link";
import {APP_ROUTE} from "@/app/app.const";

export default function AppHeader() {
  return (
    <header className={"app-header"}>
      <nav className={"main-menu"}>
        <Link href={APP_ROUTE.HOME}>
          <div className={"menu-item"}>
            <span>Home</span>
          </div>
        </Link>
        
        <Link href={APP_ROUTE.ABOUT}>
          <div className={"menu-item"}>
            <span>About</span>
          </div>
        </Link>
        
        <Link href={APP_ROUTE.GALLERY}>
          <div className={"menu-item"}>
            <span>Gallery</span>
          </div>
        </Link>
        
        
        <Link href={APP_ROUTE.CV}>
          <div className={"menu-item"}>
            <span>CV PDF</span>
          </div>
        </Link>
      
        <Link href={APP_ROUTE.CV_PDF} target={"_blank"}>
          <div className={"menu-item"}>
            <span>CV Download</span>
          </div>
        </Link>
      
      </nav>
    </header>
  )
}
