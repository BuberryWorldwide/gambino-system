'use client'
import React, { useState } from 'react';

export default function OnboardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    storeId: '',
    depositAmount: 50
  });

  const stores = [
    { id: 'nash_001', name: 'Nashville Downtown Gaming', fee: 5 },
    { id: 'mem_001', name: 'Memphis Beale Street', fee: 6 },
    { id: 'knox_001', name: 'Knoxville Campus Hub', fee: 4 }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1f2937 0%, #000000 50%, #1f2937 100%)',
      color: 'white',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#FFD700', marginBottom: '0.5rem' }}>
            🎲 GAMBINO
          </h1>
          <p style={{ color: '#9CA3AF' }}>Farm Luck. Mine Destiny.</p>
        </div>

        {/* Step Indicator */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          marginBottom: '2rem' 
        }}>
          {[1, 2, 3].map(step => (
            <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                backgroundColor: currentStep >= step ? '#FFD700' : '#4B5563',
                color: currentStep >= step ? '#000' : '#9CA3AF'
              }}>
                {step}
              </div>
              {step < 3 && (
                <div style={{
                  width: '48px',
                  height: '4px',
                  margin: '0 8px',
                  backgroundColor: currentStep > step ? '#FFD700' : '#4B5563'
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{
          backgroundColor: '#1F2937',
          border: '1px solid #374151',
          borderRadius: '12px',
          padding: '2rem'
        }}>
          
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👤</div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Welcome to Gambino</h2>
                <p style={{ color: '#9CA3AF' }}>Let's get you set up with your account</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  style={{
                    padding: '12px',
                    backgroundColor: '#374151',
                    border: '1px solid #4B5563',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  style={{
                    padding: '12px',
                    backgroundColor: '#374151',
                    border: '1px solid #4B5563',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#374151',
                    border: '1px solid #4B5563',
                    borderRadius: '8px',
                    color: 'white',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#374151',
                    border: '1px solid #4B5563',
                    borderRadius: '8px',
                    color: 'white',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📍</div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Choose Your Location</h2>
                <p style={{ color: '#9CA3AF' }}>Select where you'll be playing</p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {stores.map(store => (
                  <div
                    key={store.id}
                    onClick={() => setFormData({...formData, storeId: store.id})}
                    style={{
                      padding: '1rem',
                      border: `2px solid ${formData.storeId === store.id ? '#FFD700' : '#4B5563'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: formData.storeId === store.id ? 'rgba(255, 215, 0, 0.1)' : '#374151',
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{store.name}</h3>
                        <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>8 gaming machines available</p>
                      </div>
                      <div style={{ color: '#FFD700', fontWeight: 'bold' }}>{store.fee}% Fee</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Complete */}
          {currentStep === 3 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
              <h2 style={{ fontSize: '1.5rem', color: '#10B981', marginBottom: '1rem' }}>Account Created!</h2>
              <p style={{ color: '#9CA3AF', marginBottom: '2rem' }}>You're ready to start farming luck</p>
              
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid #10B981',
                padding: '1.5rem',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FFD700', marginBottom: '0.5rem' }}>
                  {Math.floor(formData.depositAmount / 0.001).toLocaleString()}
                </div>
                <div style={{ color: '#9CA3AF' }}>GAMBINO Tokens Ready</div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: '1.5rem' 
        }}>
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#374151',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              opacity: currentStep === 1 ? 0.5 : 1
            }}
          >
            Previous
          </button>
          
          <button
            onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#FFD700',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {currentStep === 3 ? 'Start Playing' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
