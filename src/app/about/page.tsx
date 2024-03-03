import {profileInfo} from "@/app/app.const";
import {FaHandPointRight} from "react-icons/fa";
import {GoDotFill} from "react-icons/go";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Bachelor's degree in Software Engineering, awarded with a very good classification. GPA 8.11",
};


export default function AboutPage () {
  return (
    <main className={"about-page"}>
      <section className={"section-container"}>
        <h1 style={{textAlign: "center", fontSize: 32, padding: 24}}>
          Nguyen Le Phong - Front-end Software Engineer
        </h1>
        
        {profileInfo.about.map((item) => {
          return (
            <div key={`sm_${item.id}`} id={`sm_${item.id}`} className={"section-wrapper"}>
              <h2 className={"box-title"} style={{color: "blue"}}>
                <FaHandPointRight size={24}/> {item.categories}
              </h2>
              
              <ul className={"list-none"}>
                {item.descriptions.map((des, ind) => {
                  return (
                    <li key={`des_${ind}`}>
                      <span className={"align-centered"}>
                        <GoDotFill size={12} color={"green"}/>
                        <span style={{paddingLeft: 8}} dangerouslySetInnerHTML={{__html: des}}></span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>
    </main>
  )
}
