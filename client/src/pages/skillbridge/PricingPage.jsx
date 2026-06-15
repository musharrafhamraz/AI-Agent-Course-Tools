import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      name: 'Individual',
      price: '$29',
      period: '/mo',
      features: ['Personal roadmap', 'Unlimited AI tools access', 'Certification', 'Email support'],
      cta: 'Start Free Trial',
      primary: false
    },
    {
      name: 'Team',
      price: '$99',
      period: '/mo',
      popular: true,
      features: ['Everything in Individual', '10 Team Members', 'Progress Analytics', 'Priority support'],
      cta: 'Get Started',
      primary: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      features: ['Unlimited Departments', 'Custom Integrations', 'Dedicated Mentor', '24/7 support'],
      cta: 'Contact Sales',
      primary: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-8 md:px-16 py-4">
          <span className="text-2xl font-bold text-primary">SkillBridge</span>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-700">Log In</Link>
            <Link to="/signup" className="bg-teal-500 text-white px-6 py-2 rounded-lg">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 md:px-16 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-primary mb-4">Scalable Plans</h1>
          <p className="text-lg text-gray-600">Choose the perfect plan for your learning journey</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-end">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white p-8 rounded-xl ${
                plan.primary
                  ? 'border-2 border-teal-500 shadow-xl scale-105 relative'
                  : 'border border-gray-200 shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-teal-500 text-white px-6 py-1 rounded-full text-sm font-bold">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-gray-600">{plan.period}</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-teal-500" />
                    <span className={idx === 0 ? 'font-bold' : ''}>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-lg font-bold transition-all ${
                  plan.primary
                    ? 'bg-teal-500 text-white hover:bg-teal-600 shadow-lg'
                    : 'border-2 border-primary text-primary hover:bg-primary/5'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-16 text-center">
          <p className="text-sm opacity-60">© 2024 SkillBridge AI Training. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
