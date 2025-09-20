import Navbar from '../layouts/applicants/Navbar';
import Footer from '../layouts/applicants/Footer';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-tracked-primary to-blue-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img 
            src="/smi-logo.jpg" 
            alt="SMI Logo" 
            className="mx-auto h-24 w-auto mb-6 bg-white p-2 rounded-lg"
          />
          <h1 className="text-5xl font-bold mb-4">
            SMI Institute Inc.
          </h1>
          <p className="text-xl mb-2">TESDA-Accredited Training Center</p>
          <p className="text-lg opacity-90 max-w-3xl mx-auto">
            Empowering Filipino talents through quality technical education and skills development programs
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Message */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Welcome to SMI Institute Inc.</h2>
          <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
            As a TESDA-accredited training institution, we are dedicated to providing world-class technical 
            and vocational education that prepares our students for successful careers in the hospitality 
            and culinary industries.
          </p>
        </div>

        {/* Mission & Vision Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-gray-50 p-8 rounded-lg border-l-4 border-tracked-primary">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-tracked-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">M</span>
              Our Mission
            </h3>
            <p className="text-gray-700 leading-relaxed">
              To provide accessible, industry-relevant technical education that equips individuals with 
              the knowledge, skills, and values necessary for professional success and meaningful 
              contributions to society. We strive to bridge the gap between traditional education costs 
              and quality skill development through TESDA-supported programs.
            </p>
          </div>
          
          <div className="bg-gray-50 p-8 rounded-lg border-l-4 border-tracked-secondary">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-tracked-secondary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">V</span>
              Our Vision
            </h3>
            <p className="text-gray-700 leading-relaxed">
              To be the leading technical and vocational training institution in the Philippines, 
              recognized for excellence in hospitality and culinary education, fostering graduates 
              who are industry-ready, innovative, and globally competitive professionals.
            </p>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-16 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">About Our Institution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-gray-700 leading-relaxed mb-4">
                SMI Institute Inc. stands as a premier TESDA-accredited training center committed to 
                delivering exceptional technical education and skills development. Our institution serves 
                a diverse community of learners, including both self-funded students and government-sponsored 
                scholars through various TESDA programs.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We specialize in preparing students for employment, professional advancement, and 
                entrepreneurial opportunities within the dynamic tourism and hospitality sector through 
                comprehensive, hands-on training programs.
              </p>
            </div>
            <div className="bg-tracked-primary bg-opacity-10 p-6 rounded-lg">
              <h4 className="font-bold text-tracked-primary mb-3">Key Statistics</h4>
              <div className="space-y-2 text-sm text-white">
                <div className="flex justify-between">
                  <span>TESDA Accredited:</span>
                  <span className="font-semibold">✓ Certified</span>
                </div>
                <div className="flex justify-between">
                  <span>Training Programs:</span>
                  <span className="font-semibold">8 Specializations</span>
                </div>
                <div className="flex justify-between">
                  <span>Student Types:</span>
                  <span className="font-semibold">Scholars & Self-funded</span>
                </div>
                <div className="flex justify-between">
                  <span>Industry Focus:</span>
                  <span className="font-semibold">Hospitality & Culinary</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Programs */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Academic Programs</h2>
          <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
            Our comprehensive curriculum is designed to meet industry standards and prepare students 
            for successful careers in hospitality and culinary arts.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Bartending', icon: '🍸', description: 'Professional mixology and beverage service' },
              { name: 'Barista Training', icon: '☕', description: 'Coffee preparation and café operations' },
              { name: 'Housekeeping', icon: '🏨', description: 'Hotel and facility maintenance management' },
              { name: 'Food & Beverage Services', icon: '🍽️', description: 'Restaurant and hospitality service' },
              { name: 'Bread & Pastry Production', icon: '🥖', description: 'Baking and pastry arts' },
              { name: 'Events Management', icon: '🎉', description: 'Event planning and coordination' },
              { name: 'Chef\'s Catering Services', icon: '👨‍🍳', description: 'Professional catering operations' },
              { name: 'Cookery', icon: '🍳', description: 'Culinary arts and kitchen management' }
            ].map((program, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{program.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{program.name}</h3>
                <p className="text-sm text-gray-600">{program.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Admissions Call to Action */}
        <div className="bg-tracked-primary text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Begin Your Educational Journey?</h2>
          <p className="text-xl mb-6 opacity-90">
            Take the first step towards a rewarding career in hospitality and culinary arts
          </p>
          <div className="space-x-4">
            <a 
              href="/signup" 
              className="inline-block bg-white text-tracked-primary hover:bg-gray-100 px-8 py-3 rounded-full text-sm font-bold transition duration-200"
            >
              Apply for Admission
            </a>
            <a 
              href="/courses" 
              className="inline-block bg-tracked-secondary hover:bg-yellow-600 text-white px-8 py-3 rounded-full text-sm font-bold transition duration-200"
            >
              Explore Programs
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;