import { EducationType} from "@/app/app.type";

type IProps = {
  data: EducationType[]
}
export default function EducationBoxItem(props: IProps) {
  const {data} = props;
  return (
    <div className={"section-wrapper"}>
      <h2 className="box-title">Education</h2>
      
      {
        data.map((achievement: EducationType) => {
          return (
            <div key={achievement.school} className={"education-item"}>
              <div className={"txt-line-full"}>
                <p className={"h-title"}>{achievement.school}. <strong>(GPA {achievement.GPA})</strong></p>
                <p>{achievement.duration}</p>
              </div>
              
              <ul className={"list-none"}>
                {achievement.description.map(item => {
                  return <li key={item} dangerouslySetInnerHTML={{__html: item}}/>
                })}
              </ul>
            </div>
          )
        })
      }
    </div>
  )
}
