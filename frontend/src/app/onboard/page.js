'use client'
import React, { useState, useEffect } from 'react';
import { User, MapPin, CreditCard, CheckCircle, AlertCircle, Eye, EyeOff, Copy, Download } from 'lucide-react';

const EnhancedOnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [walletInfo, setWalletInfo] = useState(null);
  const [showRecoveryPhrase, setShowRecoveryPhrase] = useState(false);
  const [recoveryPhraseConfirmed, setRecoveryPhraseConfirmed] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    
    // Step 2
    storeId: '',
    agreedToTerms: false,
    marketingConsent: false,
    
    // Step 3
    depositAmount: 50,
    paymentMethod: 'cash'
  });

  const stores = [
    { id: 'nash_downtown', name: 'Nashville Downtown Gaming', address: '123 Broadway, Nashville, TN', fee: 5, machines: 8 },
    { id: 'mem_beale', name: 'Memphis Beale Street', address: '456 Beale St, Memphis, TN', fee: 6, machines: 8 },
    { id: 'knox_campus', name: 'Knoxville Campus Hub', address: '789 Cumberland Ave, Knoxville, TN', fee: 4, machines: 8 },
    { id: 'chat_market', name: 'Chattanooga Market Square', address: '321 Market St, Chattanooga, TN', fee: 5, machines: 8 }
  ];

  const paymentMethods = [
    { id: 'cash', name: 'Cash at Terminal', icon: '💵', description: 'Pay with cash at the gaming terminal' },
    { id: 'card', name: 'Credit/Debit Card', icon: '💳', description: 'Secure card payment processing' },
    { id: 'crypto', name: 'Cryptocurrency', icon: '₿', description: 'Pay with BTC, ETH, or USDC' }
  ];

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmitStep1 = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/onboarding/step1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete step 1');
      }

      setWalletInfo({
        address: data.data.walletAddress,
        recoveryPhrase: data.data.recoveryPhrase
      });
      setTempToken(data.tempToken);
      setSuccess('Wallet created successfully! Please save your recovery phrase.');
      setCurrentStep(2);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStep2 = async () => {
    if (!recoveryPhraseConfirmed) {
      setError('Please confirm you have saved your recovery phrase');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/onboarding/step2', {
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

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete step 2');
      }

      setTempToken(data.tempToken);
      setSuccess('Location selected successfully!');
      setCurrentStep(3);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStep3 = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/onboarding/step3', {
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

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete onboarding');
      }

      // Store access token
      localStorage.setItem('gambinoToken', data.accessToken);
      localStorage.setItem('gambinoUser', JSON.stringify(data.data.user));

      setSuccess('Account created successfully! Welcome to Gambino!');
      setCurrentStep(4);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const downloadRecoveryPhrase = () => {
    if (!walletInfo?.recoveryPhrase) return;
    
    const element = document.createElement('a');
    const file = new Blob([`Gambino Wallet Recovery Phrase\n\n${walletInfo.recoveryPhrase}\n\nIMPORTANT: Keep this phrase safe and secret. It's the only way to recover your wallet.`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'gambino-recovery-phrase.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <User className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to Gambino</h2>
        <p className="text-gray-400">Let's create your account and wallet</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="First Name"
          value={formData.firstName}
          onChange={(e) => updateFormData({ firstName: e.target.value })}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={(e) => updateFormData({ lastName: e.target.value })}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
          required
        />
      </div>

      <input
        type="email"
        placeholder="Email Address"
        value={formData.email}
        onChange={(e) => updateFormData({ email: e.target.value })}
        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
        required
      />

      <input
        type="tel"
        placeholder="Phone Number (Optional)"
        value={formData.phone}
        onChange={(e) => updateFormData({ phone: e.target.value })}
        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
      />

      <div>
        <label className="block text-gray-300 mb-2">Date of Birth (Optional)</label>
        <input
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
        />
      </div>

      <button
        onClick={handleSubmitStep1}
        disabled={loading || !formData.firstName || !formData.lastName || !formData.email}
        className="w-full py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating Wallet...' : 'Create Wallet'}
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {walletInfo && (
        <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
          <h3 className="text-yellow-500 font-bold mb-3 flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            Save Your Recovery Phrase
          </h3>
          
          <div className="space-y-3">
            <p className="text-gray-300 text-sm">
              Your wallet address: <code className="bg-gray-800 px-2 py-1 rounded text-yellow-500 text-xs">{walletInfo.address}</code>
            </p>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300 text-sm">Recovery Phrase:</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowRecoveryPhrase(!showRecoveryPhrase)}
                    className="text-yellow-500 hover:text-yellow-400"
                  >
                    {showRecoveryPhrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(walletInfo.recoveryPhrase)}
                    className="text-yellow-500 hover:text-yellow-400"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={downloadRecoveryPhrase}
                    className="text-yellow-500 hover:text-yellow-400"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="font-mono text-sm text-white bg-gray-900 p-3 rounded">
                {showRecoveryPhrase ? walletInfo.recoveryPhrase : '•'.repeat(walletInfo.recoveryPhrase.length)}
              </div>
            </div>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={recoveryPhraseConfirmed}
                onChange={(e) => setRecoveryPhraseConfirmed(e.target.checked)}
                className="text-yellow-500"
              />
              <span className="text-sm text-gray-300">
                I have safely saved my recovery phrase and understand it's the only way to recover my wallet
              </span>
            </label>
          </div>
        </div>
      )}

      <div className="text-center">
        <MapPin className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Choose Your Gaming Location</h2>
        <p className="text-gray-400">Select where you'll be playing Gambino</p>
      </div>

      <div className="grid gap-4">
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
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">{store.name}</h3>
                <p className="text-gray-400 text-sm mb-2">{store.address}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-300">🎰 {store.machines} machines</span>
                  <span className="text-yellow-500 font-bold">{store.fee}% fee</span>
                </div>
              </div>
              {formData.storeId === store.id && (
                <CheckCircle className="h-6 w-6 text-yellow-500" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.agreedToTerms}
            onChange={(e) => updateFormData({ agreedToTerms: e.target.checked })}
            className="text-yellow-500"
            required
          />
          <span className="text-sm text-gray-300">
            I agree to the <a href="/terms" className="text-yellow-500 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-yellow-500 hover:underline">Privacy Policy</a>
          </span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.marketingConsent}
            onChange={(e) => updateFormData({ marketingConsent: e.target.checked })}
            className="text-yellow-500"
          />
          <span className="text-sm text-gray-300">
            I would like to receive marketing emails about new features and promotions
          </span>
        </label>
      </div>

      <button
        onClick={handleSubmitStep2}
        disabled={loading || !formData.storeId || !formData.agreedToTerms || !recoveryPhraseConfirmed}
        className="w-full py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Continue to Payment'}
      </button>
    </div>
  );

  const renderStep3 = () => (
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

      <div>
        <label className="block text-gray-300 mb-3">Payment Method</label>
        <div className="grid gap-3">
          {paymentMethods.map(method => (
            <div
              key={method.id}
              onClick={() => updateFormData({ paymentMethod: method.id })}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.paymentMethod === method.id 
                  ? 'border-yellow-500 bg-yellow-500/10' 
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{method.icon}</span>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{method.name}</h3>
                  <p className="text-gray-400 text-sm">{method.description}</p>
                </div>
                {formData.paymentMethod === method.id && (
                  <CheckCircle className="h-6 w-6 text-yellow-500" />
                )}
              </div>
            </div>
          ))}
        </div>
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
  );

  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <CheckCircle className="mx-auto h-20 w-20 text-green-500" />
      <h2 className="text-3xl font-bold text-white">Welcome to Gambino!</h2>
      <p className="text-gray-400 text-lg">Your account has been created successfully</p>
      
      <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-6">
        <h3 className="text-green-500 font-bold text-xl mb-4">🎉 You're All Set!</h3>
        <div className="space-y-2 text-left">
          <p className="text-gray-300">✅ Wallet created and secured</p>
          <p className="text-gray-300">✅ Location selected</p>
          <p className="text-gray-300">✅ Initial deposit processed</p>
          <p className="text-gray-300">✅ Ready to farm luck!</p>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="flex-1 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400"
        >
          Go to Dashboard
        </button>
        <button
          onClick={() => window.location.href = '/machines'}
          className="flex-1 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 border border-gray-600"
        >
          Find Machines
        </button>
      </div>
    </div>
  );

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
                {currentStep > step ? <CheckCircle className="h-6 w-6" /> : step}
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
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        {/* Navigation */}
        {currentStep < 4 && (
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1 || loading}
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
};

export default EnhancedOnboardingPage;