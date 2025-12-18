import React from 'react';

const resorts = [
  {
    name: "InterContinental Danang",
    location: "Vietnam",
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop",
    feature: "Jungle Gym & Yoga Deck"
  },
  {
    name: "Kimpton Seafire Resort",
    location: "Grand Cayman",
    img: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800&auto=format&fit=crop",
    feature: "Oceanfront HIIT Studio"
  },
  {
    name: "Six Senses Ibiza",
    location: "Spain",
    img: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=800&auto=format&fit=crop",
    feature: "Recovery & Biohacking Lab"
  }
];

const IHGTestimonials: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-serif text-slate-900 mb-2">Participating Resorts</h2>
            <p className="text-slate-500">Discover GymText at these premier wellness destinations.</p>
          </div>
          <a href="#" className="text-orange-600 font-semibold hover:text-orange-700 mt-4 md:mt-0 pb-1 border-b-2 border-orange-100 hover:border-orange-600 transition-colors">
            View All 150+ Locations
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {resorts.map((resort, idx) => (
            <div key={idx} className="group cursor-pointer">
              <div className="relative h-80 rounded-xl overflow-hidden mb-4">
                <img
                  src={resort.img}
                  alt={resort.name}
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-xs uppercase tracking-wider mb-1 opacity-90">{resort.location}</p>
                  <h3 className="text-2xl font-serif">{resort.name}</h3>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-800">{resort.feature}</span>
                <span className="text-orange-600 group-hover:translate-x-1 transition-transform">Explore &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IHGTestimonials;
