import Image from 'next/image'

export default function Logo() {
  return (
    <div className="flex items-center">
      {/* Circular Logo Image */}
      <div className="w-12 h-12 relative rounded-full overflow-hidden mr-2">
        <Image
          src="/logo.png"
          alt="Burmese Beacon Logo"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Text Branding */}
      <div className="flex items-center">
        {/* Split B */}
        <div className="relative">
          <span className="text-[#ffd700] text-6xl font-bold leading-none block">B</span>
          <span className="text-white text-6xl font-bold leading-none block absolute top-0 left-0" style={{clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)'}}>B</span>
        </div>

        {/* Burmese and Beacon aligned - very close to B */}
        <div className="flex flex-col -ml-1">
          <span className="text-[#ffd700] text-2xl font-bold leading-none">urmese</span>
          <span className="text-white text-2xl font-bold leading-none">eacon</span>
        </div>
      </div>
    </div>
  )
}
