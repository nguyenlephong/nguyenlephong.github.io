type BoxItemProps = {
  title: string;
  description: string[]
}

export default function BoxItem(props: BoxItemProps) {
  return (
    <div className={"box-item"}>
      <h2 className={"box-title"}>{props.title}</h2>
      
      <div className={"box-info"}>
        {props.description.map((it: string) => {
          return (
            <p key={it} dangerouslySetInnerHTML={{__html: it}} className={"box-item-text"} />
          )
        })}
      </div>
    </div>
  )
}
