// Test script to verify Step 3 form fields are working correctly
// Run this in browser console after navigating to Step 3

console.log('🧪 Testing Step 3 Form Fields...');

// Test data for Step 3 fields
const testData = {
  fullNameCyrillic: 'Иванов Иван Иванович',
  gender: 'male',
  maritalStatus: 'married',
  cityOfBirth: 'Алматы',
  countryOfBirth: 'kazakhstan',
  nationality: 'kazakhstani'
};

// Function to test form field population
const testStep3Fields = () => {
  console.log('\n📋 Testing Step 3 Form Field Population...\n');
  
  const results = {};
  
  // Test 1: Check if form fields exist
  console.log('1️⃣ Checking if form fields exist...');
  
  const fields = [
    { name: 'fullNameCyrillic', selector: 'input[name="fullNameCyrillic"]' },
    { name: 'gender', selector: 'select[name="gender"]' },
    { name: 'maritalStatus', selector: 'select[name="maritalStatus"]' },
    { name: 'cityOfBirth', selector: 'input[name="cityOfBirth"]' },
    { name: 'countryOfBirth', selector: 'select[name="countryOfBirth"]' },
    { name: 'nationality', selector: 'select[name="nationality"]' }
  ];
  
  fields.forEach(field => {
    const element = document.querySelector(field.selector);
    if (element) {
      console.log(`✅ ${field.name}: Found`);
      results[field.name] = { exists: true, element };
    } else {
      console.log(`❌ ${field.name}: Not found`);
      results[field.name] = { exists: false, element: null };
    }
  });
  
  // Test 2: Try to populate fields with test data
  console.log('\n2️⃣ Attempting to populate fields with test data...');
  
  Object.keys(testData).forEach(fieldName => {
    const fieldResult = results[fieldName];
    if (fieldResult.exists && fieldResult.element) {
      try {
        const element = fieldResult.element;
        const value = testData[fieldName];
        
        // Set the value
        element.value = value;
        
        // Trigger change event for React/Formik
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('input', { bubbles: true }));
        
        console.log(`✅ ${fieldName}: Set to "${value}"`);
        fieldResult.populated = true;
        fieldResult.value = value;
      } catch (error) {
        console.log(`❌ ${fieldName}: Failed to populate - ${error.message}`);
        fieldResult.populated = false;
        fieldResult.error = error.message;
      }
    } else {
      console.log(`⏭️ ${fieldName}: Skipped (field not found)`);
    }
  });
  
  // Test 3: Check if Next button is available and enabled
  console.log('\n3️⃣ Checking Next button...');
  
  const nextButton = Array.from(document.querySelectorAll('button'))
    .find(btn => btn.textContent.includes('Далее') || btn.textContent.includes('Next'));
  
  if (nextButton) {
    console.log(`✅ Next button found: "${nextButton.textContent}"`);
    console.log(`   Enabled: ${!nextButton.disabled}`);
    console.log(`   Classes: ${nextButton.className}`);
    results.nextButton = { 
      exists: true, 
      enabled: !nextButton.disabled,
      element: nextButton 
    };
  } else {
    console.log('❌ Next button not found');
    results.nextButton = { exists: false };
  }
  
  // Test 4: Check if form submission ref is working
  console.log('\n4️⃣ Testing form submission mechanism...');
  
  // Look for Formik form
  const formElement = document.querySelector('form');
  if (formElement) {
    console.log('✅ Formik form found');
    results.formik = { exists: true };
    
    // Check if form has onSubmit handler
    const hasOnSubmit = formElement.onsubmit !== null || 
                       formElement.getAttribute('onsubmit') !== null;
    console.log(`   Has onSubmit: ${hasOnSubmit}`);
    results.formik.hasOnSubmit = hasOnSubmit;
  } else {
    console.log('❌ Formik form not found');
    results.formik = { exists: false };
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  const fieldsFound = Object.values(results).filter(r => r.exists).length - 1; // -1 for nextButton
  const fieldsPopulated = Object.values(results).filter(r => r.populated).length;
  
  console.log(`   Fields found: ${fieldsFound}/6`);
  console.log(`   Fields populated: ${fieldsPopulated}/6`);
  console.log(`   Next button: ${results.nextButton.exists ? 'Found' : 'Not found'}`);
  console.log(`   Form element: ${results.formik.exists ? 'Found' : 'Not found'}`);
  
  if (fieldsFound === 6 && fieldsPopulated === 6 && results.nextButton.exists) {
    console.log('\n🎉 All tests passed! Step 3 form fields are working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the implementation.');
  }
  
  return results;
};

// Function to simulate form submission
const testFormSubmission = () => {
  console.log('\n🚀 Testing form submission...');
  
  const nextButton = Array.from(document.querySelectorAll('button'))
    .find(btn => btn.textContent.includes('Далее') || btn.textContent.includes('Next'));
  
  if (nextButton && !nextButton.disabled) {
    console.log('Clicking Next button...');
    nextButton.click();
    
    // Wait a bit and check if step changed
    setTimeout(() => {
      const currentUrl = window.location.href;
      console.log(`Current URL: ${currentUrl}`);
      console.log('Check if step progressed and data was saved to Supabase.');
    }, 1000);
  } else {
    console.log('❌ Cannot test submission - Next button not available or disabled');
  }
};

// Auto-run tests if in browser
if (typeof window !== 'undefined') {
  // Wait for page to load
  setTimeout(() => {
    const results = testStep3Fields();
    
    // Offer to test submission
    console.log('\n💡 To test form submission, run: testFormSubmission()');
    
    // Make functions available globally
    window.testStep3Fields = testStep3Fields;
    window.testFormSubmission = testFormSubmission;
    window.testResults = results;
  }, 1000);
}

// Export for manual testing
if (typeof module !== 'undefined') {
  module.exports = { testStep3Fields, testFormSubmission };
}
