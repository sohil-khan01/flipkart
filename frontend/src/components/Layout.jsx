import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
