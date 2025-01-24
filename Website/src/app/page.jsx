'use client';
import React, { useState, useEffect } from 'react';

import { useHandleStreamResponse } from '../utilities/runtime-helpers';

function MainComponent() {
  // form submission++++++++++++++++++++++++++
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost:8080/form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Something went wrong');
      }

      const result = await response.json();
      alert('Message sent successfully!');
      // Optionally reset form or handle the response
      setFormData({
        name: '',
        email: '',
        message: '',
      });
    } catch (error) {
      setErrorMessage('Failed to send message, please try again.');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState('home');
  const [scrapedProperties, setScrapedProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState([]);

  // Fetch properties data from backend API
  useEffect(() => {
    // Fetch data from the backend
    fetch('http://localhost:8080/properties') // Update the URL to match your backend endpoint
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        setProperties(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching properties:', error);
        setLoading(false);
      });
  }, []);
  const handleStreamResponse = useHandleStreamResponse({
    onChunk: setStreamingMessage,
    onFinish: (message) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: message }]);
      setStreamingMessage('');
      setIsLoading(false);
    },
  });
  const handleChatSubmit = async () => {
    if (!userInput.trim() || isLoading) return;

    const newMessage = { role: 'user', content: userInput };
    setMessages((prev) => [...prev, newMessage]);
    setUserInput('');
    setIsLoading(true);

    const systemMessage = {
      role: 'system',
      content:
        'You are a helpful real estate assistant for Real Estate Pakistan. You can help with property information, pricing, and general real estate queries. Keep responses concise and professional. Use Pakistani Rupees (Rs.) for prices.',
    };

    const response = await fetch('/integrations/chat-gpt/conversationgpt4', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [systemMessage, ...messages, newMessage],
        stream: true,
      }),
    });
    handleStreamResponse(response);
  };

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const response = await fetch('/integrations/web-scraping/post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: 'https://www.zameen.com/Homes/Karachi-2-1.html',
            getText: true,
          }),
        });
        const data = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');
        const propertyElements = doc.querySelectorAll('.property-card');

        const newProperties = Array.from(propertyElements)
          .slice(0, 6)
          .map((el, index) => ({
            id: index + 4,
            title:
              el.querySelector('.property-title')?.textContent?.trim() ||
              'Property Title',
            location:
              el.querySelector('.property-location')?.textContent?.trim() ||
              'Location',
            price:
              el.querySelector('.property-price')?.textContent?.trim() ||
              'Price on Request',
            area:
              el.querySelector('.property-area')?.textContent?.trim() ||
              'Area not specified',
            type:
              el.querySelector('.property-type')?.textContent?.trim() ||
              'Residential',
            image: el.querySelector('img')?.src || '/default-property.jpg',
          }));

        setScrapedProperties(newProperties);
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
      setLoading(false);
    };

    fetchProperties();
  }, []);

  // const properties = [
  //   ...scrapedProperties,
  //   {
  //     id: 1,
  //     title: 'Luxury Villa',
  //     location: 'DHA Phase 6, Karachi',
  //     price: 'Rs. 2.5 Crore',
  //     area: '500 Square Yards',
  //     type: 'Residential',
  //     image: '/images/1234.jpg',
  //   },
  //   {
  //     id: 2,
  //     title: 'Commercial Plaza',
  //     location: 'Gulberg, Lahore',
  //     price: 'Rs. 15 Crore',
  //     area: '1000 Square Yards',
  //     type: 'Commercial',
  //     image: '/images/123.jpg',
  //   },
  //   {
  //     id: 3,
  //     title: 'Family Home',
  //     location: 'Bahria Town, Islamabad',
  //     price: 'Rs. 1.8 Crore',
  //     area: '300 Square Yards',
  //     type: 'Residential',
  //     image: '/images/12345.jpg',
  //   },
  // ];

  return (
    <div className='min-h-screen bg-gray-100'>
      <header className='bg-blue-600 text-white p-4'>
        <div className='container mx-auto flex justify-between items-center'>
          <div className='flex items-center'>
            <i className='fas fa-building text-3xl mr-2'></i>
            <h1 className='text-2xl font-crimson-text'>Real Estate Pakistan</h1>
          </div>
          <nav className='hidden md:flex items-center space-x-6'>
            <button
              onClick={() => setCurrentPage('home')}
              className={`hover:text-green-400 ${
                currentPage === 'home' ? 'text-green-400' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentPage('about')}
              className={`hover:text-green-400 ${
                currentPage === 'about' ? 'text-green-400' : ''
              }`}
            >
              About Us
            </button>
            <button
              onClick={() => setCurrentPage('contact')}
              className={`hover:text-green-400 ${
                currentPage === 'contact' ? 'text-green-400' : ''
              }`}
            >
              Contact Us
            </button>
            <button className='hover:text-green-400'>Properties</button>
          </nav>
          <button onClick={() => setCurrentPage('contact')} className='bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors'>
            Contact Us
          </button>
        </div>
      </header>

      {currentPage === 'home' && (
        <>
          <section className='bg-blue-600 text-white py-16'>
            <div className='container mx-auto px-4 flex flex-col md:flex-row items-center'>
              <div className='md:w-1/2 mb-8 md:mb-0'>
                <h1 className='text-4xl md:text-5xl font-bold mb-4'>
                  Find Your Dream Property in Pakistan
                </h1>
                <p className='text-lg mb-6'>
                  Discover the perfect property that matches your lifestyle and
                  budget.
                </p>
                <button className='bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors'>
                  Explore Properties
                </button>
              </div>
              <div className='md:w-1/2'>
                <img
                  src='/images/modern.jpg'
                  alt='Modern luxury home exterior'
                  className='rounded-lg shadow-xl'
                />
              </div>
            </div>
          </section>
          <section className='py-16'>
            <div className='container mx-auto px-4'>
              <h2 className='text-3xl font-bold text-center mb-12'>
                Property Categories
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                <div className='bg-white p-6 rounded-lg shadow-lg text-center'>
                  <i className='fas fa-home text-4xl text-blue-600 mb-4'></i>
                  <h3 className='text-xl font-bold mb-2'>Residential</h3>
                  <p>Find your perfect home</p>
                </div>
                <div className='bg-white p-6 rounded-lg shadow-lg text-center'>
                  <i className='fas fa-building text-4xl text-blue-600 mb-4'></i>
                  <h3 className='text-xl font-bold mb-2'>Commercial</h3>
                  <p>Premium business spaces</p>
                </div>
                <div className='bg-white p-6 rounded-lg shadow-lg text-center'>
                  <i className='fas fa-industry text-4xl text-blue-600 mb-4'></i>
                  <h3 className='text-xl font-bold mb-2'>Industrial</h3>
                  <p>Industrial properties</p>
                </div>
              </div>
            </div>
          </section>
          <>
            <div className='container mx-auto px-4 py-8'>
              <div className='mb-8'>
                <div className='relative'>
                  <input
                    type='text'
                    placeholder='Search by location, property type...'
                    className='w-full p-4 rounded-lg shadow-sm border'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <i className='fas fa-search absolute right-4 top-4 text-gray-500'></i>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {loading ? (
                  <div className='col-span-3 text-center py-8'>
                    <i className='fas fa-spinner fa-spin text-4xl text-blue-600'></i>
                    <p className='mt-2'>Loading properties...</p>
                  </div>
                ) : (
                  properties.map((property) => (
                    <div
                      key={property.id}
                      className='bg-white rounded-lg shadow-lg overflow-hidden'
                    >
                      <img
                        src={property.image}
                        alt={`View of ${property.title}`}
                        className='w-full h-[200px] object-cover'
                      />
                      <div className='p-4'>
                        <h3 className='text-xl font-semibold mb-2'>
                          {property.title}
                        </h3>
                        <div className='flex items-center mb-2'>
                          <i className='fas fa-map-marker-alt text-red-500 mr-2'></i>
                          <span>{property.location}</span>
                        </div>
                        <div className='flex items-center mb-2'>
                          <i className='fas fa-ruler-combined text-blue-500 mr-2'></i>
                          <span>{property.area}</span>
                        </div>
                        <div className='flex items-center mb-2'>
                          <i className='fas fa-home text-green-500 mr-2'></i>
                          <span>{property.type}</span>
                        </div>
                        <div className='flex items-center justify-between mt-4'>
                          <span className='text-xl font-bold text-blue-600'>
                            {property.price}
                          </span>
                          <button className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
          <section className='py-16 bg-gray-50'>
            <div className='container mx-auto px-4'>
              <div className='flex flex-col md:flex-row items-center'>
                <div className='md:w-1/2 mb-8 md:mb-0'>
                  <img
                    src='/images/rc.png'
                    alt='Luxury home interior'
                    className='rounded-lg shadow-xl'
                  />
                </div>
                <div className='md:w-1/2 md:pl-12'>
                  <h2 className='text-3xl font-bold mb-6'>Why Choose Us?</h2>
                  <div className='space-y-4'>
                    <div className='flex items-center'>
                      <i className='fas fa-check-circle text-green-500 text-xl mr-3'></i>
                      <p>Premium Properties in Prime Locations</p>
                    </div>
                    <div className='flex items-center'>
                      <i className='fas fa-check-circle text-green-500 text-xl mr-3'></i>
                      <p>Expert Real Estate Consultants</p>
                    </div>
                    <div className='flex items-center'>
                      <i className='fas fa-check-circle text-green-500 text-xl mr-3'></i>
                      <p>Transparent Dealings</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className='py-16'>
            <div className='container mx-auto px-4'>
              <h2 className='text-3xl font-bold text-center mb-12'>
                What Our Clients Say
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                <div className='bg-white p-6 rounded-lg shadow-lg'>
                  <div className='flex items-center mb-4'>
                    <img
                      src='/images/123456.jpg'
                      alt='Client testimonial'
                      className='w-12 h-12 rounded-full mr-4'
                    />
                    <div>
                      <h4 className='font-bold'>Ahmed Khan</h4>
                      <p className='text-gray-600'>Karachi</p>
                    </div>
                  </div>
                  <p className='text-gray-700'>
                    "Excellent service and professional team. Found my dream
                    home!"
                  </p>
                </div>
                <div className='bg-white p-6 rounded-lg shadow-lg'>
                  <div className='flex items-center mb-4'>
                    <img
                      src='/images/1234567.jpeg'
                      alt='Client testimonial'
                      className='w-12 h-12 rounded-full mr-4'
                    />
                    <div>
                      <h4 className='font-bold'>Shehryar Ali</h4>
                      <p className='text-gray-600'>Lahore</p>
                    </div>
                  </div>
                  <p className='text-gray-700'>
                    "Very transparent and helpful throughout the process."
                  </p>
                </div>
                <div className='bg-white p-6 rounded-lg shadow-lg'>
                  <div className='flex items-center mb-4'>
                    <img
                      src='/images/12345678.jpeg'
                      alt='Client testimonial'
                      className='w-12 h-12 rounded-full mr-4'
                    />
                    <div>
                      <h4 className='font-bold'>Usman Shah</h4>
                      <p className='text-gray-600'>Islamabad</p>
                    </div>
                  </div>
                  <p className='text-gray-700'>
                    "Best real estate experience I've had. Highly recommended!"
                  </p>
                </div>
              </div>
            </div>
          </section>
          <section className='py-16 bg-[#1a365d] text-white'>
            <div className='container mx-auto px-4'>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-8 text-center'>
                <div>
                  <h3 className='text-4xl font-bold mb-2'>1000+</h3>
                  <p>Properties Sold</p>
                </div>
                <div>
                  <h3 className='text-4xl font-bold mb-2'>500+</h3>
                  <p>Happy Clients</p>
                </div>
                <div>
                  <h3 className='text-4xl font-bold mb-2'>10+</h3>
                  <p>Years Experience</p>
                </div>
                <div>
                  <h3 className='text-4xl font-bold mb-2'>50+</h3>
                  <p>Expert Agents</p>
                </div>
              </div>
            </div>
          </section>
          <section className='py-16 bg-gray-50'>
            <div className='container mx-auto px-4 text-center'>
              <h2 className='text-3xl font-bold mb-8'>
                Ready to Find Your Dream Property?
              </h2>
              <p className='text-xl mb-8'>
                Contact us today and let our experts guide you through the
                process.
              </p>
              <button className='bg-[#4ade80] text-white px-8 py-3 rounded-lg hover:bg-[#22c55e] transition-colors text-lg'>
                Get Started Now
              </button>
            </div>
          </section>
          <section className='py-16 bg-gray-50'>
            <div className='container mx-auto px-4'>
              <h2 className='text-3xl font-bold text-center mb-12 text-blue-600'>
                Meet Our Team
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
                <div className='bg-white p-6 rounded-lg shadow-lg text-center'>
                  <img
                    src='/images/ceo.jpeg'
                    alt='CEO'
                    className='w-32 h-32 rounded-full mx-auto mb-4 object-cover'
                  />
                  <h3 className='text-xl font-bold text-blue-600'>
                    Zain Ahmed
                  </h3>
                  <p className='text-green-500 mb-2'>CEO</p>
                  <p className='text-gray-600'>15+ years in real estate</p>
                </div>
                <div className='bg-white p-6 rounded-lg shadow-lg text-center'>
                  <img
                    src='/images/sales.jpeg'
                    alt='Sales Director'
                    className='w-32 h-32 rounded-full mx-auto mb-4 object-cover'
                  />
                  <h3 className='text-xl font-bold text-blue-600'>
                    Fatima Khan
                  </h3>
                  <p className='text-green-500 mb-2'>Sales Director</p>
                  <p className='text-gray-600'>10+ years experience</p>
                </div>
                <div className='bg-white p-6 rounded-lg shadow-lg text-center'>
                  <img
                    src='/images/marketing.jpeg'
                    alt='Marketing Head'
                    className='w-32 h-32 rounded-full mx-auto mb-4 object-cover'
                  />
                  <h3 className='text-xl font-bold text-blue-600'>
                    Ali Hassan
                  </h3>
                  <p className='text-green-500 mb-2'>Marketing Head</p>
                  <p className='text-gray-600'>8+ years experience</p>
                </div>
                <div className='bg-white p-6 rounded-lg shadow-lg text-center'>
                  <img
                    src='/images/consultant.jpeg'
                    alt='Property Consultant'
                    className='w-32 h-32 rounded-full mx-auto mb-4 object-cover'
                  />
                  <h3 className='text-xl font-bold text-blue-600'>
                    Sara Malik
                  </h3>
                  <p className='text-green-500 mb-2'>Property Consultant</p>
                  <p className='text-gray-600'>5+ years experience</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {currentPage === 'about' && (
        <div className='container mx-auto px-4 py-8'>
          <h2 className='text-3xl font-bold mb-6'>About Us</h2>
          <div className='bg-white p-6 rounded-lg shadow'>
            <p className='mb-4'>
              Welcome to Real Estate Pakistan, your trusted partner in property
              dealings since 2010.
            </p>
            <div className='grid md:grid-cols-3 gap-6 mt-8'>
              <div className='text-center'>
                <i className='fas fa-handshake text-4xl text-[#1a365d] mb-4'></i>
                <h3 className='text-xl font-bold mb-2'>Trusted Service</h3>
                <p>Over 10,000 successful property deals</p>
              </div>
              <div className='text-center'>
                <i className='fas fa-home text-4xl text-[#1a365d] mb-4'></i>
                <h3 className='text-xl font-bold mb-2'>Wide Selection</h3>
                <p>Properties across all major cities</p>
              </div>
              <div className='text-center'>
                <i className='fas fa-users text-4xl text-[#1a365d] mb-4'></i>
                <h3 className='text-xl font-bold mb-2'>Expert Team</h3>
                <p>Professional real estate consultants</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentPage === 'contact' && (
        <div className='container mx-auto px-4 py-8'>
          <h2 className='text-3xl font-bold mb-6'>Contact Us</h2>
          <div className='grid md:grid-cols-2 gap-8'>
            <div className='bg-white p-6 rounded-lg shadow'>
              {/* <form className='space-y-4'>
                <div>
                  <label className='block mb-2'>Name</label>
                  <input
                    type='text'
                    className='w-full p-2 border rounded'
                    name='name'
                  />
                </div>
                <div>
                  <label className='block mb-2'>Email</label>
                  <input
                    type='email'
                    className='w-full p-2 border rounded'
                    name='email'
                  />
                </div>
                <div>
                  <label className='block mb-2'>Message</label>
                  <textarea
                    className='w-full p-2 border rounded h-32'
                    name='message'
                  ></textarea>
                </div>
                <button className='bg-[#1a365d] text-white px-6 py-2 rounded'>
                  Send Message
                </button>
              </form> */}
              <form className='space-y-4' onSubmit={handleSubmit}>
                <div>
                  <label className='block mb-2'>Name</label>
                  <input
                    type='text'
                    className='w-full p-2 border rounded'
                    name='name'
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className='block mb-2'>Email</label>
                  <input
                    type='email'
                    className='w-full p-2 border rounded'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className='block mb-2'>Message</label>
                  <textarea
                    className='w-full p-2 border rounded h-32'
                    name='message'
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                </div>
                {errorMessage && (
                  <div className='text-red-500 text-sm'>{errorMessage}</div>
                )}
                <button
                  type='submit'
                  className='bg-[#1a365d] text-white px-6 py-2 rounded'
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
            <div className='bg-white p-6 rounded-lg shadow'>
              <h3 className='text-xl font-bold mb-4'>Our Office</h3>
              <div className='space-y-3'>
                <p>
                  <i className='fas fa-map-marker-alt mr-2 text-[#1a365d]'></i>{' '}
                  123 Main Street, Islamabad
                </p>
                <p>
                  <i className='fas fa-phone mr-2 text-[#1a365d]'></i> +92 300
                  1234567
                </p>
                <p>
                  <i className='fas fa-envelope mr-2 text-[#1a365d]'></i>{' '}
                  info@realestate.pk
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className='bg-blue-600 text-white py-8 mt-12'>
        <div className='container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div>
            <h3 className='text-xl font-bold mb-4'>Contact Us</h3>
            <p>
              <i className='fas fa-phone mr-2'></i> +92 300 1234567
            </p>
            <p>
              <i className='fas fa-envelope mr-2'></i> info@realestate.pk
            </p>
          </div>
          <div>
            <h3 className='text-xl font-bold mb-4'>Quick Links</h3>
            <ul>
              <li className='mb-2 hover:text-green-400 cursor-pointer'>
                About Us
              </li>
              <li className='mb-2 hover:text-green-400 cursor-pointer'>
                Properties
              </li>
              <li className='mb-2 hover:text-green-400 cursor-pointer'>
                Contact
              </li>
            </ul>
          </div>
          <div>
            <h3 className='text-xl font-bold mb-4'>Follow Us</h3>
            <ul>
              <li className='mb-2 hover:text-green-400 cursor-pointer'>
                Facebook
              </li>
              <li className='mb-2 hover:text-green-400 cursor-pointer'>
                Linkedin
              </li>
              <li className='mb-2 hover:text-green-400 cursor-pointer'>
                Instagram
              </li>
            </ul>
          </div>
        </div>
      </footer>
      <div className='fixed bottom-4 right-4 z-50'>
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className='bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors'
        >
          <i
            className={`fas ${chatOpen ? 'fa-times' : 'fa-comments'} text-xl`}
          ></i>
        </button>

        {chatOpen && (
          <div className='absolute bottom-16 right-0 w-[300px] bg-white rounded-lg shadow-xl'>
            <div className='h-[400px] flex flex-col'>
              <div className='bg-blue-600 text-white p-3 rounded-t-lg flex items-center'>
                <i className='fas fa-robot mr-2'></i>
                <h3 className='font-semibold'>Real Estate Assistant</h3>
              </div>
              <div className='flex-1 overflow-y-auto p-4'>
                {messages.length === 0 && (
                  <div className='text-center text-gray-500 mt-4'>
                    <i className='fas fa-home text-4xl mb-2'></i>
                    <p>Ask me anything about our properties!</p>
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-2 ${
                      msg.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <span
                      className={`inline-block p-2 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200'
                      }`}
                    >
                      {msg.content}
                    </span>
                  </div>
                ))}
                {streamingMessage && (
                  <div className='text-left'>
                    <span className='inline-block p-2 rounded-lg bg-gray-200'>
                      {streamingMessage}
                    </span>
                  </div>
                )}
              </div>
              <div className='p-3 border-t'>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                    placeholder='Ask about properties...'
                    className='flex-1 p-2 border rounded'
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleChatSubmit}
                    className={`text-white px-4 rounded transition-colors ${
                      isLoading
                        ? 'bg-gray-400'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <i className='fas fa-spinner fa-spin'></i>
                    ) : (
                      <i className='fas fa-paper-plane'></i>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainComponent;
