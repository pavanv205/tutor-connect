import { motion } from 'framer-motion';
import { FaRocket, FaEye, FaGraduationCap, FaUserCheck, FaSmileBeam } from 'react-icons/fa';
import SEO from '../components/common/SEO';

const VALUES = [
  {
    icon: <FaGraduationCap />,
    title: 'Academic Excellence',
    description: 'We prioritize personalized, high-quality learning that supports academic success and unlocks students\' potential.'
  },
  {
    icon: <FaUserCheck />,
    title: 'Trust & Safety',
    description: 'Every tutor undergoes thorough identification, background, and academic credential screening before joining.'
  },
  {
    icon: <FaSmileBeam />,
    title: 'Student Centricity',
    description: 'We match teaching methodologies to the student\'s learning style, ensuring interest, pace compatibility, and conceptual clarity.'
  }
];

const AboutUs = () => {
  return (
    <>
      <SEO
        title="About Us"
        description="Learn about TutorConnect, our vision to transform tutoring, and the verified leadership team connecting qualified educators with students."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-20">
        
        {/* Story & Introduction */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-bold text-primary dark:text-blue-500 uppercase tracking-widest block">
              Our Journey
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Transforming Home Tuition in India
            </h1>
            <p className="text-sm text-slate-650 dark:text-slate-450 leading-relaxed font-medium">
               TutorConnect was founded in 2026 to address a common parent struggle: finding qualified, reliable home tutors who genuinely understand a student's individual learning speed and requirements. 
            </p>
            <p className="text-sm text-slate-650 dark:text-slate-455 leading-relaxed font-medium">
              What started as a localized tutor directory in Bangalore has evolved into a robust nationwide platform connecting thousands of parents with pre-screened, certified subject matter experts. We combine the personal touch of face-to-face home tuition with modern scheduling tools.
            </p>
          </div>
          <div className="lg:col-span-5 relative">
            <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-slate-100 shadow-xl border border-slate-100 dark:border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&h=450&q=80"
                alt="Classroom learning"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Mission & Vision cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission */}
          <div className="bg-gradient-to-br from-primary/5 to-blue-500/5 dark:from-slate-900 dark:to-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary dark:bg-blue-500/10 dark:text-blue-400 flex items-center justify-center">
              <FaRocket className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-850 dark:text-white">Our Mission</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              To empower students with personalized private education by connecting them with certified, passionate educators who build solid concepts, inspire confidence, and guide them toward long-term academic excellence.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-slate-900 dark:to-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 flex items-center justify-center">
              <FaEye className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-850 dark:text-white">Our Vision</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              To build a trusted global learning network that makes verified, customized home and online private tutoring accessible to every learner, shaping the future of supplemental education.
            </p>
          </div>
        </section>

        {/* Core Values / Why Choose Us */}
        <section className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold text-primary dark:text-blue-500 uppercase tracking-widest">
              Our Foundations
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Why Parents Choose Us
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {VALUES.map((val, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center space-y-4"
              >
                <div className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-500 border border-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 flex items-center justify-center text-xl shadow-sm">
                  {val.icon}
                </div>
                <h4 className="font-bold text-slate-850 dark:text-slate-205 text-base">{val.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {val.description}
                </p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </>
  );
};

export default AboutUs;
