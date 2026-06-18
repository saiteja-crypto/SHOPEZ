import { ShoppingBag, Users, Award, Truck } from "lucide-react";

const About = () => (
  <div className="static-page container">
    <div className="page-header">
      <h1 className="page-title">About <span>Us</span></h1>
      <p className="page-subtitle">The story behind ShopEZ</p>
    </div>

    <div className="about-hero">
      <div className="about-hero-content">
        <h2>We make shopping <span>effortless</span></h2>
        <p>ShopEZ was founded with one mission — to make online shopping simple, fast, and enjoyable for everyone. We believe great products should be accessible to all, without the complexity.</p>
        <p>From electronics to fashion, books to beauty — we curate the best products across every category so you never have to look elsewhere.</p>
      </div>
      <div className="about-stats">
        <div className="about-stat"><ShoppingBag size={28}/><strong>50K+</strong><span>Products</span></div>
        <div className="about-stat"><Users size={28}/><strong>10K+</strong><span>Customers</span></div>
        <div className="about-stat"><Award size={28}/><strong>4.8★</strong><span>Rating</span></div>
        <div className="about-stat"><Truck size={28}/><strong>24hr</strong><span>Shipping</span></div>
      </div>
    </div>

    <div className="about-values">
      <h2 className="section-title">Our <span>Values</span></h2>
      <div className="values-grid">
        {[
          { emoji: "🛡️", title: "Trust & Safety", desc: "Every transaction is secured with industry-standard encryption. Your data is never shared or sold." },
          { emoji: "⚡", title: "Speed & Convenience", desc: "From browsing to delivery, we've optimized every step of your shopping journey." },
          { emoji: "💎", title: "Quality First", desc: "We carefully curate every product on our platform to ensure it meets our quality standards." },
          { emoji: "🌱", title: "Sustainability", desc: "We partner with eco-conscious brands and use minimal, recyclable packaging wherever possible." },
        ].map((v, i) => (
          <div key={i} className="value-card">
            <span className="value-emoji">{v.emoji}</span>
            <h3>{v.title}</h3>
            <p>{v.desc}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="about-team">
      <h2 className="section-title">Built with <span>❤️</span></h2>
      <p style={{color:"var(--text-2)",fontSize:15,maxWidth:600,margin:"0 auto",textAlign:"center",lineHeight:1.8}}>
        ShopEZ is built using the MERN stack — MongoDB, Express.js, React, and Node.js.
        Designed and developed by <strong style={{color:"var(--text)"}}>SAI TEJA</strong> as a full-stack project
        demonstrating real-world e-commerce capabilities.
      </p>
    </div>
  </div>
);

export default About;