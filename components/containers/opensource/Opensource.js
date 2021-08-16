import React, { Component } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import OpensourceCharts from "../../components/OpensourceCharts";
import Organizations from "../../components/Organizations";
import PullRequests from "../../components/PullRequests";
import Issues from "../../components/Issues";
import TopButton from "../../components/TopButton";

class Opensource extends Component {
  render() {
    return (
      <div className="opensource-main">
        <Header theme={this.props.theme} />
        <Organizations theme={this.props.theme} />
        <OpensourceCharts theme={this.props.theme} />
        <PullRequests theme={this.props.theme} />
        <Issues theme={this.props.theme} />
        <Footer theme={this.props.theme} onToggle={this.props.onToggle} />
        <TopButton theme={this.props.theme} />
      </div>
    );
  }
}

export default Opensource;
