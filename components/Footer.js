import Image from 'next/image';


function Footer() {
  return (
    <footer className="flex flex-nowrap flex-col gap-2 items-center px-0 py-1 w-full">

      <div className="py-2 flex flex-col justify-between items-center xsm:flex-row gap-2 w-full">
        <div className="px-4 flex-1 text-center">
          <h4 className="text-2xl md:text-3xl text-blueGray-700">Let&#39;s keep in touch!</h4>
          <h5 className="text-mg md:text-lg mt-0 mb-2 text-blueGray-600">
            Find us on any of these platforms.
          </h5>
          <div className='flex flex-row gap-2 justify-center'>
            <a href="https://google.ca/" target='blank' className='relative h-10 w-10 cursor-pointer'>
              <Image
                src={'/socials/discord-solid.svg'} placeholder='blur' blurDataURL='/avocado.jpg'
                alt='discord' layout="fill" objectFit="contain" sizes='50vw'
              />
            </a>
            <a href="https://google.ca/" target='blank' className='relative h-10 w-10 cursor-pointer'>
              <Image
                src={'/socials/twitter-solid.svg'} placeholder='blur' blurDataURL='/avocado.jpg'
                alt='discord' layout="fill" objectFit="contain" sizes='50vw'
              />
            </a>
          </div>
        </div>
        <div className="px-4 flex-1 text-center">
          <div className='flex flex-row gap-2'>
            <div className='flex flex-col flex-1 text-left'>
              {/* <div className='font-bold'>About Us</div> */}
              <div>Team</div>
              <div>Partners</div>
              <div><a href="https://docs.bumblebuzz.io/" target='blank' className='text-blue-500'>Documentation</a></div>
            </div>
            <div className='flex flex-col flex-1 text-left'>
              {/* <div className='font-bold'>Additional Info</div> */}
              <div>Analytics</div>
              <div>Feedback</div>
              <div>Report Issue</div>
            </div>
          </div>
        </div>
      </div>

      <hr className="w-full border-blueGray-300" />

      <div className="flex flex-col justify-between items-center xsm:flex-row gap-2 w-full">
        <div className="w-full py-4 px-4 mx-auto text-center">
          <div className="text-sm text-blueGray-500 font-semibold py-1">
            Copyright © 2022 BumbleBuzz Team
          </div>
        </div>
      </div>

    </footer>
  )
}

export default Footer