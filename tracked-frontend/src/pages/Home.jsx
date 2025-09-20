import { Link } from 'react-router-dom';
import Navbar from '../layouts/applicants/Navbar';
import Footer from '../layouts/applicants/Footer';
import { 
  MdSchool,
  MdTrendingUp,
  MdVerified,
  MdAssignment,
  MdPeople,
  MdBusiness,
  MdStar,
  MdCheckCircle,
  MdArrowForward,
  MdEmojiEvents,
  MdWorkOutline,
  MdLocationOn,
  MdPhone,
  MdEmail
} from 'react-icons/md';

const Home = () => {
  const portals = [
    {
      title: "Apply for Training",
      description: "Start your journey with SMI's TESDA-accredited training programs",
      link: "/applicants/dashboard",
      color: "tracked-primary",
      icon: <MdAssignment className="h-8 w-8" />,
      features: ["Browse Programs", "Submit Applications", "Track Status", "Upload Documents"]
    },
    {
      title: "Student Access",
      description: "Continue your learning journey with our comprehensive LMS",
      link: "/students/dashboard",
      color: "tracked-secondary",
      icon: <MdSchool className="h-8 w-8" />,
      features: ["Access Courses", "Track Progress", "Complete Assignments", "View Certificates"]
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-600 hover:bg-blue-700 border-blue-200",
      green: "bg-green-600 hover:bg-green-700 border-green-200",
      purple: "bg-purple-600 hover:bg-purple-700 border-purple-200",
      orange: "bg-orange-600 hover:bg-orange-700 border-orange-200",
      indigo: "bg-indigo-600 hover:bg-indigo-700 border-indigo-200",
      "tracked-primary": "bg-tracked-primary hover:bg-tracked-primary/90 border-tracked-primary/20",
      "tracked-secondary": "bg-tracked-secondary hover:bg-tracked-secondary/90 border-tracked-secondary/20"
    };
    return colors[color];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-tracked-primary bg-opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-y-6"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full text-sm font-medium mb-8">
              <MdVerified className="h-4 w-4 mr-2" />
              TESDA Accredited Training Center • Established 2010
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
              SMI Training
              <span className="block text-yellow-400">Institute</span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-light mb-8 max-w-4xl mx-auto opacity-90">
              Excellence in Tourism, Hospitality & Culinary Education
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform your career with industry-leading certification programs designed by experienced professionals. 
              Join over 1,200 successful graduates who have built thriving careers in the hospitality industry.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                to="/applicants/dashboard"
                className="group inline-flex items-center justify-center bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Start Your Application
                <MdArrowForward className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/about"
                className="group inline-flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300"
              >
                Learn More About Us
                <MdSchool className="h-5 w-5 ml-2" />
              </Link>
            </div>
          </div>
          
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-yellow-400 mb-2">1,200+</div>
              <div className="text-sm text-blue-100 font-medium">Successful Graduates</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-yellow-400 mb-2">8</div>
              <div className="text-sm text-blue-100 font-medium">TESDA Programs</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-yellow-400 mb-2">95%</div>
              <div className="text-sm text-blue-100 font-medium">Employment Rate</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-yellow-400 mb-2">15+</div>
              <div className="text-sm text-blue-100 font-medium">Years Excellence</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose SMI Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose SMI Institute?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to providing world-class technical education that prepares you for success in the hospitality industry
            </p>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="group text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <MdEmojiEvents className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Industry Excellence</h3>
              <p className="text-gray-600 leading-relaxed">
                Our programs are designed in partnership with industry leaders, ensuring you learn the most current practices and standards in hospitality and culinary arts.
              </p>
            </div>
            
            <div className="group text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <MdWorkOutline className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Career Support</h3>
              <p className="text-gray-600 leading-relaxed">
                From job placement assistance to career counseling, we provide comprehensive support to help you launch and advance your career in the hospitality industry.
              </p>
            </div>
            
            <div className="group text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <MdVerified className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">TESDA Certified</h3>
              <p className="text-gray-600 leading-relaxed">
                All our programs are TESDA-accredited, ensuring you receive nationally recognized certifications that are valued by employers across the Philippines.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Portals Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Start Your Journey Today</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose your path to professional development and join thousands of successful graduates who have transformed their careers with SMI Institute
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {portals.map((portal, index) => (
              <div key={index} className="group relative bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${portal.color === 'tracked-primary' ? 'from-tracked-primary/5 to-tracked-primary/10' : portal.color === 'tracked-secondary' ? 'from-tracked-secondary/5 to-tracked-secondary/10' : portal.color === 'indigo' ? 'from-indigo-500/5 to-indigo-600/10' : 'from-green-500/5 to-green-600/10'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                <div className="relative p-10">
                  <div className="flex items-start mb-8">
                    <div className={`p-5 rounded-2xl mr-6 shadow-lg ${portal.color === 'tracked-primary' ? 'bg-gradient-to-br from-tracked-primary to-tracked-primary/90' : portal.color === 'tracked-secondary' ? 'bg-gradient-to-br from-tracked-secondary to-tracked-secondary/90' : portal.color === 'indigo' ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' : 'bg-gradient-to-br from-green-500 to-green-600'} text-white`}>
                      {portal.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{portal.title}</h3>
                      <p className="text-gray-600 text-lg leading-relaxed">{portal.description}</p>
                    </div>
                  </div>
                  
                  <div className="mb-10">
                    <h4 className="font-bold text-gray-900 mb-6 text-lg">What You Can Do:</h4>
                    <ul className="space-y-4">
                      {portal.features.map((feature, idx) => (
                        <li key={idx} className="text-gray-700 flex items-center text-lg">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                            <MdCheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Link 
                    to={portal.link}
                    className={`group/btn relative w-full inline-flex items-center justify-center ${getColorClasses(portal.color)} text-white font-bold py-5 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl overflow-hidden`}
                  >
                    <span className="relative z-10 flex items-center">
                      Get Started Now
                      <MdArrowForward className="h-6 w-6 ml-3 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* footer */}
      <Footer />
    </div>
  );
};

export default Home;
