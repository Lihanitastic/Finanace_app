import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, TrendingUp, PiggyBank, BarChart3, Sparkles } from 'lucide-react';
import { setItem, STORAGE_KEYS } from '../data/storage';
import { mockTransactions } from '../data/mockTransactions';
import { mockGoals } from '../data/mockGoals';
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

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [focus, setFocus] = useState(null);
  const [name, setName] = useState('');

  const handleComplete = () => {
    const userData = {
      name: name || 'Friend',
      focus: focus || 'track',
      joinedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.USER, userData);
    setItem(STORAGE_KEYS.TRANSACTIONS, mockTransactions);
    setItem(STORAGE_KEYS.GOALS, mockGoals);
    setItem(STORAGE_KEYS.ONBOARDED, true);
    navigate('/', { replace: true });
  };

  const nextStep = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else handleComplete();
  };

  const currentStep = steps[step];
  const canProceed = step === 0 || (step === 1 && focus) || (step === 2 && name.trim());

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
              <div className="setup-fields">
                <div className="input-group">
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
          {step === 0 ? 'Get Started' : step === steps.length - 1 ? 'Let\'s Go' : 'Continue'}
          <ArrowRight size={20} />
        </button>
        {step === 2 && (
          <button className="btn btn-ghost btn-full" onClick={handleComplete} id="onboarding-skip">
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
