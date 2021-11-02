import Link from 'next/link';
import { config, library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faTwitter, faDiscord } from '@fortawesome/free-brands-svg-icons';
import { faUsers } from '@fortawesome/free-solid-svg-icons';


// Tell Font Awesome to skip adding the CSS automatically since it's being imported above
config.autoAddCss = false;
library.add(faGithub, faTwitter, faDiscord, faUsers);

function Footer() {
  return (
    <footer className="relative bg-blueGray-200 pb-5">
      <hr className="border-blueGray-300"></hr>
      <div className="container mx-auto py-3 px-4">
        <div className="flex">
          <div className="w-full text-left xs:w-6/12 px-4">
            <h4 className="text-2xl md:text-3xl fonat-semibold text-blueGray-700">Let&#39;s keep in touch!</h4>
            <h5 className="text-mg md:text-lg mt-0 mb-2 text-blueGray-600">
              Find us on any of these platforms.
            </h5>
          </div>
          <div className="w-full text-right content-end xs:w-6/12 px-4">
            <ul className="flex flex-row-reverse text-right overflow-hidden my-6">
            <li className="bg-white text-blueGray-800 shadow-lg font-normal h-10 w-10 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2" type="button">
                <Link href="https://google.ca/" passHref={true}>
                  <a target="_blank" title="Discord"><FontAwesomeIcon icon={['fab', 'discord']} /></a>
                </Link>
              </li>
              <li className="bg-white text-blueGray-800 shadow-lg font-normal h-10 w-10 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2" type="button">
                <Link href="https://google.ca/" passHref={true}>
                  <a target="_blank" title="Twitter"><FontAwesomeIcon icon={['fab', 'twitter']} /></a>
                </Link>
              </li>
              {/* <li className="bg-white text-blueGray-800 shadow-lg font-normal h-10 w-10 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2" type="button">
                <Link href='/about-us'>
                  <a title="About the team"><FontAwesomeIcon icon={['fas', 'users']} /></a>
                </Link>
              </li> */}
            </ul>
          </div>
        </div>
        <hr className="border-blueGray-300"></hr>
        <div className="flex flex-wrap items-center md:justify-between justify-center">
          <div className="w-full py-4 px-4 mx-auto text-center">
            <div className="text-sm text-blueGray-500 font-semibold py-1">
              Copyright © 2021 Avoaxcado Team
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer