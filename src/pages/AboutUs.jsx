import { motion } from 'framer-motion';
import { FaRocket, FaEye, FaGraduationCap, FaUserCheck, FaSmileBeam } from 'react-icons/fa';
import SEO from '../components/common/SEO';
import reviewsData from '../data/reviews.json';

const TEAM = [
  {
    name: 'Siddharth Sen',
    role: 'Founder & CEO',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
    bio: 'EdTech pioneer with 12+ years experience in curriculum designing and school systems.'
  },
  {
    name: 'Dr. Kriti Nair',
    role: 'Head of Academic Quality',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
    bio: 'Former school principal, oversees tutor evaluation frameworks and study material quality.'
  },
  {
    name: 'Amit Singhal',
    role: 'Technology Lead',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
    bio: 'Full stack architect, driving secure matching algorithms and virtual classroom integrations.'
  }
];

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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 12 }
    }
  };

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
              TutorConnect was founded in 2024 to address a common parent struggle: finding qualified, reliable home tutors who genuinely understand a student's individual learning speed and requirements. 
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

        {/* Leadership Crew */}
        <section className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold text-primary dark:text-blue-500 uppercase tracking-widest">
              Founders & Builders
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Meet Our Team
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TEAM.map((member, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm text-center flex flex-col items-center space-y-4 hover:shadow-md transition-shadow group"
              >
                <img
                  src={member.photo}
                  alt={member.name}
                  className="h-24 w-24 rounded-full object-cover border-2 border-slate-100 dark:border-slate-800 group-hover:scale-105 transition-transform duration-350 shadow-md"
                />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-850 dark:text-slate-205 text-base">{member.name}</h4>
                  <p className="text-xs text-primary dark:text-blue-400 font-bold uppercase tracking-wider">{member.role}</p>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Review Grid */}
        <section className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold text-primary dark:text-blue-500 uppercase tracking-widest">
              Verified Reviews
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Feedback from Our Community
            </h3>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {reviewsData.map((rev) => (
              <motion.div
                key={rev.id}
                variants={cardVariants}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
              >
                <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed font-medium mb-6">
                  "{rev.comment}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className="h-10 w-10 rounded-full object-cover shrink-0"
                  />
                  <div>
                    <h5 className="font-bold text-slate-850 dark:text-slate-200 text-xs">
                      {rev.name}
                    </h5>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">
                      {rev.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

      </div>
    </>
  );
};

export default AboutUs;
