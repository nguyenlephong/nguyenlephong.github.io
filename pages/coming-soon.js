import React from "react";
import Head from "next/head";
import { House, Wrench } from "phosphor-react";
import Link from "next/link";

const ComingSoonPage = props => {
  return (
    <React.Fragment>
      <Head>
        <title>Coming soon - Nguyễn Lê Phong | FullStack Software Engineer</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta
          name="description"
          content="Coming soon. Nguyễn Lê Phong | FullStack Software Engineer"
        />
      </Head>
      <div className="coming-soon-page hero bg-gray-100 py-16">

        <div className="px-4 mx-auto">
          <div className="hero-wrapper grid grid-cols-12 gap-8 items-center">

            <div className="hero-text col-span-6 xs:col-span-12">
              <h1 className="font-bold text-4xl md:text-5xl max-w-xl text-gray-900 leading-tight">Coming soon</h1>
              <p className="text-gray-800 text-base leading-relaxed mt-8 font-semibold">Stay tuned. We are launching
                soon. We are working hard. We are almost ready to launch. Something awesome is coming soon. Be first to
                know.</p>
              <div className="get-app flex space-x-5 mt-10 justify-center md:justify-start">
                <Link href="/">
                  <button className="apple bg-white shadow-md px-3 py-2 rounded-lg flex items-center space-x-4">
                    <div className="logo">
                      <House size={24} />
                    </div>
                    <div className="text">
                      <p className=" text-xs text-gray-600">Back to</p>
                      <p className=" text-xs font-semibold text-gray-900">Home page</p>
                    </div>
                  </button>
                </Link>

                <Link href="/tools">
                  <button className="google bg-white shadow-md px-3 py-2 rounded-lg flex items-center space-x-4">
                    <div className="image">
                      <Wrench size={24} />
                    </div>
                    <div className="text">
                      <p className="text-xs text-gray-600">Back to </p>
                      <p className="text-xs font-semibold text-gray-900">Tools page</p>
                    </div>
                  </button>
                </Link>
              </div>
            </div>

            <div className="hero-image col-span-6 xs:col-span-12 items-center" style={{
              paddingTop: 12
            }}>
              <div className="h-full object-cover "
                   style={{
                     backgroundImage: `url(/assests/photos/coming-soon-illustration.svg)`,
                     backgroundRepeat: "no-repeat",
                     width: "100%",
                     height: "420px"
                   }}
              />
            </div>
          </div>
        </div>


      </div>

    </React.Fragment>
  );
};

ComingSoonPage.propTypes = {};

export default ComingSoonPage;