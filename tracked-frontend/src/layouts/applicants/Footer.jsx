import React from 'react'
import { MdVerified, MdLocationOn, MdPhone, MdEmail } from 'react-icons/md'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-6">
                <img 
                  src="/smi-logo.jpg" 
                  alt="SMI Logo" 
                  className="h-12 w-auto mr-4 rounded-lg"
                />
                <div>
                  <h3 className="text-2xl font-bold">SMI Training Institute</h3>
                  <p className="text-blue-400 font-medium">TESDA Accredited Training Center</p>
                </div>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed max-w-lg mb-6">
                Transforming careers through excellence in hospitality and culinary education. 
                Join our community of successful professionals making their mark in the industry.
              </p>
              <div className="flex items-center space-x-2 text-yellow-400">
                <MdVerified className="h-5 w-5" />
                <span className="font-semibold">TESDA Certified • ISO Compliant</span>
              </div>
            </div>
            
            {/* Training Programs */}
            <div>
              <h4 className="text-xl font-bold mb-6 text-yellow-400">Training Programs</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="hover:text-white transition-colors cursor-pointer">Cookery NC II</li>
                <li className="hover:text-white transition-colors cursor-pointer">Bartending</li>
                <li className="hover:text-white transition-colors cursor-pointer">Barista Training</li>
                <li className="hover:text-white transition-colors cursor-pointer">Housekeeping NC II</li>
                <li className="hover:text-white transition-colors cursor-pointer">Food & Beverage</li>
                <li className="hover:text-white transition-colors cursor-pointer">Events Management</li>
              </ul>
            </div>
            
            {/* Contact Information */}
            <div>
              <h4 className="text-xl font-bold mb-6 text-yellow-400">Get in Touch</h4>
              <div className="space-y-4 text-gray-300">
                <div className="flex items-start space-x-3">
                  <MdLocationOn className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <p>123 Training Street</p>
                    <p>Quezon City, Metro Manila 1100</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MdPhone className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <p>(02) 8123-4567</p>
                </div>
                <div className="flex items-center space-x-3">
                  <MdEmail className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <p>admissions@smi.edu.ph</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Footer */}
          <div className="border-t border-gray-800 py-8">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <div className="text-gray-400 text-center lg:text-left">
                <p className="text-lg">© 2025 SMI Training Institute. All rights reserved.</p>
                <p className="text-sm mt-1">Regulated by TESDA • Member of Philippine Hotel & Restaurant Association</p>
              </div>
              <div className="flex flex-wrap justify-center lg:justify-end space-x-8 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Student Portal</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Career Services</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
  )
}
