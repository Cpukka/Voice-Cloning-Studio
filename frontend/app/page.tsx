'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  Mic, 
  Volume2, 
  Upload, 
  Download, 
  Shield, 
  Zap, 
  Star,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Play
} from 'lucide-react'

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      icon: Mic,
      title: 'Voice Cloning',
      description: 'Clone any voice with just 3-30 seconds of audio. Our AI captures unique vocal characteristics with stunning accuracy.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Volume2,
      title: 'Text-to-Speech',
      description: 'Convert any text to natural sounding speech using your cloned voices. Perfect for content creation and localization.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Upload,
      title: 'Easy Upload',
      description: 'Simple drag-and-drop interface for uploading voice samples. Support for WAV, MP3, and other popular formats.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Download,
      title: 'Instant Download',
      description: 'Generate and download high-quality audio files instantly. Share your creations across any platform.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Enterprise-grade security with encrypted storage and private voice models. You control your data.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Powered by optimized AI models for rapid voice cloning and speech generation. Get results in seconds.',
      color: 'from-yellow-500 to-orange-500'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Content Creator',
      content: 'This platform revolutionized my content creation workflow. The voice quality is incredibly natural!',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Game Developer',
      content: 'Best voice cloning tool I\'ve used. Perfect for game character voices and dialogue generation.',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Audiobook Narrator',
      content: 'The accuracy is mind-blowing. Saves me hours of recording time while maintaining quality.',
      avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
      rating: 5
    }
  ]

  return (
    <>
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-dark-900/95 backdrop-blur-md border-b border-dark-800' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="gradient-primary p-2 rounded-xl">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">VoiceStudio</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-dark-300 hover:text-white transition-colors">Features</Link>
              <Link href="#how-it-works" className="text-dark-300 hover:text-white transition-colors">How it Works</Link>
              <Link href="#testimonials" className="text-dark-300 hover:text-white transition-colors">Testimonials</Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-dark-300 hover:text-white transition-colors">
                Login
              </Link>
              <Link
                href="/register"
                className="gradient-primary text-white px-5 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-dark-950 to-pink-900/20" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
            <span className="text-purple-400 text-sm font-semibold">✨ AI-Powered Voice Technology</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Clone Voices with
            <span className="gradient-primary bg-clip-text text-transparent"> Stunning Accuracy</span>
          </h1>
          
          <p className="text-xl text-dark-300 mb-8 max-w-2xl mx-auto">
            Transform text into natural speech using advanced AI voice cloning. 
            Perfect for content creators, developers, and businesses.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="gradient-primary text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity inline-flex items-center justify-center group"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#how-it-works"
              className="bg-dark-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-dark-700 transition-colors inline-flex items-center justify-center"
            >
              Watch Demo
              <Play className="ml-2 w-5 h-5" />
            </Link>
          </div>
          
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-dark-300">No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-dark-300">14-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-dark-300">Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-dark-900/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Powerful Features for
              <span className="gradient-primary bg-clip-text text-transparent"> Voice Creation</span>
            </h2>
            <p className="text-xl text-dark-300 max-w-2xl mx-auto">
              Everything you need to create professional voice content with AI
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="group glass-effect rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} w-14 h-14 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-dark-300">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              How It
              <span className="gradient-primary bg-clip-text text-transparent"> Works</span>
            </h2>
            <p className="text-xl text-dark-300">Three simple steps to create amazing voice content</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Upload Voice Sample',
                description: 'Record or upload a clear audio sample (3-30 seconds) of the voice you want to clone',
                icon: Upload
              },
              {
                step: '02',
                title: 'AI Processing',
                description: 'Our advanced AI analyzes and creates a digital voice model from your sample',
                icon: Zap
              },
              {
                step: '03',
                title: 'Generate Speech',
                description: 'Type any text and watch as your cloned voice brings it to life naturally',
                icon: Volume2
              }
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="relative">
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ChevronRight className="w-8 h-8 text-dark-600" />
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-6xl font-bold gradient-primary bg-clip-text text-transparent mb-4">
                      {item.step}
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl inline-block mb-4">
                      <Icon className="w-12 h-12 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-dark-300">{item.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-dark-900/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Loved by
              <span className="gradient-primary bg-clip-text text-transparent"> Creators Worldwide</span>
            </h2>
            <p className="text-xl text-dark-300">Join thousands of satisfied users</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="glass-effect rounded-xl p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-dark-400">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-dark-300">{testimonial.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Voice Content?
          </h2>
          <p className="text-xl text-dark-300 mb-8 max-w-2xl mx-auto">
            Join thousands of creators using VoiceStudio to bring their ideas to life
          </p>
          <Link
            href="/register"
            className="gradient-primary text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity inline-flex items-center justify-center group"
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-900 border-t border-dark-800 pt-16 pb-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="gradient-primary p-2 rounded-xl">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">VoiceStudio</span>
              </div>
              <p className="text-dark-400 mb-4">
                Transform text into natural speech with advanced AI voice cloning technology.
              </p>
              <div className="flex space-x-4">
                
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-dark-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="text-dark-400 hover:text-white transition-colors">API</Link></li>
                <li><Link href="#" className="text-dark-400 hover:text-white transition-colors">Enterprise</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-dark-400 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="text-dark-400 hover:text-white transition-colors">Tutorials</Link></li>
                <li><Link href="#" className="text-dark-400 hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-dark-400 hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="text-dark-400 hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="#" className="text-dark-400 hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-dark-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-dark-400 text-sm">
              © 2024 VoiceStudio. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-dark-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-dark-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}