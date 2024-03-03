import {ExperienceItemType, JobType} from "@/app/app.type";

type ExperienceBoxIProps = {
  data: ExperienceItemType[]
}

export default function ExperienceBox(props: ExperienceBoxIProps){
  const {data} = props
  return (
    <div className={"section-wrapper"}>
      <h2 className={"box-title"}>Experiences</h2>
      {
        data.map((ex: ExperienceItemType) => {
          return (
            <div key={ex.company} className={"experience-item"}>
              
              <div className={"txt-line-full"}>
                <h4 className="h-title">{ex.company}</h4>
                <p>{ex.location}</p>
              </div>
              
              {
                ex.jobs.map((job: JobType) => {
                  return (
                    <div key={job.title} className={"job-item"}>
                      
                      <div className={"txt-line-full"}>
                        <p>{job.title}</p>
                        <p>{job.duration}</p>
                      </div>
                      
                      <ul className={"list-none"}>
                        {job.responsibilities.map((item: string) => {
                          return (
                            <li key={item} dangerouslySetInnerHTML={{__html:  "✍ " + item}} />
                          )
                        })}
                      </ul>
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
