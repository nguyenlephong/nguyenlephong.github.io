import {profileInfo} from "@/app/app.const";
import ExperienceBox from "@/components/ExperienceBoxItem";
import ProjectBox from "@/components/ProjectBoxItem";
import AchievementBoxItem from "@/components/AchievementBoxItem";
import EducationBoxItem from "@/components/EducationBoxItem";
import {FaFacebookSquare, FaGithub, FaInstagram, FaLinkedin, FaYoutube} from "react-icons/fa";
import {FaXTwitter} from "react-icons/fa6";
import {SiLeetcode} from "react-icons/si";
import Link from "next/link";

export default function MainPage() {
  return (
    <main>
      <section className={"section-container"}>
        <article className={"section-wrapper"}>
          <div className={"information-section"}>
            
            <div className="info-group" style={{textAlign: "center"}}>
              <h1 className={"headline t-up"}>Nguyen Le Phong</h1>
              
              <ul className={"list-none social-link"} style={{display: "flex", gap: 24, flexWrap: "wrap"}}>
                <li>👨🏻‍💻 Front-end Software Engineer</li>
                <li><a href={`mailto:${profileInfo.contact.email}`}>✉️ {profileInfo.contact.email}</a></li>
                <li><a href={`tel:${profileInfo.contact.phone}`}>📞 {profileInfo.contact.phone}</a></li>
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
          
          <div className={"box-info"} style={{gap: 8}}>
            {profileInfo.summary.description.map((it: string) => {
              return (
                <p key={it} dangerouslySetInnerHTML={{__html: it}} className={"box-item-text"}/>
              )
            })}
            
            <ul className={"box-list-info"}>
              {profileInfo.summary.skills.map((it: string) => {
                return (
                  <li key={it}>
                    <p dangerouslySetInnerHTML={{__html: it}} className={"box-item-text"}/>
                  </li>
                
                )
              })}
            </ul>
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
