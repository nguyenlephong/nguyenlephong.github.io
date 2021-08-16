import React from "react";

const ProfileSummary = (props) => {
  const { summaries, theme } = props;
  return (
    <div>
      {summaries.map((item) => {
        return (
          <div key={`sm_${item.id}`} id={`sm_${item.id}`} className={""}>
            <div className={"pf-summary__title"} style={{ color: theme.text }}>
              <i className="far fa-hand-point-right" /> {item.categories}
            </div>

            <div className={"pf-summary__block_description"}>
              {item.descriptions.map((des, ind) => {
                return (
                  <div
                    className={"pf-summary__title-description"}
                    key={`des_${ind}`}
                  >
                    <i className="fas fa-check" /> {des}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProfileSummary;
