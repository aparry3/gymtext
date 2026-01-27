import React from 'react';
import { TrainingProgram } from './types';
import { ArrowRight } from 'lucide-react';

interface Props {
  program: TrainingProgram;
}

export const NorronaProgramCard: React.FC<Props> = ({ program }) => {
  return (
    <div className="group flex flex-col h-full bg-norr-gray/30 hover:bg-norr-gray/50 transition-colors duration-500">
      <div className="relative aspect-[4/5] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={program.image}
          alt={program.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale-[10%]"
          style={program.imagePosition ? { objectPosition: program.imagePosition } : undefined}
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
      </div>

      <div className="p-8 flex flex-col flex-grow">
        <div className="mb-auto">
          <h3 className="text-3xl font-bold uppercase tracking-tight mb-2">{program.title}</h3>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-6">{program.subtitle}</p>

          <div className="space-y-4 mb-8">
            <p className="text-gray-600 font-light leading-relaxed mb-6">
              {program.description}
            </p>

            <div className="border-t border-gray-200 pt-6">
              <span className="block text-xs font-bold uppercase mb-4 text-black">Focus Areas</span>
              <ul className="grid grid-cols-2 gap-y-2">
                {program.focusAreas.map((area, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3"></span>
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <button className="w-full mt-8 group-hover:bg-black group-hover:text-white bg-transparent border border-black text-black py-4 px-6 flex items-center justify-between uppercase tracking-widest text-xs font-bold transition-all duration-300">
          <span>{program.cta}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
