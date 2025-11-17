import { useState } from 'react';
import Navbar from '../layouts/applicants/Navbar';
import Footer from '../layouts/applicants/Footer';
import { MdLocationOn, MdPhone, MdEmail, MdAccessTime } from 'react-icons/md';
import { contactAPI } from '../services/contactAPI';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await contactAPI.submit(formData);
      
      if (response.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      }
    } catch (err) {
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-tracked-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-gray-100 max-w-3xl mx-auto">
            Get in touch with us for inquiries about our training programs, enrollment, or any questions you may have.
          </p>
        </div>
      </section>

      {/* Contact Form & Information */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            
            {/* Success Message */}
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                <p className="font-medium">Message sent successfully!</p>
                <p className="text-sm">We will get back to you soon.</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                <p className="font-medium">Error sending message</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tracked-primary focus:border-transparent outline-none"
                  placeholder="Your name"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tracked-primary focus:border-transparent outline-none"
                  placeholder="your.email@example.com"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tracked-primary focus:border-transparent outline-none"
                  placeholder="09XX XXX XXXX"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tracked-primary focus:border-transparent outline-none"
                  placeholder="What is this regarding?"
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tracked-primary focus:border-transparent outline-none resize-none"
                  placeholder="Your message..."
                  disabled={loading}
                ></textarea>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-tracked-primary hover:bg-tracked-primary-dark text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>

          {/* Contact Information & Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Details */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <MdLocationOn className="h-5 w-5 text-tracked-primary mt-1 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                    <p className="text-gray-600 text-sm">
                      Wardley Bldg. San Juan St.<br />
                      Cor. Taft Ave. Brgy 36<br />
                      Pasay City, Metro Manila
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MdPhone className="h-5 w-5 text-tracked-primary mt-1 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                    <p className="text-gray-600 text-sm">09177990724</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MdEmail className="h-5 w-5 text-tracked-primary mt-1 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600 text-sm break-words">smiacedmicenter@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MdAccessTime className="h-5 w-5 text-tracked-primary mt-1 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Office Hours</h3>
                    <p className="text-gray-600 text-sm">
                      Monday - Friday<br />
                      8:00 AM - 5:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.4984089823147!2d120.99361731484426!3d14.551392089829815!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c98d89d4c3a1%3A0x4c9c5e0e5e5e5e5e!2sSan%20Juan%20St%2C%20Pasay%2C%20Metro%20Manila!5e0!3m2!1sen!2sph!4v1234567890123"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="SMI Institute Location"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactUs;
