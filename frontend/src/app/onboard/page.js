'use client'
import React, { useState } from 'react';
import { User, MapPin, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tempToken, setTempToken] = useState('');

  // Use environment variable for API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const [formData, setFormData] = useState({
    // Step 1 - Personal Info + Password
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',

    // Step 2 - Location & Terms
    storeId: '',
    agreedToTerms: false,
    marketingConsent: false,

    // Step 3 - Payment
    depositAmount: 50,
    paymentMethod: 'card'
  });

  const stores = [
    { id: 'nash_001', name: 'Nashville Downtown Gaming', fee: 5, address: '123 Broadway, Nashville, TN' },
    { id: 'mem_001', name: 'Memphis Beale Street', fee: 6, address: '456 Beale St, Memphis, TN' },
    { id: 'knox_001', name: 'Knoxville Campus Hub', fee: 4, address: '789 Cumberland Ave, Knoxville, TN' }
  ];

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmitStep1 = async () => {
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/onboarding/step1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          dateOfBirth: formData.dateOfBirth || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        setTempToken(data.tempToken);
        setCurrentStep(2);
        setSuccess('Account created successfully!');
      } else {
        setError(data.error || 'Failed to create account');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Step 1 error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStep2 = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiUrl}/api/onboarding/step2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`
        },
        body: JSON.stringify({
          storeId: formData.storeId,
          agreedToTerms: formData.agreedToTerms,
          marketingConsent: formData.marketingConsent
        })
      });

      const data = await response.json();

      if (data.success) {
        setCurrentStep(3);
        setSuccess('Location and preferences saved!');
      } else {
        setError(data.error || 'Failed to save preferences');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Step 2 error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStep3 = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiUrl}/api/onboarding/step3`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`
        },
        body: JSON.stringify({
          depositAmount: formData.depositAmount,
          paymentMethod: formData.paymentMethod
        })
      });

      const data = await response.json();

      if (data.success) {
        setCurrentStep(4);
        setSuccess('🎉 Welcome to Gambino! Your account is ready to farm luck!');
        // Store auth token for future use
        if (typeof window !== 'undefined') {
          localStorage.setItem('gambino_token', data.accessToken);
        }
      } else {
        setError(data.error || 'Failed to process payment');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Step 3 error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-500 mb-2">🎲 GAMBINO</h1>
          <p className="text-gray-400">Farm Luck. Mine Destiny.</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center items-center mb-8">
          {[1, 2, 3, 4].map(step => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                currentStep >= step ? 'bg-yellow-500 text-black' : 'bg-gray-600 text-gray-400'
              }`}>
                {currentStep > step ? '✓' : step}
              </div>
              {step < 4 && (
                <div className={`w-12 h-1 mx-2 ${
                  currentStep > step ? 'bg-yellow-500' : 'bg-gray-600'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-300">{success}</span>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">

          {/* Step 1: Personal Info + Password */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <User className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Create Your Account</h2>
                <p className="text-gray-400">Join the luck mining revolution</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateFormData({ firstName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateFormData({ lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData({ email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData({ phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateFormData({ password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Confirm Password *</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData({ confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                  placeholder="Re-enter your password"
                  required
                />
                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">Passwords do not match</p>
                )}
              </div>

              <button
                onClick={handleSubmitStep1}
                disabled={loading || !formData.firstName || !formData.lastName || !formData.email || !formData.password || formData.password !== formData.confirmPassword}
                className="w-full py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account & Continue'}
              </button>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <MapPin className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Choose Your Location</h2>
                <p className="text-gray-400">Select where you'll be playing</p>
              </div>

              <div className="space-y-4">
                {stores.map(store => (
                  <div
                    key={store.id}
                    onClick={() => updateFormData({ storeId: store.id })}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.storeId === store.id
                        ? 'border-yellow-500 bg-yellow-500/10'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-white font-semibold">{store.name}</h3>
                        <p className="text-gray-400 text-sm">{store.address}</p>
                        <p className="text-gray-400 text-sm">8 gaming machines available</p>
                      </div>
                      <div className="text-yellow-500 font-bold">{store.fee}% Fee</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.agreedToTerms}
                    onChange={(e) => updateFormData({ agreedToTerms: e.target.checked })}
                    className="mr-3 h-4 w-4"
                  />
                  <span className="text-gray-300 text-sm">
                    I agree to the Terms of Service and Privacy Policy *
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.marketingConsent}
                    onChange={(e) => updateFormData({ marketingConsent: e.target.checked })}
                    className="mr-3 h-4 w-4"
                  />
                  <span className="text-gray-300 text-sm">
                    I want to receive updates about jackpots and promotions
                  </span>
                </label>
              </div>

              <button
                onClick={handleSubmitStep2}
                disabled={loading || !formData.storeId || !formData.agreedToTerms}
                className="w-full py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Continue to Payment'}
              </button>
            </div>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <CreditCard className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Initial Deposit</h2>
                <p className="text-gray-400">Add funds to start playing</p>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Deposit Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={formData.depositAmount}
                    onChange={(e) => updateFormData({ depositAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                  />
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  You'll receive {Math.floor(formData.depositAmount / 0.001).toLocaleString()} GAMBINO tokens
                </p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Deposit Amount:</span>
                    <span className="text-white">${formData.depositAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">GAMBINO Tokens:</span>
                    <span className="text-yellow-500">{Math.floor(formData.depositAmount / 0.001).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Token Price:</span>
                    <span className="text-white">$0.001</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmitStep3}
                disabled={loading || formData.depositAmount < 10}
                className="w-full py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing Payment...' : 'Complete Account Setup'}
              </button>
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 4 && (
            <div className="text-center space-y-6">
              <CheckCircle className="mx-auto h-20 w-20 text-green-500" />
              <h2 className="text-3xl font-bold text-white">Welcome to Gambino!</h2>
              <p className="text-gray-400 text-lg">Your account has been created successfully</p>

              <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-6">
                <h3 className="text-green-500 font-bold text-xl mb-4">🎉 You're All Set!</h3>
                <div className="space-y-2 text-left">
                  <p className="text-gray-300">✅ Secure account created</p>
                  <p className="text-gray-300">✅ Wallet created and secured</p>
                  <p className="text-gray-300">✅ Location selected</p>
                  <p className="text-gray-300">✅ Initial deposit processed</p>
                  <p className="text-gray-300">✅ Ready to farm luck!</p>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="flex-1 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        {currentStep < 4 && currentStep > 1 && (
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={loading}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <span className="text-gray-400 text-sm self-center">
              Step {currentStep} of 3
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
