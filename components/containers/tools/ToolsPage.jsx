import React, { Component } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TopButton from "../../components/TopButton";

class ToolsPage extends Component {
  render() {
    return (
      <div>
        <Header theme={this.props.theme} />

        <Footer theme={this.props.theme} />
        <TopButton theme={this.props.theme} />
      </div>
    );
  }
}

export default ToolsPage;