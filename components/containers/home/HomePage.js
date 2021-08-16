import React, { Component } from "react";
import Header from "../../components/Header";
import Greeting from "../../components/Greeting";
import Skills from "../../components/Skills";
import Footer from "../../components/Footer";
import TopButton from "../../components/TopButton";

class HomePage extends Component {
  render() {
    return (
      <div>
        <Header theme={this.props.theme} />
        <Greeting theme={this.props.theme} />
        <Skills theme={this.props.theme} />
        <Footer theme={this.props.theme} />
        <TopButton theme={this.props.theme} />
      </div>
    );
  }
}

export default HomePage;
