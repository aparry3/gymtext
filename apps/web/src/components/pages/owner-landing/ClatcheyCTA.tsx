import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, Smartphone, CheckCircle2 } from 'lucide-react';

export function ClatcheyCTA() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="grid md:grid-cols-2">
            <div className="p-6 md:p-12 flex flex-col justify-center order-2 md:order-1">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-msj-purple rounded-xl flex items-center justify-center mb-4 md:mb-6">
                <Smartphone className="text-white w-5 h-5 md:w-6 md:h-6" />
              </div>

              <h3 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-3 md:mb-4">
                Hall of Fame Coaching.
                <br />
                <span className="text-msj-purple">Directly via Text.</span>
              </h3>

              <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
                You don&apos;t need a scholarship to Mount St. Joseph to train like a D1 athlete. Get
                Coach Clatchey&apos;s curated daily drills, mental toughness tips, and skill development
                plans delivered to your inbox.
              </p>

              <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                <li className="flex items-center gap-2 md:gap-3 text-gray-700 text-sm md:text-base">
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-500 flex-shrink-0" />
                  <span>Pro-level ball handling drills</span>
                </li>
                <li className="flex items-center gap-2 md:gap-3 text-gray-700 text-sm md:text-base">
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-500 flex-shrink-0" />
                  <span>Shooting mechanics breakdowns</span>
                </li>
                <li className="flex items-center gap-2 md:gap-3 text-gray-700 text-sm md:text-base">
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-500 flex-shrink-0" />
                  <span>Defensive IQ enhancement</span>
                </li>
              </ul>

              <Link
                href="/start"
                className="w-full bg-black text-white py-3 md:py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <MessageSquare className="w-4 h-4 md:w-5 md:h-5" /> Start Your Training
              </Link>
            </div>

            <div className="bg-gray-100 relative h-48 md:h-full md:min-h-[400px] order-1 md:order-2">
              <Image
                src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=1000&fit=crop"
                alt="Athlete looking at phone"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-msj-purple/20 mix-blend-multiply"></div>

              {/* Mock Phone Notification UI */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 bg-white/95 backdrop-blur rounded-2xl p-4 shadow-2xl animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-msj-purple rounded-full flex items-center justify-center text-white font-bold">
                    PC
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Coach Clatchey</p>
                    <p className="text-[10px] text-gray-500">GymText &bull; Now</p>
                  </div>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">
                  &quot;Today we focus on the jab step. It&apos;s not about speed, it&apos;s about
                  selling the drive. Here is the 15-minute breakdown...&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
