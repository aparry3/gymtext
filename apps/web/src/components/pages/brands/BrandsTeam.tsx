'use client';

import React from 'react';
import { Mail } from 'lucide-react';

interface TeamMemberProps {
  name: string;
  role: string;
  email: string;
  imageColor: string;
}

const TeamMember: React.FC<TeamMemberProps> = ({
  name,
  role,
  email,
  imageColor,
}) => (
  <div className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=${imageColor}`}
          alt={name}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
        />
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900">{name}</h3>
        <p className="text-sm text-gymblue-600 font-medium">{role}</p>
      </div>
    </div>
    <div className="flex gap-2">
      <a
        href={`mailto:${email}`}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 w-full justify-center font-medium"
      >
        <Mail className="h-4 w-4" />
        Email
      </a>
    </div>
  </div>
);

export const BrandsTeam: React.FC = () => {
  return (
    <section id="team" className="py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Meet the builders.
            </h2>
            <p className="text-lg text-gray-400">
              We&apos;re a team of engineers, coaches, and designers obsessed with
              removing friction from fitness.
            </p>
          </div>
          <div>
            <a
              href="mailto:kyle@gymtext.co"
              className="inline-flex items-center justify-center px-6 py-3 border border-white/20 text-base font-medium rounded-full text-white hover:bg-white hover:text-gray-900 transition-all"
            >
              Get in touch
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TeamMember
            name="Kyle Doran"
            role="CEO"
            email="kyle@gymtext.co"
            imageColor="b6e3f4"
          />
          <TeamMember
            name="Kevin Doran"
            role="CPO"
            email="kevin@gymtext.co"
            imageColor="ffdfbf"
          />
          <TeamMember
            name="Aaron Parry"
            role="CTO"
            email="aaron@gymtext.co"
            imageColor="c0aede"
          />
        </div>
      </div>
    </section>
  );
};
