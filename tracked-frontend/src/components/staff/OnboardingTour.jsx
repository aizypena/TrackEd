import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MdClose, MdArrowForward, MdArrowBack, MdCheck } from 'react-icons/md';

const TOUR_STEPS = [
  {
    target: '[data-tour="dashboard"]',
    title: 'Dashboard',
    description: 'Your central hub for quick access to key metrics, pending tasks, and recent activities.',
    position: 'right'
  },
  {
    target: '[data-tour="enrollments"]',
    title: 'Application & Enrollment',
    description: 'Manage student applications, enrollment records, and required documents.',
    position: 'right'
  },
  {
    target: '[data-tour="students"]',
    title: 'Student Records',
    description: 'Access student profiles, academic records, and payment information.',
    position: 'right'
  },
  {
    target: '[data-tour="programs"]',
    title: 'Program Management',
    description: 'View and manage training programs and course offerings.',
    position: 'right'
  },
  {
    target: '[data-tour="training"]',
    title: 'Training & Assessment',
    description: 'Manage training schedules, batches, exams, and assessment results.',
    position: 'right'
  },
  {
    target: '[data-tour="inventory"]',
    title: 'Inventory Management',
    description: 'Track equipment and manage stock transactions for training resources.',
    position: 'right'
  },
  {
    target: '[data-tour="analytics"]',
    title: 'Enrollment Trends',
    description: 'View enrollment analytics and trends to understand student patterns.',
    position: 'right'
  },
  {
    target: '[data-tour="reports"]',
    title: 'Reports',
    description: 'Generate and view various reports including enrollment, student, assessment, and inventory reports.',
    position: 'right'
  },
  {
    target: '[data-tour="certificates"]',
    title: 'Certificates',
    description: 'View and manage student certificates issued upon completion of training programs.',
    position: 'right'
  },
  {
    target: '[data-tour="contact-messages"]',
    title: 'Contact Messages',
    description: 'View and respond to inquiries and messages from the website.',
    position: 'right'
  },
  {
    target: '[data-tour="profile"]',
    title: 'Profile Settings',
    description: 'Manage your account settings and personal information.',
    position: 'right'
  }
];

const OnboardingTour = ({ onComplete, sidebarExpanded, setSidebarExpanded }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState({ top: 0, left: 0, direction: 'left' });
  const [activeSteps, setActiveSteps] = useState(TOUR_STEPS);
  const tooltipRef = useRef(null);

  useEffect(() => {
    // Ensure sidebar is expanded for the tour
    if (!sidebarExpanded && setSidebarExpanded) {
      setSidebarExpanded(false); // false means not collapsed
    }
  }, [sidebarExpanded, setSidebarExpanded]);

  // Filter steps to only include those with visible targets
  useEffect(() => {
    const visibleSteps = TOUR_STEPS.filter(step => {
      const element = document.querySelector(step.target);
      return element !== null;
    });
    setActiveSteps(visibleSteps.length > 0 ? visibleSteps : TOUR_STEPS);
  }, []);

  useEffect(() => {
    const currentTarget = activeSteps[currentStep]?.target;
    if (!currentTarget) return;
    
    const updatePosition = () => {
      const targetElement = document.querySelector(currentTarget);
      
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const tooltipHeight = tooltipRef.current?.offsetHeight || 180;
        
        // Position tooltip to the right of the target
        let top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        let left = rect.right + 20;
        
        // Make sure tooltip doesn't go off screen
        if (top < 10) top = 10;
        if (top + tooltipHeight > window.innerHeight - 10) {
          top = window.innerHeight - tooltipHeight - 10;
        }
        
        // Arrow points to the center of the target element
        const arrowTop = rect.top + (rect.height / 2);
        const arrowLeft = rect.right + 8;
        
        setTooltipPosition({ top, left });
        setArrowPosition({ top: arrowTop, left: arrowLeft, direction: 'left' });
        
        // Highlight the target element
        targetElement.classList.add('tour-highlight-staff');
        
        // Scroll element into view if needed
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);

    // Cleanup previous highlight
    return () => {
      window.removeEventListener('resize', updatePosition);
      const prevTarget = document.querySelector('.tour-highlight-staff');
      if (prevTarget) {
        prevTarget.classList.remove('tour-highlight-staff');
      }
    };
  }, [currentStep, activeSteps]);

  const handleNext = () => {
    if (currentStep < activeSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('staffOnboardingCompleted', 'true');
    // Remove highlight
    const target = document.querySelector('.tour-highlight-staff');
    if (target) target.classList.remove('tour-highlight-staff');
    onComplete();
  };

  const handleFinish = () => {
    localStorage.setItem('staffOnboardingCompleted', 'true');
    // Remove highlight
    const target = document.querySelector('.tour-highlight-staff');
    if (target) target.classList.remove('tour-highlight-staff');
    onComplete();
  };

  return createPortal(
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[9998]">
        {/* Semi-transparent overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Arrow pointing to target */}
      <div
        className="fixed z-[10000] text-white"
        style={{
          top: arrowPosition.top - 12,
          left: arrowPosition.left,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 12l8-8v16l-8-8z" />
        </svg>
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[10000] w-80 bg-white rounded-xl shadow-2xl overflow-hidden"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        {/* Header */}
        <div className="bg-tracked-primary px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full">
              {currentStep + 1} / {activeSteps.length}
            </span>
            <h3 className="text-white font-semibold">{activeSteps[currentStep]?.title}</h3>
          </div>
          <button
            onClick={handleSkip}
            className="text-white/80 hover:text-white transition-colors"
          >
            <MdClose className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-600 text-sm leading-relaxed">
            {activeSteps[currentStep]?.description}
          </p>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            Skip tour
          </button>
          
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <MdArrowBack className="h-4 w-4" />
                Back
              </button>
            )}
            
            {currentStep < activeSteps.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-1.5 text-sm bg-tracked-primary text-white rounded-lg hover:bg-tracked-primary-dark transition-colors"
              >
                Next
                <MdArrowForward className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex items-center gap-1 px-4 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <MdCheck className="h-4 w-4" />
                Get Started!
              </button>
            )}
          </div>
        </div>

        {/* Progress dots */}
        <div className="px-4 pb-3 flex justify-center gap-1.5">
          {activeSteps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                index === currentStep
                  ? 'w-4 bg-tracked-primary'
                  : index < currentStep
                  ? 'w-1.5 bg-green-500'
                  : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Styles for highlighted element */}
      <style>{`
        .tour-highlight-staff {
          position: relative;
          z-index: 9999 !important;
          border-radius: 8px;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.7), 0 0 0 8px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.5);
          animation: pulse-highlight-staff 2s infinite;
        }
        
        @keyframes pulse-highlight-staff {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.7), 0 0 0 8px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.9), 0 0 0 10px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.6);
          }
        }
      `}</style>
    </>,
    document.body
  );
};

export default OnboardingTour;
