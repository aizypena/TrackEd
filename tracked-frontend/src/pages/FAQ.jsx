import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../layouts/applicants/Navbar';
import Footer from '../layouts/applicants/Footer';

function FAQ() {
  const navigate = useNavigate();
  const [openQuestion, setOpenQuestion] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkExistingAuth = () => {
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          
          // If user is applicant, redirect to dashboard
          if (parsedUser.role === 'applicant') {
            navigate('/applicant/dashboard', { replace: true });
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };

    checkExistingAuth();
  }, [navigate]);

  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  const faqCategories = [
    {
      category: "About SMI Institute",
      questions: [
        {
          question: "What is SMI Institute Inc.?",
          answer: "SMI Institute Inc. is a TESDA-accredited training center that provides quality technical and vocational education in hospitality and culinary arts. We offer comprehensive training programs designed to prepare students for successful careers in the industry."
        },
        {
          question: "Is SMI Institute accredited?",
          answer: "Yes, SMI Institute Inc. is fully accredited by TESDA (Technical Education and Skills Development Authority), ensuring that all our programs meet national standards and our certificates are recognized nationwide."
        },
        {
          question: "When was SMI Institute established?",
          answer: "SMI Institute Inc. has been serving the Filipino community by providing quality technical and vocational education, helping thousands of students develop skills for successful careers in hospitality and culinary arts."
        },
        {
          question: "What is SMI Institute's mission?",
          answer: "Our mission is to provide accessible, industry-relevant technical education that equips individuals with the knowledge, skills, and values necessary for professional success and meaningful contributions to society."
        }
      ]
    },
    {
      category: "Admissions & Enrollment",
      questions: [
        {
          question: "How do I apply for admission?",
          answer: "You can apply online through our website by clicking the 'Apply Now' button and completing the multi-step application form. You can also visit our campus directly for walk-in applications."
        },
        {
          question: "What are the admission requirements?",
          answer: "Basic requirements include: High School Diploma or equivalent, Valid Government ID, Birth Certificate, Medical Certificate, and 2x2 ID photos. Additional requirements may vary depending on the specific program."
        },
        {
          question: "When does enrollment start?",
          answer: "We offer rolling admissions throughout the year with multiple batch openings. Contact our admissions office for specific enrollment periods and available slots for your preferred program."
        },
        {
          question: "Can I enroll if I'm a working professional?",
          answer: "Yes! We offer flexible scheduling options including weekend classes and evening sessions to accommodate working professionals who want to enhance their skills or change careers."
        },
        {
          question: "Is there an entrance exam?",
          answer: "No entrance exam is required for most programs. However, we conduct orientation sessions to ensure students understand the program requirements and expectations before starting their training."
        }
      ]
    },
    {
      category: "Academic Programs",
      questions: [
        {
          question: "What programs does SMI Institute offer?",
          answer: "We offer 8 TESDA-accredited programs: Bartending NC II, Barista Training NC II, Housekeeping NC II, Food and Beverage Services NC II, Bread and Pastry Production NC II, Events Management NC III, Chef's Catering Services NC II, and Cookery NC II."
        },
        {
          question: "How long do the programs take to complete?",
          answer: "Program durations vary from 60 to 180 hours depending on the course. For example, Barista Training is 60 hours while Events Management is 180 hours. Each program includes both theoretical and practical training components."
        },
        {
          question: "Will I receive a certificate upon completion?",
          answer: "Yes, upon successful completion of your program, you will receive a TESDA-recognized Certificate of Completion (COC) or National Certificate (NC), which is nationally recognized and accepted by employers."
        },
        {
          question: "Do you provide hands-on training?",
          answer: "Absolutely! All our programs emphasize practical, hands-on training using industry-standard equipment and facilities. Students gain real-world experience through laboratory sessions, workshops, and practical assessments."
        },
        {
          question: "Are the instructors qualified?",
          answer: "Yes, all our instructors are industry professionals with extensive experience in their respective fields. They hold relevant certifications and undergo continuous training to ensure they provide the best education to our students."
        }
      ]
    },
    {
      category: "TESDA Scholarships & Financial Aid",
      questions: [
        {
          question: "What scholarship programs are available?",
          answer: "We offer various TESDA scholarship programs including Training for Work Scholarship Program (TWSP), Private Enterprise Partnership, and Special Training for Employment Program (STEP). Eligibility varies by program."
        },
        {
          question: "Who qualifies for TESDA scholarships?",
          answer: "Qualifications include 4Ps beneficiaries, PWDs, senior citizens, solo parents, OFW dependents, displaced workers, rebel returnees, students, unemployed graduates, and currently employed individuals seeking skills enhancement."
        },
        {
          question: "How do I apply for a TESDA scholarship?",
          answer: "During the application process, you can indicate your TESDA voucher eligibility. Our admissions team will guide you through the scholarship application process and required documentation."
        },
        {
          question: "Can I pay for training myself if I don't qualify for scholarships?",
          answer: "Yes, we welcome self-funded students. We offer competitive tuition rates and flexible payment arrangements to make quality technical education accessible to everyone."
        },
        {
          question: "Are there payment plans available?",
          answer: "Yes, we offer flexible payment arrangements for self-funded students. You can discuss payment options with our finance office to find a plan that works for your budget."
        }
      ]
    },
    {
      category: "Student Life & Campus",
      questions: [
        {
          question: "What support services does SMI Institute provide?",
          answer: "We provide academic advising, career counseling, job placement assistance, and student support services. Our faculty and staff are committed to helping students succeed throughout their educational journey."
        },
        {
          question: "Does SMI Institute assist with job placement?",
          answer: "Yes, we have partnerships with various hospitality and culinary establishments. We provide career guidance, resume assistance, and connect graduates with potential employers in the industry."
        },
        {
          question: "What are the class schedules like?",
          answer: "We offer flexible scheduling options: Morning classes (8:00 AM - 12:00 PM), Afternoon classes (1:00 PM - 5:00 PM), and Weekend classes on Saturdays. Specific schedules depend on the program and availability."
        },
        {
          question: "Can I transfer to another program after enrolling?",
          answer: "Program transfers may be possible depending on availability and timing. Contact our academic affairs office to discuss transfer options and any requirements or fees that may apply."
        },
        {
          question: "What facilities does SMI Institute have?",
          answer: "Our campus features modern training facilities including fully-equipped kitchens, bar training areas, housekeeping laboratories, and event management spaces that simulate real industry environments."
        },
        {
          question: "Is there a dress code for students?",
          answer: "Yes, students are required to wear appropriate attire for their training programs. This includes uniforms for kitchen training, professional attire for service training, and safety equipment when required."
        }
      ]
    },
    {
      category: "Career & Employment",
      questions: [
        {
          question: "What career opportunities are available after graduation?",
          answer: "Our graduates find employment in hotels, restaurants, cruise ships, catering companies, event planning firms, bakeries, and many start their own businesses. Career paths include roles from entry-level positions to supervisory and management roles."
        },
        {
          question: "Do employers recognize SMI Institute certificates?",
          answer: "Yes, our TESDA-accredited certificates are nationally recognized and highly valued by employers in the hospitality and culinary industries both locally and internationally."
        },
        {
          question: "Does SMI Institute help with overseas employment?",
          answer: "While we focus on domestic training, our TESDA certificates are internationally recognized. We provide guidance on additional requirements that may be needed for overseas employment opportunities."
        },
        {
          question: "Can I start my own business after completing a program?",
          answer: "Absolutely! Many of our graduates successfully start their own businesses. Our programs include entrepreneurial components, and we provide guidance on business planning and startup considerations."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-tracked-primary text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl mb-6">Find answers to common questions about SMI Institute</p>
          <p className="text-lg opacity-90 max-w-3xl mx-auto">
            Everything you need to know about our programs, admissions, scholarships, and student services
          </p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-tracked-secondary">
                {category.category}
              </h2>
              
              <div className="space-y-4">
                {category.questions.map((faq, questionIndex) => {
                  const globalIndex = categoryIndex * 100 + questionIndex;
                  return (
                    <div key={questionIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleQuestion(globalIndex)}
                        className="w-full text-left p-6 bg-white hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:bg-gray-50"
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold text-gray-900 pr-4">
                            {faq.question}
                          </h3>
                          <div className="flex-shrink-0">
                            <svg
                              className={`w-6 h-6 text-tracked-primary transform transition-transform duration-200 ${
                                openQuestion === globalIndex ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </button>
                      
                      {openQuestion === globalIndex && (
                        <div className="px-6 pb-6">
                          <div className="pt-4 border-t border-gray-100">
                            <p className="text-gray-700 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Still Have Questions?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Can't find what you're looking for? Our admissions team is here to help!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="bg-tracked-primary text-white rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Call Us</h3>
              <p className="text-sm text-gray-600">Visit our campus for<br/>direct assistance</p>
            </div>
            
            <div className="text-center">
              <div className="bg-tracked-secondary text-white rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Email Us</h3>
              <p className="text-sm text-gray-600">Send us your questions<br/>anytime</p>
            </div>
            
            <div className="text-center">
              <div className="bg-tracked-primary text-white rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Visit Us</h3>
              <p className="text-sm text-gray-600">Come to our campus<br/>for in-person help</p>
            </div>
          </div>
          
          <div className="space-x-4">
            <a 
              href="/application" 
              className="inline-block bg-tracked-primary hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition duration-200"
            >
              Apply Now
            </a>
            <a 
              href="/about" 
              className="inline-block bg-tracked-secondary hover:bg-yellow-600 text-white px-8 py-3 rounded-full font-bold transition duration-200"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default FAQ;
