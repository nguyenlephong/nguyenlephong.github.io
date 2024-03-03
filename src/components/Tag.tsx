export default function Tag(props: {value: string}){
  const {value} = props;
  return (
    <div className={"tag-item"}>
      <p className={"tag-value"}>{value}</p>
    </div>
  )
}
