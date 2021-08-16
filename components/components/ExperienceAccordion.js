import React from "react";
import ExperienceCard from "./ExperienceCard.js";
import { Collapse } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";

const { Panel } = Collapse;

const ExperienceAccordion = (props) => {
  const theme = props.theme;
  return (
    <div className="experience-accord">
      <Collapse
        bordered={false}
        defaultActiveKey={[props.sections[0].title]}
        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
        className="site-collapse-custom-collapse"
      >
        {props.sections.map((section, id) => {
          return (
            <React.Fragment key={id}>
              <Panel
                header={section["title"]}
                key={section["title"]}
                className="site-collapse-custom-panel">
    
                {section["experiences"].map((experience) => {
                  return (
                    <ExperienceCard key={experience["title"]} experience={experience} theme={theme} />
                  );
                })}
  
              </Panel>
            </React.Fragment>
            
          );
        })}
      </Collapse>
    </div>
  );
};
export default ExperienceAccordion;
