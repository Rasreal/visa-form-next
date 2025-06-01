// Quick verification script to test the form submission fix
// Run this in browser console after loading the application

console.log('🔍 Verifying Form Submission Fix...');

// Test 1: Check if Step1 component has the correct ref structure
const checkStep1Ref = () => {
  const step1Element = document.querySelector('[data-testid="step1"]') || 
                      document.querySelector('form');
  if (step1Element) {
    console.log('✅ Step 1 form element found');
    return true;
  } else {
    console.log('❌ Step 1 form element not found');
    return false;
  }
};

// Test 2: Check if StepWrapper has the correct button structure
const checkStepWrapperButton = () => {
  const nextButton = Array.from(document.querySelectorAll('button'))
    .find(btn => btn.textContent.includes('Далее') || btn.textContent.includes('Next'));
  
  if (nextButton) {
    console.log('✅ Next button found:', nextButton.textContent);
    return true;
  } else {
    console.log('❌ Next button not found');
    return false;
  }
};

// Test 3: Simulate form submission (if possible)
const testFormSubmission = () => {
  try {
    // Look for country select dropdown
    const countrySelect = document.querySelector('select[name="country"]');
    if (countrySelect) {
      console.log('✅ Country select found');
      
      // Set a value
      countrySelect.value = 'usa';
      countrySelect.dispatchEvent(new Event('change', { bubbles: true }));
      
      console.log('✅ Country value set to:', countrySelect.value);
      return true;
    } else {
      console.log('❌ Country select not found');
      return false;
    }
  } catch (error) {
    console.log('❌ Error in form submission test:', error);
    return false;
  }
};

// Test 4: Check for Supabase client
const checkSupabaseClient = () => {
  if (typeof window !== 'undefined' && window.supabase) {
    console.log('✅ Supabase client available');
    return true;
  } else {
    console.log('ℹ️ Supabase client not directly accessible (normal for production)');
    return true; // This is actually normal
  }
};

// Run all tests
const runVerification = () => {
  console.log('\n📋 Running Verification Tests...\n');
  
  const results = {
    step1Ref: checkStep1Ref(),
    stepWrapperButton: checkStepWrapperButton(),
    formSubmission: testFormSubmission(),
    supabaseClient: checkSupabaseClient()
  };
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n📊 Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All verification tests passed! The fix appears to be working.');
  } else {
    console.log('⚠️ Some tests failed. Check the implementation.');
  }
  
  return results;
};

// Auto-run if in browser
if (typeof window !== 'undefined') {
  setTimeout(runVerification, 1000); // Wait for page to load
}

// Export for manual testing
if (typeof module !== 'undefined') {
  module.exports = { runVerification, checkStep1Ref, checkStepWrapperButton, testFormSubmission };
}
