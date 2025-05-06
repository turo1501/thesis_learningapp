import React from 'react';
import Link from 'next/link';
import { Github, Twitter, Linkedin, Instagram, Facebook, Youtube, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-customgreys-darkerGrey border-t border-customgreys-darkerGrey/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">LearningApp</h3>
            <p className="text-sm text-customgreys-dirtyGrey">
              We help individuals advance their careers and achieve their goals with expert-led courses.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-customgreys-dirtyGrey hover:text-primary-400 transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-customgreys-dirtyGrey hover:text-primary-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-customgreys-dirtyGrey hover:text-primary-400 transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-customgreys-dirtyGrey hover:text-primary-400 transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/search" className="text-customgreys-dirtyGrey hover:text-white transition-colors text-sm">
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-customgreys-dirtyGrey hover:text-white transition-colors text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-customgreys-dirtyGrey hover:text-white transition-colors text-sm">
                  For Teachers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-customgreys-dirtyGrey hover:text-white transition-colors text-sm">
                  For Students
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-customgreys-dirtyGrey hover:text-white transition-colors text-sm">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-customgreys-dirtyGrey hover:text-white transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-customgreys-dirtyGrey hover:text-white transition-colors text-sm">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="#" className="text-customgreys-dirtyGrey hover:text-white transition-colors text-sm">
                  Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-customgreys-dirtyGrey hover:text-white transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-customgreys-dirtyGrey hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-customgreys-dirtyGrey hover:text-white transition-colors text-sm">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-customgreys-dirtyGrey hover:text-white transition-colors text-sm">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-customgreys-darkerGrey/50 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-customgreys-dirtyGrey text-sm">
            © {new Date().getFullYear()} LearningApp. All rights reserved.
          </p>
          <p className="text-customgreys-dirtyGrey text-sm mt-2 sm:mt-0">
            Made with <Heart size={14} className="inline text-red-500 mx-1" /> for continuous learning
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;