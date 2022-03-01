import Image from 'next/image';

export default function IconTray({ items }) {

  return (
    <div className='flex flex-row w-fit divide-x border rounded-lg overflow-hidden shadow-lg bg-gray-50'>
      {items && items.map((item, index) => {
        return (
          <div className='px-4 my-2 relative h-5 w-5 transform transition duration-500 hover:scale-105 cursor-pointer' key={index}>
            <Image
              src={`/socials/${item}.svg`} placeholder='blur' blurDataURL='/avocado.jpg'
              alt='discord' layout="fill" objectFit="contain" sizes='50vw'
            />
          </div>
        )
      })}
    </div>
  )
}
