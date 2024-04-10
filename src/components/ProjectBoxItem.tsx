import {ProjectType} from "@/app/app.type";
import Tag from "@/components/Tag";

type ProjectBoxIProps = {
  data: ProjectType[]
}

export default function ProjectBox(props: ProjectBoxIProps) {
  const {data} = props
  return (
    <div className={"section-wrapper"}>
      <h2 className={"box-title"}>Projects</h2>
      {
        data.map((ex: ProjectType) => {
          return (
            <div key={ex.name} className={"experience-item"}>
              
              <div className={"txt-line-full"}>
                <h4 className="h-title">{ex.name}</h4>
                <p>{ex.duration}</p>
              </div>
              
              <div className={"tags-container"}>
                {ex.technologies.map((stack: string) => {
                  return (
                    <Tag value={stack} key={stack}/>
                  )
                })}
              </div>
              
              <ul className={"list-none"}>
                {
                  ex.accomplishment.map((item: string) => {
                    return (
                      <li className={"normal-text"} key={item} dangerouslySetInnerHTML={{__html: "👉 " + item}}/>
                    )
                  })
                }
              </ul>
            </div>
          
          )
        })
      }
    </div>
  )
}
