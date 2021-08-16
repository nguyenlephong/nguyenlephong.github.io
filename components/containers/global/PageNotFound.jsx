import React from "react";
import {Button, Result} from 'antd';
import Link from 'next/link'
import {BUTTON_TYPE} from "lib/config/constant";

const PageNotFound = () => {

  return (
    <div className={"fw fvh pd-flex-center"}>
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Link href={'/'} style={{display: "flex", justifyContent: "center"}}><Button
            className={BUTTON_TYPE.OUTLINE_GREEN}>Back Home</Button></Link>
        }
      />
    </div>
  )
}

export default PageNotFound;
