import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

import StepWrapper from '../components/StepWrapper';
import Step1_Welcome, { Step1Ref } from '../components/Step1_Welcome';
import Step2_DocumentUpload, { Step2Ref } from '../components/Step2_DocumentUpload';
import Step3_PersonalInfo, { Step3Ref } from '../components/Step3_PersonalInfo';
import Step4_TravelPurpose, { Step4Ref } from '../components/Step4_TravelPurpose';
import Step5_VisaHistory, { Step5Ref } from '../components/Step5_VisaHistory';
import Step6_ContactInfo, { Step6Ref } from '../components/Step6_ContactInfo';
import Step7_FamilyInfo, { Step7Ref } from '../components/Step7_FamilyInfo';
import Step8_EducationWork, { Step8Ref } from '../components/Step8_EducationWork';
import Step9_TravelHistory, { Step9Ref } from '../components/Step9_TravelHistory';

import { saveFormData, getOrCreateUserData, markWhatsappRedirected, testSupabaseConnection } from '../utils/supabase';
import {
  getOrCreateAgentId,
  getCurrentStep,
  setCurrentStep,
  isLocalStorageAvailable
} from '../utils/localStorage';
import ThankYouPage from '../components/ThankYouPage';
import {
  VisaFormData,
  Step1Data,
  Step2Data,
  Step3Data,
  Step4Data,
  Step5Data,
  Step6Data,
  Step7Data,
  Step8Data,
  Step9Data
} from '../utils/types';

