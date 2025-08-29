'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold">KingX</span>
            </div>
            <p className="text-gray-300 text-sm">
              Fast, reliable, and secure package delivery service. 
              We connect people and businesses across the globe with our 
              innovative logistics solutions.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/send-package" className="text-gray-300 hover:text-white transition-colors">
                  Send Package
                </Link>
              </li>
              <li>
                <Link href="/tracking" className="text-gray-300 hover:text-white transition-colors">
                  Track Package
                </Link>
              </li>
              <li>
                <Link href="/services/express" className="text-gray-300 hover:text-white transition-colors">
                  Express Delivery
                </Link>
              </li>
              <li>
                <Link href="/services/same-day" className="text-gray-300 hover:text-white transition-colors">
                  Same Day Delivery
                </Link>
              </li>
              <li>
                <Link href="/services/international" className="text-gray-300 hover:text-white transition-colors">
                  International Shipping
                </Link>
              </li>
              <li>
                <Link href="/services/bulk" className="text-gray-300 hover:text-white transition-colors">
                  Bulk Delivery
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-gray-300 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping-guide" className="text-gray-300 hover:text-white transition-colors">
                  Shipping Guide
                </Link>
              </li>
              <li>
                <Link href="/claims" className="text-gray-300 hover:text-white transition-colors">
                  Claims & Returns
                </Link>
              </li>
              <li>
                <Link href="/driver/join" className="text-gray-300 hover:text-white transition-colors">
                  Become a Driver
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Customer Service</p>
                  <p className="text-white font-medium">1-800-KINGX-24</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Email Support</p>
                  <p className="text-white font-medium">support@kingx.com</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-gray-300">Headquarters</p>
                  <p className="text-white font-medium">
                    123 Logistics Ave<br />
                    New York, NY 10001<br />
                    United States
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap justify-center md:justify-start space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-300 hover:text-white transition-colors">
                Cookie Policy
              </Link>
              <Link href="/accessibility" className="text-gray-300 hover:text-white transition-colors">
                Accessibility
              </Link>
            </div>
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} KingX Delivery. All rights reserved.
            </div>
          </div>
        </div>

        {/* Service Hours */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-4">Service Hours</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-300">Customer Service</p>
                <p className="text-white font-medium">24/7 Available</p>
              </div>
              <div>
                <p className="text-gray-300">Pickup Service</p>
                <p className="text-white font-medium">Mon-Sat: 8AM-8PM</p>
              </div>
              <div>
                <p className="text-gray-300">Delivery Service</p>
                <p className="text-white font-medium">Mon-Sun: 6AM-10PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}