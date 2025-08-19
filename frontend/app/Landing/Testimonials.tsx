'use client'
import { useState } from 'react';
import Image from 'next/image';

const TestimonialsSection = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
  
  const testimonials = [
    {
      id: 0,
      text: "Le Cameroun doit utiliser les TIC non pas comme un luxe, mais comme une nécessité pour combler les écarts de compétences et moderniser son système éducatif.",
      name: "Emmanuel Tonyé",
      title: "Professeur Universitaire",
      avatar: "/images/expert1.jpg"
    },
    {
      id: 1,
      text: "La formation numérique est une chance de redistribuer les cartes, surtout dans les pays où les structures physiques sont insuffisantes.",
      name: "Rebecca Enonchong",
      title: "Tech Entrepreneure Camerounaise",
      avatar: "/images/rebecca-enonchong.jpg"
    },
    {
      id: 2,
      text: "Le Cameroun doit utiliser les TIC non pas comme un luxe, mais comme une nécessité pour combler les écarts de compétences et moderniser son système éducatif.",
      name: "Emmanuel Tonyé",
      title: "Professeur Universitaire",
      avatar: "/images/emmanuel-tonye.jpg"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className="py-20 px-4 bg-violet-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-medium text-center mb-16">
          Des experts en parlent !
        </h2>
        
        <div className="relative">
          {/* Navigation arrows */}
          <button 
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-blue-100 rounded-full p-4 transition-all hover:bg-blue-300 cursor-pointer"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-blue-100 rounded-full p-4 transition-all hover:bg-blue-300 cursor-pointer"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Testimonials container */}
          <div className="overflow-hidden mx-16">
            <div 
              className="flex items-center transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 25}%)` }}
            >
              {testimonials.map((testimonial, index) => {
                const isActive = index === currentSlide;
                const isVisible = Math.abs(index - currentSlide) <= 3;
                
                return (
                  <div 
                    key={testimonial.id}
                    className={`flex-none w-1/2 px-6 transition-opacity duration-300 ${
                      isActive ? 'opacity-100 bg-white' : 'opacity-40'
                    } ${!isVisible ? 'hidden' : ''}`}
                  >
                    <div className="p-12 h-full">
                      <p className="text-xl leading-relaxed mb-8 font-normal">
                        "{testimonial.text}"
                      </p>
                      <div className="flex items-center">
                        <img 
                          src={testimonial.avatar} 
                          alt={testimonial.name}
                          className="w-16 h-16 rounded-full mr-6 object-cover"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                            const next = img.nextSibling;
                            if (next && next instanceof HTMLElement) {
                              next.style.display = 'block';
                            }
                          }}
                        />
                        <div 
                          className="w-16 h-16 bg-gray-200 rounded-full mr-6 hidden"
                          style={{display: 'none'}}
                        ></div>
                        <div>
                          <h4 className="text-xl font-semibold mb-1">{testimonial.name}</h4>
                          <p className="text-lg">{testimonial.title}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Indicators */}
          <div className="flex justify-center mt-12 space-x-3 ">
            {testimonials.map((_, index) => (
              <button 
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-4 h-4 rounded-full transition-colors  ${
                  index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;