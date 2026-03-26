import Image from 'next/image';

interface Photo {
  src: string;
  alt: string;
  caption: string;
  subcaption: string;
}

const PHOTOS: Photo[] = [
  {
    src: '/coaches/mikey-swiercz/JHU-Header.jpeg',
    alt: 'Mikey Swiercz NCAA All-American at Johns Hopkins',
    caption: 'NCAA All-American',
    subcaption: 'Johns Hopkins University',
  },
  {
    src: '/coaches/mikey-swiercz/Christos-Natty-Ship.jpeg',
    alt: 'Christos FC National Championship celebration',
    caption: 'National Champion',
    subcaption: 'US Open Cup | Christos FC',
  },
  {
    src: '/coaches/mikey-swiercz/PCB-Pirates.jpeg',
    alt: 'Mikey Swiercz with PCB Pirates',
    caption: 'Semi-Professional',
    subcaption: 'PDL | PCB Pirates',
  },
  {
    src: '/coaches/mikey-swiercz/PB-Suns-Action2.jpeg',
    alt: 'Mikey Swiercz in USL2 action',
    caption: 'Professional',
    subcaption: 'USL2 | PB Suns',
  },
];

export function MikeyPhotoShowcase() {
  return (
    <section className="py-16 md:py-24 bg-gray-900 relative">
      {/* Texture overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      ></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-[#cfae70] font-bold tracking-wider uppercase mb-2 text-sm">
            A Career at Every Level
          </h2>
          <h3 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
            From High School to the National Stage
          </h3>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
            Nearly two decades of competitive soccer spanning varsity stardom, collegiate excellence,
            and professional play.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {PHOTOS.map((photo, index) => (
            <div
              key={index}
              className="group relative rounded-xl overflow-hidden bg-gray-800 border border-gray-700 hover:border-[#002D72] transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="aspect-[4/5] overflow-hidden relative">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80"></div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6">
                <h4 className="text-base md:text-xl font-bold text-white mb-0.5 md:mb-1">
                  {photo.caption}
                </h4>
                <p className="text-[#cfae70] font-medium text-xs md:text-sm line-clamp-1">
                  {photo.subcaption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
