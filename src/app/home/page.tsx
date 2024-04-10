import {profileInfo} from "@/app/app.const";
import ExperienceBox from "@/components/ExperienceBoxItem";
import ProjectBox from "@/components/ProjectBoxItem";
import AchievementBoxItem from "@/components/AchievementBoxItem";
import EducationBoxItem from "@/components/EducationBoxItem";
import {FaFacebookSquare, FaGithub, FaInstagram, FaLinkedin, FaYoutube} from "react-icons/fa";
import {FaXTwitter} from "react-icons/fa6";
import {SiLeetcode} from "react-icons/si";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section className={"section-container"}>
        <article className={"section-wrapper"}>
          <div className={"information-section"}>
            
            {/*<div className="avatar-group">*/}
            {/*  <Image src={"https://cdn.jsdelivr.net/gh/nguyenlephong/dom-pub/shared/images/cv/images/dom.png"}*/}
            {/*         width={200} height={200} alt={"Nguyen Le Phong - Front-end Software Engineer"}/>*/}
            {/*</div>*/}
            
            <div className="info-group" style={{textAlign: "center"}}>
              <h1 className={"headline t-up"}>Nguyen Le Phong</h1>
              
              <ul className={"list-none"} style={{display: "flex", gap: 24, flexWrap: "wrap"}}>
                <li>👨🏻‍💻 Front-end Software Engineer</li>
                <li>✉️ {profileInfo.contact.email}</li>
                <li>📞 {profileInfo.contact.phone}</li>
              </ul>
              
              <div className={"social-block"} style={{display: "flex", justifyContent: "center"}}>
                <Link href={profileInfo.contact.linkedin} target={"_blank"}>
                  <div className={"social-item"} title={"Linkedin"}>
                    <FaLinkedin size={24}/>
                  </div>
                </Link>
                
                <Link href={profileInfo.contact.github} target={"_blank"}>
                  <div className={"social-item"} title={"Github"}>
                    <FaGithub size={24}/>
                  </div>
                </Link>
                
                <Link href={profileInfo.contact.leetcode} target={"_blank"}>
                  <div className={"social-item"} title={"Leetcode"}>
                    <SiLeetcode size={24}/>
                  </div>
                </Link>
                
                {1 < 0 && (
                  <Link href={profileInfo.contact.twitter} target={"_blank"}>
                    <div className={"social-item"} title={"Twitter"}>
                      <FaXTwitter size={24}/>
                    </div>
                  </Link>
                )}
                
                <Link href={profileInfo.contact.youtube} target={"_blank"}>
                  <div className={"social-item"} title={"Youtube"}>
                    <FaYoutube size={24}/>
                  </div>
                </Link>
                
                {1 < 0 && (
                  <Link href={profileInfo.contact.facebook} target={"_blank"}>
                    <div className={"social-item"} title={"Facebook"}>
                      <FaFacebookSquare size={24}/>
                    </div>
                  </Link>
                )}
                
                {1 < 0 && (
                  <Link href={profileInfo.contact.instagram} target={"_blank"}>
                    <div className={"social-item"} title={"Instagram"}>
                      <FaInstagram size={24}/>
                    </div>
                  </Link>
                )}
              
              
              </div>
            </div>
          </div>
        </article>
      </section>
      
      <section className={"section-container"}>
        <div className={"section-wrapper"}>
          <h2 className={"box-title"}>{profileInfo.summary.title}</h2>
          
          <div className={"box-info"}>
            {profileInfo.summary.description.map((it: string) => {
              return (
                <p key={it} dangerouslySetInnerHTML={{__html: it}} className={"box-item-text"}/>
              )
            })}
          </div>
        </div>
      </section>
      
      <section className={"section-container"}>
        <div className={"section-wrapper"}>
          <h2 className={"box-title"}>{profileInfo.technical_skill.title}</h2>
          <div className={"box-info"}>
            <div className={"text-line-item"} style={{marginTop: 12}}>
              <strong>Languages</strong>:{" "}
              
              {profileInfo.technical_skill.languages.map((k: string, ind: number) => {
                const separator = ind === profileInfo.technical_skill.languages.length - 1 ? "." : ", "
                return <span dangerouslySetInnerHTML={{__html: k + separator}} key={k}/>
              })}
            
            </div>
            
            <div className={"text-line-item"}>
              <strong>Frameworks</strong>:{" "}
              
              {profileInfo.technical_skill.frameworks.map((k: string, ind: number) => {
                const separator = ind === profileInfo.technical_skill.frameworks.length - 1 ? "." : ", "
                return <span dangerouslySetInnerHTML={{__html: k + separator}} key={k}/>
              })}
            
            </div>
            
            <div className={"text-line-item"}>
              <strong>Developer Tools</strong>:{" "}
              
              {profileInfo.technical_skill.developerTools.map((k: string, ind: number) => {
                const separator = ind === profileInfo.technical_skill.developerTools.length - 1 ? "." : ", "
                return <span dangerouslySetInnerHTML={{__html: k + separator}} key={k}/>
              })}
            
            </div>
            
            <div className={"text-line-item"}>
              <strong>Libraries</strong>:{" "}
              
              {profileInfo.technical_skill.libraries.map((k: string, ind: number) => {
                const separator = ind === profileInfo.technical_skill.libraries.length - 1 ? "." : ", "
                return <span dangerouslySetInnerHTML={{__html: k + separator}} key={k}/>
              })}
            
            </div>
            
            <div className={"text-line-item"}>
              <strong>Testing</strong>: {" "}
              
              {profileInfo.technical_skill.testing.map((k: string, ind: number) => {
                const separator = ind === profileInfo.technical_skill.testing.length - 1 ? "." : ", "
                return <span dangerouslySetInnerHTML={{__html: k + separator}} key={k}/>
              })}
            
            </div>
            
            <div className={"text-line-item"}>
              <strong>Other</strong>:{" "}
              
              {profileInfo.technical_skill.other.map((k: string, ind: number) => {
                const separator = ind === profileInfo.technical_skill.other.length - 1 ? "." : ", "
                return <span dangerouslySetInnerHTML={{__html: k + separator}} key={k}/>
              })}
            
            </div>
          </div>
        </div>
      </section>
      
      <section className={"section-container"}>
        <ExperienceBox data={profileInfo.experience}/>
      </section>
      
      <section className={"section-container"}>
        <ProjectBox data={profileInfo.projects}/>
      </section>
      
      {1 < 0 && (
        <section className={"section-container"}>
          <AchievementBoxItem data={profileInfo.achievements}/>
        </section>
      )}
      
      {1 < 0 && (
        <section className={"section-container"}>
          <EducationBoxItem data={profileInfo.education}/>
        </section>
      )}
    </main>
  );
}
