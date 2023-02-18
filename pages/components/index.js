import React from "react";
import Head from "next/head";
import BooleanTreeConditionFilterContainer from "components/built/bool-tree/BooleanTreeConditionFilterContainer";

const ComponentPage = (props) => {
  return (
    <React.Fragment>
      <Head>
        <title>My Components Built - Nguyễn Lê Phong | Full-stack Software Engineer</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta
          name="description"
          content="My Components Built. A passionate individual who always thrives to work on end-to-end products which develop sustainable and scalable social and technical systems to create impact."
        />
      </Head>
      <div className={"tools-page"}>
        <div id={"components-page-wrap"} className={"components-page-wrap"}>
          <BooleanTreeConditionFilterContainer />
        </div>

      </div>
    </React.Fragment>
  );
};

export default ComponentPage;