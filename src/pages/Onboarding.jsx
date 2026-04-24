import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, TrendingUp, PiggyBank, BarChart3, Sparkles } from 'lucide-react';
import api from '../utils/api';
import './Onboarding.css';

const steps = [
  {
    id: 'welcome',
    icon: <Sparkles size={48} />,
    title: 'Finance, without\nthe stress.',
    subtitle: 'FinPulse helps you understand your money — clearly, simply, and without judgment.',
    cta: 'Get Started',
  },
  {
    id: 'focus',
    title: 'What matters most\nto you right now?',
    subtitle: 'Pick one — we\'ll shape your experience around it.',
    options: [
      { id: 'track', icon: <BarChart3 size={24} />, label: 'Track my spending', desc: 'Know where every rupee goes' },
      { id: 'save', icon: <PiggyBank size={24} />, label: 'Save for goals', desc: 'Build towards something meaningful' },
      { id: 'grow', icon: <TrendingUp size={24} />, label: 'Build better habits', desc: 'Make smarter money decisions' },
    ],
  },
  {
    id: 'setup',
    title: 'Let\'s set you up.',
    subtitle: 'Quick basics to personalize your experience.',
  },
];

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [focus, setFocus] = useState(null);
  
  // Registration data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    if (!name || !validateEmail(email) || !password) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const { data } = await api.post('/auth/register', { 
        name, 
        email, 
        password, 
        focus,
        employmentType: 'salaried' 
      });
      
      // Keep token in localstorage
      localStorage.setItem('finpulse_token', data.token);
      localStorage.setItem('finpulse_user', JSON.stringify({
        name: data.name,
        email: data.email,
        focus: data.focus,
        employmentType: data.employmentType
      }));
      
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else handleComplete();
  };

  const currentStep = steps[step];
  const canProceed = step === 0 || 
    (step === 1 && focus) || 
    (step === 2 && name.trim() && validateEmail(email) && password.length >= 6 && !isSubmitting);

  return (
    <div className="onboarding">
      {/* Progress dots */}
      <div className="onboarding-progress">
        {steps.map((_, i) => (
          <div key={i} className={`progress-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="onboarding-content"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="welcome-step">
              <div className="welcome-icon-wrapper">
                {currentStep.icon}
              </div>
              <h1 className="onboarding-title">{currentStep.title}</h1>
              <p className="onboarding-subtitle">{currentStep.subtitle}</p>
              <p style={{ marginTop: '24px', color: 'var(--text-secondary)' }}>
                Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Log in here</Link>
              </p>
            </div>
          )}

          {/* Step 1: Focus Picker */}
          {step === 1 && (
            <div className="focus-step">
              <h1 className="onboarding-title">{currentStep.title}</h1>
              <p className="onboarding-subtitle">{currentStep.subtitle}</p>
              <div className="focus-options">
                {currentStep.options.map(opt => (
                  <button
                    key={opt.id}
                    className={`focus-option ${focus === opt.id ? 'selected' : ''}`}
                    onClick={() => setFocus(opt.id)}
                    id={`focus-${opt.id}`}
                  >
                    <div className="focus-option-icon">{opt.icon}</div>
                    <div className="focus-option-text">
                      <span className="focus-option-label">{opt.label}</span>
                      <span className="focus-option-desc">{opt.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Setup */}
          {step === 2 && (
            <div className="setup-step">
              <h1 className="onboarding-title">{currentStep.title}</h1>
              <p className="onboarding-subtitle">{currentStep.subtitle}</p>
              
              {error && <div className="error-message" style={{ color: 'var(--color-expense)', marginBottom: '16px' }}>{error}</div>}

              <div className="setup-fields" style={{ textAlign: 'left' }}>
                <div className="input-group" style={{ marginBottom: '12px' }}>
                  <label className="input-label">What should we call you?</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="e.g. Akshay"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                    id="onboarding-name"
                  />
                </div>
                
                <div className="input-group" style={{ marginBottom: '12px' }}>
                  <label className="input-label">Email</label>
                  <input
                    className="input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                  {email && !validateEmail(email) && <span style={{ fontSize: '11px', color: 'var(--color-expense)' }}>Invalid email format</span>}
                </div>

                <div className="input-group">
                  <label className="input-label">Password</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="Min 6 chars"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom CTA */}
      <div className="onboarding-footer">
        <button
          className={`btn btn-primary btn-full btn-lg ${!canProceed ? 'btn-disabled' : ''}`}
          onClick={nextStep}
          disabled={!canProceed}
          id="onboarding-next"
        >
          {isSubmitting ? 'Creating...' : step === 0 ? 'Get Started' : step === steps.length - 1 ? 'Let\'s Go' : 'Continue'}
          {!isSubmitting && <ArrowRight size={20} />}
        </button>
      </div>
    </div>
  );
}

