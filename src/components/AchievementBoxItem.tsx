import {AchievementType} from "@/app/app.type";

type IProps = {
  data: AchievementType[]
}
export default function AchievementBoxItem(props: IProps) {
  const {data} = props;
  return (
    <div className={"section-wrapper"}>
      <h2 className="box-title">Achievements</h2>
      
      {
        data.map((achievement: AchievementType) => {
          return (
            <div key={achievement.title} className={"achievement-item"}>
              <div className={"txt-line-full"}>
                <p>{achievement.title}</p>
                <p>{achievement.year}</p>
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
