import {ExperienceItemType, JobType} from "@/app/app.type";
import Tag from "@/components/Tag";

type ExperienceBoxIProps = {
  data: ExperienceItemType[]
}

export default function ExperienceBox(props: ExperienceBoxIProps){
  const {data} = props
  return (
    <div className={"section-wrapper"}>
      <h2 className={"box-title"}>Work Experiences</h2>
      {
        data.map((ex: ExperienceItemType) => {
          return (
            <div key={ex.company} className={"experience-item"}>
              
              <div className={"txt-line-full"}>
                <h3 className="h-title">{ex.company}</h3>
                <p className={'txt-sec'}>{ex.location}</p>
              </div>
              
              {
                ex.jobs.map((job: JobType) => {
                  return (
                    <div key={job.title} className={"job-item"}>
                      
                      <div className={"txt-line-full"}>
                        <h4 className={"job-title"}>{job.title}</h4>
                        <p>{job.duration}</p>
                      </div>
                      
                      {job.summaries.map((s: string) => {
                        return (
                          <p className={"normal-text"} key={s} dangerouslySetInnerHTML={{__html: s}} />
                        )
                      })}
                      
                      <p style={{marginTop: 12}}><i className={'txt-sec'}>Key Contribution</i>:</p>
                      <ul className={"list-none"}>
                        {job.key_contribution.map((item: string) => {
                          return (
                            <li className={"normal-text"} key={item} dangerouslySetInnerHTML={{__html:  "✍ " + item}} />
                          )
                        })}
                      </ul>
                      
                      <div className={"tags-container"}>
                        <p><i className={'txt-sec'}>Key techs:</i> {job.key_techs.join(", ")}</p>
                      </div>
                      {1 < 0 && (
                        <div className={"tags-container"}>
                          <p><i>Key techs:</i></p>
                          {job.key_techs.map((skill: string) => {
                            return (
                              <Tag value={skill} key={skill}/>
                            )
                          })}
                      </div>
                      )}
                    </div>
                  )
                })
              }
            </div>
            
          )
        })
      }
    </div>
  )
}
