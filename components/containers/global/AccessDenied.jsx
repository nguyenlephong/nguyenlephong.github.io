import React from "react";
import {Button, Result} from 'antd';
import Link from 'next/link'
import {BUTTON_TYPE} from "lib/config/constant";

const AccessDeniedPage = () => {

  return (
    <div className={"fvh pd-flex-center"}>
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Link href={'/'} style={{display: "flex", justifyContent: "center" }} ><Button className={BUTTON_TYPE.OUTLINE_GREEN}>Back Home</Button></Link>
        }
      />
    </div>
  )
}

export default AccessDeniedPage;
