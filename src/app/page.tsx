import BoxItem from "@/components/BoxItem";
import {profileInfo} from "@/app/app.const";
import ExperienceBox from "@/components/ExperienceBoxItem";
import ProjectBox from "@/components/ProjectBoxItem";
import AchievementBoxItem from "@/components/AchievementBoxItem";
import EducationBoxItem from "@/components/EducationBoxItem";


export default function Home() {
  return (
    <main>
      <section className={"section-container"}>
        <div className={"section-wrapper"}>
          <BoxItem title={profileInfo.summary.title} description={profileInfo.summary.description}/>
        </div>
      </section>
      
      <section className={"section-container"}>
        <div className={"section-wrapper"}>
          <h2 className={"box-title"}>{profileInfo.technical_skill.title}</h2>
          <div className={"text-line-item"}>
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
      </section>
      
      <section className={"section-container"}>
        <ExperienceBox data={profileInfo.experience}/>
      </section>
      
      <section className={"section-container"}>
        <ProjectBox data={profileInfo.projects}/>
      </section>
      
      <section className={"section-container"}>
        <AchievementBoxItem data={profileInfo.achievements}/>
      </section>
      
      <section className={"section-container"}>
        <EducationBoxItem data={profileInfo.education}/>
      </section>
    </main>
  );
}
