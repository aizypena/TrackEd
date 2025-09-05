import React from 'react';
import Navbar from '../layouts/applicants/Navbar';

function CourseOffered() {
  const courses = [
    {
      id: 1,
      title: "Bartending NC II",
      duration: "72 Hours",
      schedule: "Weekdays / Weekends",
      description: "Master the art of mixology and professional beverage service. Learn classic and modern cocktail preparation, bar operations, and customer service excellence.",
      competencies: [
        "Prepare and serve alcoholic and non-alcoholic beverages",
        "Maintain bar equipment and inventory",
        "Provide excellent customer service",
        "Handle cash transactions and billing"
      ],
      careerOpportunities: ["Hotel Bartender", "Restaurant Bar Staff", "Event Bartender", "Bar Supervisor"]
    },
    {
      id: 2,
      title: "Barista Training NC II",
      duration: "60 Hours",
      schedule: "Weekdays / Weekends",
      description: "Become a professional coffee specialist. Learn espresso preparation, latte art, coffee brewing techniques, and café operations management.",
      competencies: [
        "Prepare various coffee beverages",
        "Operate espresso machines and grinders",
        "Create latte art and coffee presentations",
        "Manage café inventory and customer orders"
      ],
      careerOpportunities: ["Coffee Shop Barista", "Café Supervisor", "Coffee Trainer", "Café Owner"]
    },
    {
      id: 3,
      title: "Housekeeping NC II",
      duration: "96 Hours",
      schedule: "Weekdays / Weekends",
      description: "Learn professional housekeeping standards for hotels and hospitality establishments. Master cleaning techniques, room preparation, and guest service protocols.",
      competencies: [
        "Clean and maintain guest rooms and public areas",
        "Handle laundry and linen management",
        "Follow safety and sanitation protocols",
        "Provide guest assistance and support"
      ],
      careerOpportunities: ["Hotel Housekeeper", "Room Attendant", "Housekeeping Supervisor", "Facilities Manager"]
    },
    {
      id: 4,
      title: "Food and Beverage Services NC II",
      duration: "120 Hours",
      schedule: "Weekdays / Weekends",
      description: "Excel in restaurant and hospitality service. Learn table service, menu knowledge, wine service, and professional dining room operations.",
      competencies: [
        "Provide professional table service",
        "Take orders and serve food and beverages",
        "Handle guest complaints and requests",
        "Maintain dining area cleanliness and setup"
      ],
      careerOpportunities: ["Restaurant Server", "Banquet Staff", "Restaurant Supervisor", "Hospitality Coordinator"]
    },
    {
      id: 5,
      title: "Bread and Pastry Production NC II",
      duration: "144 Hours",
      schedule: "Weekdays / Weekends",
      description: "Master the art of baking and pastry making. Learn bread production, cake decoration, pastry techniques, and commercial baking operations.",
      competencies: [
        "Prepare various types of bread and pastries",
        "Decorate cakes and pastries",
        "Operate baking equipment safely",
        "Follow recipes and maintain quality standards"
      ],
      careerOpportunities: ["Baker", "Pastry Chef", "Cake Decorator", "Bakery Owner"]
    },
    {
      id: 6,
      title: "Events Management NC III",
      duration: "180 Hours",
      schedule: "Weekdays / Weekends",
      description: "Plan and execute successful events. Learn event coordination, vendor management, budget planning, and client relations for various occasions.",
      competencies: [
        "Plan and coordinate events",
        "Manage event budgets and timelines",
        "Coordinate with vendors and suppliers",
        "Handle client communications and requirements"
      ],
      careerOpportunities: ["Event Coordinator", "Wedding Planner", "Corporate Events Manager", "Event Consultant"]
    },
    {
      id: 7,
      title: "Chef's Catering Services NC II",
      duration: "160 Hours",
      schedule: "Weekdays / Weekends",
      description: "Develop professional catering skills. Learn menu planning, food preparation for large groups, catering operations, and service management.",
      competencies: [
        "Plan and prepare catered meals",
        "Manage catering operations and logistics",
        "Coordinate catering staff and service",
        "Maintain food safety and quality standards"
      ],
      careerOpportunities: ["Catering Chef", "Catering Manager", "Food Service Coordinator", "Catering Business Owner"]
    },
    {
      id: 8,
      title: "Cookery NC II",
      duration: "168 Hours",
      schedule: "Weekdays / Weekends",
      description: "Master fundamental culinary skills. Learn cooking techniques, menu preparation, kitchen operations, and food safety in professional kitchen environments.",
      competencies: [
        "Prepare various dishes and cuisines",
        "Operate kitchen equipment safely",
        "Follow recipes and portion control",
        "Maintain kitchen hygiene and food safety"
      ],
      careerOpportunities: ["Cook", "Kitchen Staff", "Chef de Partie", "Restaurant Owner"]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-tracked-primary to-blue-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Academic Programs</h1>
          <p className="text-xl mb-6">TESDA-Accredited Technical and Vocational Courses</p>
          <p className="text-lg opacity-90 max-w-3xl mx-auto">
            Comprehensive training programs designed to prepare students for successful careers 
            in the hospitality and culinary industries
          </p>
        </div>
      </div>

      {/* Program Overview */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Programs?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our TESDA-accredited programs combine theoretical knowledge with hands-on practical training, 
              ensuring graduates are industry-ready and equipped with in-demand skills.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-tracked-primary text-white rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">TESDA Certified</h3>
              <p className="text-gray-600">All programs are officially accredited by TESDA, ensuring quality education and recognized certification.</p>
            </div>
            <div className="text-center">
              <div className="bg-tracked-secondary text-white rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Instructors</h3>
              <p className="text-gray-600">Learn from industry professionals with years of experience in hospitality and culinary fields.</p>
            </div>
            <div className="text-center">
              <div className="bg-tracked-primary text-white rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Career Ready</h3>
              <p className="text-gray-600">Practical training and industry connections prepare graduates for immediate employment opportunities.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Listings */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Available Programs</h2>
          
          <div className="space-y-8">
            {courses.map((course) => (
              <div key={course.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    {/* Course Header */}
                    <div className="flex-1">
                      <div className="mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{course.title}</h3>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              Duration: {course.duration}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              Schedule: {course.schedule}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 leading-relaxed mb-6">{course.description}</p>
                      
                      {/* Course Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Competencies */}
                        <div>
                          <h4 className="font-bold text-gray-900 mb-3">Core Competencies</h4>
                          <ul className="space-y-2">
                            {course.competencies.map((competency, index) => (
                              <li key={index} className="flex items-start">
                                <span className="w-2 h-2 bg-tracked-secondary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                <span className="text-gray-700 text-sm">{competency}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {/* Career Opportunities */}
                        <div>
                          <h4 className="font-bold text-gray-900 mb-3">Career Opportunities</h4>
                          <div className="space-y-2">
                            {course.careerOpportunities.map((career, index) => (
                              <div key={index} className="bg-gray-50 px-3 py-2 rounded-md">
                                <span className="text-gray-800 text-sm font-medium">{career}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enrollment Button */}
                    <div className="mt-6 lg:mt-0 lg:ml-8 flex-shrink-0">
                      <a 
                        href="/signup" 
                        className="inline-block bg-tracked-primary hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-bold transition duration-200 w-full lg:w-auto text-center"
                      >
                        Enroll Now
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admission Information */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Admission Information</h2>
            <p className="text-lg text-gray-600">Ready to start your educational journey? Here's what you need to know.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">Admission Requirements</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• High School Diploma or equivalent</li>
                <li>• Valid Government ID</li>
                <li>• Birth Certificate</li>
                <li>• Medical Certificate</li>
                <li>• 2x2 ID Photos</li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">Scholarship Programs</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• TESDA Training for Work Scholarship Program</li>
                <li>• Private Enterprise Partnership</li>
                <li>• Special Training for Employment Program</li>
                <li>• Self-funded options available</li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">Class Schedule Options</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Morning Classes: 8:00 AM - 12:00 PM</li>
                <li>• Afternoon Classes: 1:00 PM - 5:00 PM</li>
                <li>• Weekend Classes: Saturdays</li>
                <li>• Flexible scheduling available</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-tracked-primary text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Begin Your Professional Journey Today</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of successful graduates who have launched their careers through our programs
          </p>
          <div className="space-x-4">
            <a 
              href="/signup" 
              className="inline-block bg-white text-tracked-primary hover:bg-gray-100 px-8 py-3 rounded-full font-bold transition duration-200"
            >
              Apply for Admission
            </a>
            <a 
              href="/about" 
              className="inline-block bg-tracked-secondary hover:bg-yellow-600 text-white px-8 py-3 rounded-full font-bold transition duration-200"
            >
              Learn More About SMI
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            © Copyright 2025 <span className="font-bold">SMI INSTITUTE INC.</span> | TESDA-Accredited Training Center
          </p>
        </div>
      </div>
    </div>
  );
}

export default CourseOffered;