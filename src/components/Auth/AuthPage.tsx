import React, { useState, useEffect } from 'react'
import { DollarSign, ArrowLeft, CheckCircle } from 'lucide-react'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import ForgotPasswordForm from './ForgotPasswordForm'

type AuthView = 'login' | 'signup' | 'forgot-password' | 'reset-success'

const AuthPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<AuthView>('login')
  const [isAnimating, setIsAnimating] = useState(false)

  const handleViewChange = (newView: AuthView) => {
    if (newView === currentView) return
    
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentView(newView)
      setIsAnimating(false)
    }, 150)
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'signup':
        return <SignupForm onSwitchToLogin={() => handleViewChange('login')} />
      case 'forgot-password':
        return (
          <ForgotPasswordForm 
            onSwitchToLogin={() => handleViewChange('login')}
            onResetSuccess={() => handleViewChange('reset-success')}
          />
        )
      case 'reset-success':
        return <ResetSuccessView onBackToLogin={() => handleViewChange('login')} />
      default:
        return (
          <LoginForm 
            onSwitchToSignup={() => handleViewChange('signup')}
            onSwitchToForgotPassword={() => handleViewChange('forgot-password')}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-xl"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-white rounded-full blur-lg"></div>
          <div className="absolute bottom-32 left-40 w-40 h-40 bg-white rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center text-white">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold">FinSense</h1>
          </div>
          
          {/* Tagline */}
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Smart Financial<br />
            Management<br />
            Made Simple
          </h2>
          
          <p className="text-xl text-primary-100 mb-8 leading-relaxed">
            Take control of your finances with AI-powered insights, 
            comprehensive tracking, and personalized recommendations.
          </p>
          
          {/* Features */}
          <div className="space-y-4">
            {[
              'Upload bank statements (PDF, CSV, Excel)',
              'AI-powered transaction categorization',
              'Smart budgeting and forecasting',
              'Real-time financial insights',
              'Secure data protection'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span className="text-primary-100">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="bg-primary-600 p-3 rounded-xl">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">FinSense</h1>
            </div>
            <p className="text-gray-600">Smart Financial Management</p>
          </div>

          {/* Back Button for sub-views */}
          {(currentView === 'forgot-password' || currentView === 'reset-success') && (
            <button
              onClick={() => handleViewChange('login')}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </button>
          )}

          {/* Form Container with Animation */}
          <div className={`transition-all duration-150 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            {renderCurrentView()}
          </div>
        </div>
      </div>
    </div>
  )
}

// Reset Success View Component
const ResetSuccessView: React.FC<{ onBackToLogin: () => void }> = ({ onBackToLogin }) => {
  return (
    <div className="w-full max-w-md mx-auto text-center">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h2>
        <p className="text-gray-600">
          We've sent a password reset link to your email address. 
          Please check your inbox and follow the instructions to reset your password.
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={onBackToLogin}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
        >
          Back to Sign In
        </button>
        
        <p className="text-sm text-gray-500">
          Didn't receive the email? Check your spam folder or try again in a few minutes.
        </p>
      </div>
    </div>
  )
}

export default AuthPage 