const totalSteps = 9;

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [agentId, setAgentId] = useState('');
  const [isFormCompleted, setIsFormCompleted] = useState(false);
  const [, setIsNewUser] = useState(false);
  const [isDeployedEnvironment, setIsDeployedEnvironment] = useState(false);
  const [formData, setFormData] = useState<VisaFormData>({
    // Step 1
    visaDestination: '',

    // Step 2
    surname: '',
    name: '',
    dateOfBirth: '',
    citizenship: '',
    passportNumber: '',
    passportIssueDate: '',
    passportExpiryDate: '',
    iin: '',
    idNumber: '',

    // Step 3
    fullNameCyrillic: '',
    hasOtherNames: false,
    otherNames: '',
    gender: '',
    maritalStatus: '',
    cityOfBirth: '',
    countryOfBirth: '',
    hasOtherCitizenship: false,
    otherCitizenship: '',
    isPermanentResidentOtherCountry: false,
    permanentResidenceCountry: '',
    nationality: '',
    hasSSN: false,
    ssn: '',
    hasTaxpayerId: false,
    taxpayerId: '',

    // Step 4
    travelPurpose: '',
    hasOwnTravelPurpose: false,
    travelPurposeDescription: '',
    departureDate: '',
    returnDate: '',
    destination: '',
    hasInvitation: false,
    invitationFile: '',
    travelWithOthers: false,
    travelAsGroup: false,
    groupName: '',
    companions: [],

    // Step 5
    hasBeenToUSA: false,
    hasUSVisa: false,
    lastVisaDate: '',
    visaNumber: '',
    isSameVisaType: false,
    isSameCountry: false,
    hasVisaRejections: false,
    rejectionVisaType: '',
    rejectionDate: '',
    visaRejections: [],
    hasPreviousDS160: false,
    previousDS160File: '',

    // Step 6
    address: '',
    city: '',
    stateProvince: '',
    zipCode: '',
    phone: '',
    email: '',
    socialMediaLinks: [],

    // Step 7
    hasSpouse: false,
    spouseFullName: '',
    spouseDateOfBirth: '',
    spouseCitizenship: '',
    wasSpouseInUSA: false,
    spouseUSAEntryDate: '',
    spouseUSAStayDuration: '',
    spouseUSAStayDurationType: '',
    fatherSurname: '',
    fatherName: '',
    fatherDateOfBirth: '',
    isFatherDateOfBirthUnknown: false,
    isFatherInUSA: false,
    fatherUSAReason: '',
    motherSurname: '',
    motherName: '',
    motherDateOfBirth: '',
    isMotherDateOfBirthUnknown: false,
    isMotherInUSA: false,
    motherUSAReason: '',
    hasRelativesInUSA: false,
    relatives: [],

    // Step 8
    occupation: '',
    educationLocation: '',
    isCurrentStudent: false,
    hasJob: false,
    hasBusiness: false,
    companyName: '',
    position: '',
    workAddress: '',
    workPhone: '',
    workExperience: '',
    income: '',
    universityName: '',
    universityAddress: '',
    faculty: '',
    startDate: '',
    endDate: '',
    businessType: '',
    businessName: '',
    businessRegistrationType: '',
    businessRegistrationNumber: '',
    businessRegistrationDate: '',
    businessActivity: '',
    monthlyBusinessIncome: '',
    hasEmployees: false,
    employeeCount: 0,
    businessStatus: '',
    businessAddress: '',
    businessWebsite: '',
    hasInternationalClients: false,
    hasPermanentContracts: false,
    paysTaxes: false,
    businessExperienceYears: 0,
    hasBankStatements: false,
    yearlyIncome: '',
    hasOffice: false,
    officeAddress: '',

    // Step 9
    visitedCountries: [],
  });

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Refs for step components
  const step1Ref = useRef<Step1Ref>(null);
  const step2Ref = useRef<Step2Ref>(null);
  const step3Ref = useRef<Step3Ref>(null);
  const step4Ref = useRef<Step4Ref>(null);
  const step5Ref = useRef<Step5Ref>(null);
  const step6Ref = useRef<Step6Ref>(null);
  const step7Ref = useRef<Step7Ref>(null);
  const step8Ref = useRef<Step8Ref>(null);
  const step9Ref = useRef<Step9Ref>(null);

  // Helper functions to get current step's form submission and validation
  const getCurrentStepSubmitFunction = () => {
    switch (step) {
      case 1:
        return () => step1Ref.current?.submitForm();
      case 2:
        return () => step2Ref.current?.submitForm();
      case 3:
        return () => step3Ref.current?.submitForm();
      case 4:
        return () => step4Ref.current?.submitForm();
      case 5:
        return () => step5Ref.current?.submitForm();
      case 6:
        return () => step6Ref.current?.submitForm();
      case 7:
        return () => step7Ref.current?.submitForm();
      case 8:
        return () => step8Ref.current?.submitForm();
      case 9:
        return () => step9Ref.current?.submitForm();
      default:
        return undefined;
    }
  };

  const getCurrentStepFormValidity = () => {
    switch (step) {
      case 1:
        return step1Ref.current?.isValid ?? true;
      case 2:
        return step2Ref.current?.isValid ?? true;
      case 3:
        return step3Ref.current?.isValid ?? true;
      case 4:
        return step4Ref.current?.isValid ?? true;
      case 5:
        return step5Ref.current?.isValid ?? true;
      case 6:
        return step6Ref.current?.isValid ?? true;
      case 7:
        return step7Ref.current?.isValid ?? true;
      case 8:
        return step8Ref.current?.isValid ?? true;
      case 9:
        return step9Ref.current?.isValid ?? true;
      default:
        return true;
    }
  };

  // Session management functions
  const initializeUserSession = useCallback(async () => {
    try {
      setIsLoading(true);

      // Check localStorage availability
      if (!isLocalStorageAvailable()) {
        console.warn('localStorage is not available, using fallback mode');
      }

      // Get or create agent ID
      const urlAgentId = typeof router.query.agent_id === 'string' ? router.query.agent_id : undefined;
      const currentAgentId = getOrCreateAgentId(urlAgentId);
      setAgentId(currentAgentId);


      // Test Supabase connection first
      const connectionTest = await testSupabaseConnection();
      if (!connectionTest.success) {
        console.error('Supabase connection failed:', connectionTest.error);
        setErrorMessage('Ошибка подключения к базе данных. Проверьте настройки Supabase.');
        return;
      }

      // Check if table needs to be created
      if (connectionTest.needsTableCreation) {
        console.warn('Table visa_applications does not exist. Please create it in Supabase.');
        setErrorMessage('Таблица базы данных не найдена. Обратитесь к администратору.');
        return;
      }

      // Get or create user data
      const { data, error, isNewUser: newUser } = await getOrCreateUserData(currentAgentId);

      if (error) {
        console.error('Error getting/creating user data:', error);
        setErrorMessage('Не удалось загрузить данные пользователя.');
        return;
      }

      if (data) {
        // Check if form is completed
        if (data.whatsapp_redirected) {
          setIsFormCompleted(true);
          return;
        }

        // Load existing form data and step
        if (data.form_data && Object.keys(data.form_data).length > 0) {
          setFormData(data.form_data as VisaFormData);
        }

        // Set step from database or localStorage
        const dbStep = data.step_status || 1;
        const localStep = getCurrentStep();
        const currentStep = Math.max(dbStep, localStep);

        setStep(currentStep);
        setCurrentStep(currentStep); // Update localStorage

        if (data.uploaded_files) {
          setUploadedFiles(data.uploaded_files);
        }

        setIsNewUser(newUser);
      }

    } catch (error) {
      console.error('Failed to initialize user session:', error);
      setErrorMessage('Не удалось инициализировать сессию пользователя.');
    } finally {
      setIsLoading(false);
    }
  }, [router.query.agent_id]);

  // Auto-save function with debouncing
  const debouncedAutoSave = useCallback((currentFormData: VisaFormData, currentStep: number) => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Define autoSaveFormData inside useCallback
    const autoSaveFormData = async (formData: VisaFormData, step: number) => {
      if (!agentId || agentId.trim() === '') return;

      try {
        setIsAutoSaving(true);
        await saveFormData(formData, agentId, step, uploadedFiles);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
        // Don't show error to user for auto-save failures
      } finally {
        setIsAutoSaving(false);
      }
    };

    const timeout = setTimeout(() => {
      autoSaveFormData(currentFormData, currentStep);
    }, 1000); // Save after 1 second of inactivity

    setAutoSaveTimeout(timeout);
  }, [agentId, uploadedFiles]);

  // Helper function to update form data and trigger auto-save
  const updateFormData = (newData: Partial<VisaFormData>) => {
    setFormData(prevFormData => {
      const updatedFormData = {
        ...prevFormData,
        ...newData,
      };
      return updatedFormData;
    });
  };

  // Initialize user session on component mount
  useEffect(() => {
    initializeUserSession();
  }, [initializeUserSession]);

  // Auto-save when form data changes
  useEffect(() => {
    if (agentId && agentId.trim() !== '' && !isLoading) {
      // Check if formData has any meaningful content
      const hasContent = Object.values(formData).some(value => {
        if (typeof value === 'string') return value.trim() !== '';
        if (typeof value === 'boolean') return value;
        if (Array.isArray(value)) return value.length > 0;
        return false;
      });

      if (hasContent) {
        debouncedAutoSave(formData, step);
      }
    }
  }, [formData, agentId, step, isLoading, debouncedAutoSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  const handleNext = async () => {
    if (step === totalSteps) {
      try {
        // Redirect to WhatsApp
        const phoneNumber = '+77064172408';
        await markWhatsappRedirected(agentId);
        window.location.href = `https://wa.me/${phoneNumber}?text=Я заполнил(а) анкету. Мой ID: ${agentId}`;
      } catch (error) {
        console.error('Failed to redirect to WhatsApp:', error);
        setErrorMessage('Не удалось перейти в WhatsApp. Пожалуйста, попробуйте еще раз.');
      }
    } else {
      const nextStep = step + 1;
      setStep(nextStep);
      setCurrentStep(nextStep); // Save to localStorage
      
      // Scroll to top of the page
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handlePrev = () => {
    const prevStep = Math.max(1, step - 1);
    setStep(prevStep);
    setCurrentStep(prevStep); // Save to localStorage
    
    // Scroll to top of the page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Type-safe step submit handlers
  const handleStep1Submit = async (stepData: Step1Data) => {
    try {
      updateFormData(stepData);

      // Save immediately when moving to next step
      const updatedFormData = { ...formData, ...stepData };
      await saveFormData(updatedFormData, agentId, step + 1, uploadedFiles);
      handleNext();
    } catch (error) {
      console.error('Failed to save form data:', error);
      setErrorMessage('Не удалось сохранить данные. Пожалуйста, попробуйте еще раз.');
    }
  };

  const handleStep2Submit = async (stepData: Step2Data) => {
    try {
      updateFormData(stepData);

      // Save immediately when moving to next step
      const updatedFormData = { ...formData, ...stepData };
      await saveFormData(updatedFormData, agentId, step + 1, uploadedFiles);
      handleNext();
    } catch (error) {
      console.error('Failed to save form data:', error);
      setErrorMessage('Не удалось сохранить данные. Пожалуйста, попробуйте еще раз.');
    }
  };

  const handleStep3Submit = async (stepData: Step3Data) => {
    try {
      updateFormData(stepData);

      // Save immediately when moving to next step
      const updatedFormData = { ...formData, ...stepData };
      await saveFormData(updatedFormData, agentId, step + 1, uploadedFiles);
      handleNext();
    } catch (error) {
      console.error('Failed to save form data:', error);
      setErrorMessage('Не удалось сохранить данные. Пожалуйста, попробуйте еще раз.');
    }
  };

  const handleStep4Submit = async (stepData: Step4Data) => {
    try {
      console.log('Step 4 Submit - Data received:', stepData);
      updateFormData(stepData);

      // Save immediately when moving to next step
      const updatedFormData = { ...formData, ...stepData };
      await saveFormData(updatedFormData, agentId, step + 1, uploadedFiles);
      handleNext();
    } catch (error) {
      console.error('Failed to save form data:', error);
      setErrorMessage('Не удалось сохранить данные. Пожалуйста, попробуйте еще раз.');
    }
  };

  const handleStep5Submit = async (stepData: Step5Data) => {
    try {
      updateFormData(stepData);

      // Save immediately when moving to next step
      const updatedFormData = { ...formData, ...stepData };
      await saveFormData(updatedFormData, agentId, step + 1, uploadedFiles);
      handleNext();
    } catch (error) {
      console.error('Failed to save form data:', error);
      setErrorMessage('Не удалось сохранить данные. Пожалуйста, попробуйте еще раз.');
    }
  };

  const handleStep6Submit = async (stepData: Step6Data) => {
    try {
      updateFormData(stepData);

      // Save immediately when moving to next step
      const updatedFormData = { ...formData, ...stepData };
      await saveFormData(updatedFormData, agentId, step, uploadedFiles);
      handleNext();
    } catch (error) {
      console.error('Failed to save form data:', error);
      setErrorMessage('Не удалось сохранить данные. Пожалуйста, попробуйте еще раз.');
    }
  };

  const handleStep7Submit = async (stepData: Step7Data) => {
    try {
      updateFormData(stepData);

      // Save immediately when moving to next step
      const updatedFormData = { ...formData, ...stepData };
      await saveFormData(updatedFormData, agentId, step + 1, uploadedFiles);
      handleNext();
    } catch (error) {
      console.error('Failed to save form data:', error);
      setErrorMessage('Не удалось сохранить данные. Пожалуйста, попробуйте еще раз.');
    }
  };

  const handleStep8Submit = async (stepData: Step8Data) => {
    try {
      updateFormData(stepData);

      // Save immediately when moving to next step
      const updatedFormData = { ...formData, ...stepData };
      await saveFormData(updatedFormData, agentId, step + 1, uploadedFiles);
      handleNext();
    } catch (error) {
      console.error('Failed to save form data:', error);
      setErrorMessage('Не удалось сохранить данные. Пожалуйста, попробуйте еще раз.');
    }
  };

  const handleStep9Submit = async (stepData: Step9Data) => {
    try {
      updateFormData(stepData);

      const updatedFormData = {
        ...formData,
        ...stepData,
      };

      // Save immediately when completing the form
      await saveFormData(updatedFormData, agentId, step + 1, uploadedFiles);

      // Send WhatsApp message to user's phone after form completion
      if (updatedFormData.phone) {
        try {
          console.log('Sending WhatsApp message to:', updatedFormData.phone);
          const response = await fetch('/api/send-whatsapp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phone: updatedFormData.phone
            })
          });

          const result = await response.json();

          if (!result.success) {
            console.error('Failed to send WhatsApp message to user:', result.error);
            // Don't block the flow if message sending fails
          } else {
            console.log('WhatsApp message sent to user successfully:', result);
          }
        } catch (error) {
          console.error('Error sending WhatsApp message to user:', error);
          // Don't block the flow if message sending fails
        }
      } else {
        console.log('No phone number found, skipping WhatsApp message');
      }

      handleNext();
    } catch (error) {
      console.error('Failed to save form data:', error);
      setErrorMessage('Не удалось сохранить данные. Пожалуйста, попробуйте еще раз.');
    }
  };

  // Determine the current step title
  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Добро пожаловать';
      case 2:
        return 'Загрузка документов';
      case 3:
        return 'Личная информация';
      case 4:
        return 'Цель поездки';
      case 5:
        return 'История визы';
      case 6:
        return 'Контактная информация';
      case 7:
        return 'Информация о семье';
      case 8:
        return 'Образование и работа';
      case 9:
        return 'История поездок';
      default:
        return 'Анкета на визу';
    }
  };

  // Determine which form component to render based on the current step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Step1_Welcome
            ref={step1Ref}
            initialValues={{ visaDestination: formData.visaDestination }}
            onSubmit={handleStep1Submit}
          />
        );
      case 2:
        return (
          <Step2_DocumentUpload
            ref={step2Ref}
            initialValues={{
              surname: formData.surname,
              name: formData.name,
              dateOfBirth: formData.dateOfBirth,
              citizenship: formData.citizenship,
              passportNumber: formData.passportNumber,
              passportIssueDate: formData.passportIssueDate,
              passportExpiryDate: formData.passportExpiryDate,
              iin: formData.iin,
              idNumber: formData.idNumber,
            }}
            onSubmit={handleStep2Submit}
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
            deployedMode={isDeployedEnvironment}
          />
        );
      case 3:
        return (
          <Step3_PersonalInfo
            ref={step3Ref}
            initialValues={{
              fullNameCyrillic: formData.fullNameCyrillic,
              hasOtherNames: formData.hasOtherNames,
              otherNames: formData.otherNames,
              gender: formData.gender,
              maritalStatus: formData.maritalStatus,
              cityOfBirth: formData.cityOfBirth,
              countryOfBirth: formData.countryOfBirth,
              hasOtherCitizenship: formData.hasOtherCitizenship,
              otherCitizenship: formData.otherCitizenship,
              isPermanentResidentOtherCountry: formData.isPermanentResidentOtherCountry,
              permanentResidenceCountry: formData.permanentResidenceCountry,
              nationality: formData.nationality,
              hasSSN: formData.hasSSN,
              ssn: formData.ssn,
              hasTaxpayerId: formData.hasTaxpayerId,
              taxpayerId: formData.taxpayerId,
            }}
            onSubmit={handleStep3Submit}
          />
        );
      case 4:
        return (
          <Step4_TravelPurpose
            ref={step4Ref}
            initialValues={{
              travelPurpose: formData.travelPurpose || '',
              hasOwnTravelPurpose: formData.hasOwnTravelPurpose || false,
              travelPurposeDescription: formData.travelPurposeDescription || '',
              departureDate: formData.departureDate || '',
              returnDate: formData.returnDate || '',
              destination: formData.destination || '',
              hasInvitation: formData.hasInvitation || false,
              invitationFile: formData.invitationFile || '',
              travelWithOthers: formData.travelWithOthers || false,
              travelAsGroup: formData.travelAsGroup,
              groupName: formData.groupName,
              companions: formData.companions || [],
            }}
            updateForm={(values) => {
              updateFormData({...formData, ...values});
            }}
            onSubmit={handleStep4Submit}
          />
        );
      case 5:
        return (
          <Step5_VisaHistory
            ref={step5Ref}
            initialValues={{
              hasBeenToUSA: formData.hasBeenToUSA || false,
              hasUSVisa: formData.hasUSVisa || false,
              lastVisaDate: formData.lastVisaDate,
              visaNumber: formData.visaNumber,
              isSameVisaType: formData.isSameVisaType,
              isSameCountry: formData.isSameCountry,
              hasVisaRejections: formData.hasVisaRejections || false,
              rejectionVisaType: formData.rejectionVisaType,
              rejectionDate: formData.rejectionDate,
              visaRejections: formData.visaRejections || [],
              hasPreviousDS160: formData.hasPreviousDS160 || false,
              previousDS160File: formData.previousDS160File || '',
            }}
            onSubmit={handleStep5Submit}
          />
        );
      case 6:
        return (
          <Step6_ContactInfo
            ref={step6Ref}
            initialValues={{
              address: formData.address || '',
              city: formData.city || '',
              stateProvince: formData.stateProvince || '',
              country: String(formData.country || ''),
              zipCode: formData.zipCode || '',
              phone: formData.phone || '',
              email: formData.email || '',
              socialMediaLinks: formData.socialMediaLinks || [],
            }}
            onSubmit={handleStep6Submit}
          />
        );
      case 7:
        return (
          <Step7_FamilyInfo
            ref={step7Ref}
            initialValues={{
              hasSpouse: formData.hasSpouse || false,
              spouseFullName: formData.spouseFullName || '',
              spouseDateOfBirth: formData.spouseDateOfBirth || '',
              spouseCitizenship: formData.spouseCitizenship || '',
              wasSpouseInUSA: formData.wasSpouseInUSA || false,
              spouseUSAEntryDate: formData.spouseUSAEntryDate || '',
              spouseUSAStayDuration: formData.spouseUSAStayDuration || '',
              spouseUSAStayDurationType: formData.spouseUSAStayDurationType || '',
              fatherSurname: formData.fatherSurname || '',
              fatherName: formData.fatherName || '',
              fatherDateOfBirth: formData.fatherDateOfBirth,
              isFatherDateOfBirthUnknown: formData.isFatherDateOfBirthUnknown || false,
              isFatherInUSA: formData.isFatherInUSA || false,
              fatherUSAReason: formData.fatherUSAReason,
              motherSurname: formData.motherSurname || '',
              motherName: formData.motherName || '',
              motherDateOfBirth: formData.motherDateOfBirth,
              isMotherDateOfBirthUnknown: formData.isMotherDateOfBirthUnknown || false,
              isMotherInUSA: formData.isMotherInUSA || false,
              motherUSAReason: formData.motherUSAReason,
              hasRelativesInUSA: formData.hasRelativesInUSA || false,
              relatives: formData.relatives || [],
            }}
            onSubmit={handleStep7Submit}
          />
        );
      case 8:
        return (
          <Step8_EducationWork
            ref={step8Ref}
            initialValues={{
              occupation: formData.occupation || '',
              educationLocation: formData.educationLocation || '',
              isCurrentStudent: formData.isCurrentStudent || false,
              hasJob: formData.hasJob || false,
              hasBusiness: formData.hasBusiness || false,
              // Employment fields
              companyName: formData.companyName,
              position: formData.position,
              workAddress: formData.workAddress,
              workPhone: formData.workPhone,
              workExperience: formData.workExperience,
              income: formData.income,
              // Student fields
              universityName: formData.universityName,
              universityAddress: formData.universityAddress,
              faculty: formData.faculty,
              startDate: formData.startDate,
              endDate: formData.endDate,
              // Business fields
              businessType: formData.businessType,
              businessName: formData.businessName,
              businessRegistrationType: formData.businessRegistrationType,
              businessRegistrationNumber: formData.businessRegistrationNumber,
              businessRegistrationDate: formData.businessRegistrationDate,
              businessActivity: formData.businessActivity,
              monthlyBusinessIncome: formData.monthlyBusinessIncome,
              hasEmployees: formData.hasEmployees || false,
              employeeCount: formData.employeeCount,
              businessStatus: formData.businessStatus,
              businessAddress: formData.businessAddress,
              businessWebsite: formData.businessWebsite,
              hasInternationalClients: formData.hasInternationalClients || false,
              hasPermanentContracts: formData.hasPermanentContracts || false,
              paysTaxes: formData.paysTaxes || false,
              businessExperienceYears: formData.businessExperienceYears,
              hasBankStatements: formData.hasBankStatements || false,
              yearlyIncome: formData.yearlyIncome,
              hasOffice: formData.hasOffice || false,
              officeAddress: formData.officeAddress,
            }}
            updateForm={(values) => {
              updateFormData({...formData, ...values});
            }}
            onSubmit={handleStep8Submit}
          />
        );
      case 9:
        return (
          <Step9_TravelHistory
            ref={step9Ref}
            initialValues={{
              visitedCountries: formData.visitedCountries || [],
            }}
            onSubmit={handleStep9Submit}
          />
        );
      default:
        return (
          <div className="text-center p-8">
            <h2 className="text-xl font-semibold">Шаг в разработке</h2>
            <p className="text-gray-600 mt-2">Этот раздел анкеты пока находится в разработке.</p>
            <button
              className="btn-primary mt-4"
              onClick={handleNext}
            >
              Продолжить
            </button>
          </div>
        );
    }
  };

  // Load user data and form state on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        // Detect if we're running in a deployed environment
        const isDeployed = typeof window !== 'undefined' && 
          (window.location.hostname !== 'localhost' && 
           !window.location.hostname.includes('127.0.0.1'));
        setIsDeployedEnvironment(isDeployed);
        console.log('Running in deployed environment:', isDeployed);

        // Check if localStorage is available
        if (!isLocalStorageAvailable()) {
          setErrorMessage('Local storage is not available. Please enable cookies and local storage in your browser.');
          setIsLoading(false);
          return;
        }

        // Get or create agent ID
        const urlAgentId = typeof router.query.agent_id === 'string' ? router.query.agent_id : undefined;
        const currentAgentId = getOrCreateAgentId(urlAgentId);
        setAgentId(currentAgentId);


        // Test Supabase connection first
        const connectionTest = await testSupabaseConnection();
        if (!connectionTest.success) {
          console.error('Supabase connection failed:', connectionTest.error);
          setErrorMessage('Ошибка подключения к базе данных. Проверьте настройки Supabase.');
          return;
        }

        // Check if table needs to be created
        if (connectionTest.needsTableCreation) {
          console.warn('Table visa_applications does not exist. Please create it in Supabase.');
          setErrorMessage('Таблица базы данных не найдена. Обратитесь к администратору.');
          return;
        }

        // Get or create user data
        const { data, error, isNewUser: newUser } = await getOrCreateUserData(currentAgentId);

        if (error) {
          console.error('Error getting/creating user data:', error);
          setErrorMessage('Не удалось загрузить данные пользователя.');
          return;
        }

        if (data) {
          // Check if form is completed
          if (data.whatsapp_redirected) {
            setIsFormCompleted(true);
            return;
          }

          // Load existing form data and step
          if (data.form_data && Object.keys(data.form_data).length > 0) {
            setFormData(data.form_data as VisaFormData);
          }

          // Set step from database or localStorage
          const dbStep = data.step_status || 1;
          const localStep = getCurrentStep();
          const currentStep = Math.max(dbStep, localStep);

          setStep(currentStep);
          setCurrentStep(currentStep); // Update localStorage

          if (data.uploaded_files) {
            setUploadedFiles(data.uploaded_files);
          }

          setIsNewUser(newUser);
        }

      } catch (error) {
        console.error('Failed to initialize user session:', error);
        setErrorMessage('Не удалось инициализировать сессию пользователя.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [router.query.agent_id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <p className="ml-3 text-gray-700">Загрузка данных...</p>
      </div>
    );
  }

  // Show Thank You page if form is completed
  if (isFormCompleted) {
    return <ThankYouPage agentId={agentId} userPhone={formData.phone} />;
  }

  return (
    <>
      <Head>
        <title>Анкета на визу - {getStepTitle()}</title>
        <meta name="description" content="Заполните анкету для получения визы" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        {/* Debug info - remove in production */}
        {agentId && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded mb-4 text-sm">
            <strong>номер заявки:</strong> {agentId}
            {isAutoSaving && (
              <span className="ml-4 text-orange-600">
                <span className="animate-pulse">●</span> Сохранение...
              </span>
            )}
            {lastSaved && !isAutoSaving && (
              <span className="ml-4 text-green-600">
                ✓ Сохранено: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errorMessage}
          </div>
        )}

        <StepWrapper
          title={getStepTitle()}
          step={step}
          totalSteps={totalSteps}
          onNext={handleNext}
          onPrev={handlePrev}
          onSubmitForm={getCurrentStepSubmitFunction()}
          canGoNext={true}
          isFormValid={getCurrentStepFormValidity()}
        >
          {renderStepContent()}
        </StepWrapper>
      </main>
    </>
  );
}