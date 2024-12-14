import Link from "next/link";
import {APP_ROUTE} from "@/app/app.const";
import {IoMenu} from "react-icons/io5";
import React from "react";


export default function AppHeader() {
  return (
    <header className={"app-header"}>
      <nav className={"main-menu"}>
        <Link href={APP_ROUTE.HOME}>
          <div className={"menu-item"}>
            <span>Home</span>
          </div>
        </Link>
        
        {1 < 0 && (
          <Link href={APP_ROUTE.ABOUT}>
            <div className={"menu-item"}>
              <span>About</span>
            </div>
          </Link>
        )}
        
        
        {1 < 0 && (
          <Link href={APP_ROUTE.CV}>
            <div className={"menu-item"}>
              <span>CV PDF</span>
            </div>
          </Link>
        )}
      
        <Link href={APP_ROUTE.CV_PDF} target={"_blank"}>
          <div className={"menu-item"}>
            <span>PDF Download</span>
          </div>
        </Link>
        
        {1 < 2 && (
          <Link href={APP_ROUTE.GALLERY}>
            <div className={"menu-item"}>
              <span>Gallery</span>
            </div>
          </Link>
        )}
      
      </nav>
      
      <nav className="m-main-menu">
        <div className={"menu-item"}>
          <IoMenu size={24}/>
          <div className={"mobile-popover-menu"}>
            <ul className={"m-menu-list"}>
              <Link href={APP_ROUTE.HOME}>
                <li className={"m-menu-item"}><span>Home</span></li>
              </Link>
              
              <Link href={APP_ROUTE.ABOUT}>
                <li className={"m-menu-item"}><span>About</span></li>
              </Link>
              
              <Link href={APP_ROUTE.GALLERY}>
                <li className={"m-menu-item"}><span>Gallery</span></li>
              </Link>
              
              <Link href={APP_ROUTE.CV}>
                <li className={"m-menu-item"}><span>CV PDF</span></li>
              </Link>
              
              <Link href={APP_ROUTE.CV_PDF} target={"_blank"}>
                <li className={"m-menu-item"}><span>CV Download</span></li>
              </Link>
            </ul>
          </div>
        </div>
      </nav>
      
    </header>
  )
}
