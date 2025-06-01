// Form field types
export interface VisaFormData {
  // Step 1
  visaDestination: string;
  otherVisaDestination?: string;

  // Step 2
  surname: string;
  name: string;
  dateOfBirth: string;
  citizenship: string;
  passportNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  iin: string;
  idNumber: string;

  // Step 3
  fullNameCyrillic: string;
  hasOtherNames: boolean;
  otherNames?: string;
  gender: string;
  maritalStatus: string;
  cityOfBirth: string;
  countryOfBirth: string;
  hasOtherCitizenship: boolean;
  otherCitizenship?: string;
  isPermanentResidentOtherCountry: boolean;
  permanentResidenceCountry?: string;
  nationality: string;
  hasSSN: boolean;
  ssn?: string;
  hasTaxpayerId: boolean;
  taxpayerId?: string;

  // Step 4
  travelPurpose?: string;
  hasOwnTravelPurpose?: boolean;
  travelPurposeDescription?: string;
  departureDate?: string;
  returnDate?: string;
  destination?: string;
  hasInvitation?: boolean;
  invitationFile?: string;
  travelWithOthers?: boolean;
  travelAsGroup?: boolean;
  groupName?: string;
  companions?: Array<{ name: string; relationship: string }>;

  // Step 5
  hasBeenToUSA?: boolean;
  visitYear?: number;
  visitPurpose?: string;
  visitDuration?: string;
  visitDurationType?: string;
  visitVisaType?: string;
  hasUSVisa?: boolean;
  lastVisaDate?: string;
  visaNumber?: string;
  isSameVisaType?: boolean;
  isSameCountry?: boolean;
  hasVisaRejections?: boolean;
  rejectionVisaType?: string;
  rejectionDate?: string;
  visaRejections?: Array<{ visaType: string; rejectionDate: string; reason?: string }>;
  hasPreviousDS160?: boolean;
  previousDS160File?: string;

  // Step 6
  address?: string;
  city?: string;
  stateProvince?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  socialMediaLinks?: string[];

  // Step 7
  hasSpouse?: boolean;
  spouseFullName?: string;
  spouseDateOfBirth?: string;
  spouseCitizenship?: string;
  wasSpouseInUSA?: boolean;
  spouseUSAEntryDate?: string;
  spouseUSAStayDuration?: string;
  spouseUSAStayDurationType?: string;
  fatherSurname?: string;
  fatherName?: string;
  fatherDateOfBirth?: string;
  isFatherDateOfBirthUnknown?: boolean;
  isFatherInUSA?: boolean;
  fatherUSAReason?: string;
  motherSurname?: string;
  motherName?: string;
  motherDateOfBirth?: string;
  isMotherDateOfBirthUnknown?: boolean;
  isMotherInUSA?: boolean;
  motherUSAReason?: string;
  hasRelativesInUSA?: boolean;
  relatives?: Array<{ name: string; relationship: string }>;

  // Step 8
  occupation?: string;
  educationLocation?: string;
  isCurrentStudent?: boolean;
  hasJob?: boolean;
  hasBusiness?: boolean;
  // Employment fields
  companyName?: string;
  position?: string;
  workAddress?: string;
  workPhone?: string;
  workExperience?: string;
  income?: string;
  // Student fields
  universityName?: string;
  universityAddress?: string;
  faculty?: string;
  startDate?: string;
  endDate?: string;
  // Business/IP/Self-employed fields
  businessType?: string;
  businessName?: string;
  businessRegistrationType?: string;
  businessRegistrationNumber?: string;
  businessRegistrationDate?: string;
  businessActivity?: string;
  monthlyBusinessIncome?: string;
  hasEmployees?: boolean;
  employeeCount?: number;
  businessStatus?: string;
  businessAddress?: string;
  businessWebsite?: string;
  hasInternationalClients?: boolean;
  hasPermanentContracts?: boolean;
  paysTaxes?: boolean;
  businessExperienceYears?: number;
  hasBankStatements?: boolean;
  yearlyIncome?: string;
  hasOffice?: boolean;
  officeAddress?: string;

  // Step 9
  visitedCountries?: string[];

  // Any additional fields
  [key: string]: string | boolean | number | Array<unknown> | object | undefined;
}

// Step-specific interfaces
export interface Step1Data {
  visaDestination: string;
  otherVisaDestination?: string;
  [key: string]: string | boolean | number | Array<unknown> | object | undefined;
}

export interface Step2Data {
  surname: string;
  name: string;
  dateOfBirth: string;
  citizenship: string;
  passportNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  iin: string;
  idNumber: string;
  [key: string]: string | boolean | number | Array<unknown> | object | undefined;
}

export interface Step3Data {
  fullNameCyrillic: string;
  hasOtherNames: boolean;
  otherNames?: string;
  gender: string;
  maritalStatus: string;
  cityOfBirth: string;
  countryOfBirth: string;
  hasOtherCitizenship: boolean;
  otherCitizenship?: string;
  isPermanentResidentOtherCountry: boolean;
  permanentResidenceCountry?: string;
  nationality: string;
  hasSSN: boolean;
  ssn?: string;
  hasTaxpayerId: boolean;
  taxpayerId?: string;
  [key: string]: string | boolean | number | Array<unknown> | object | undefined;
}

export interface Step4Data {
  travelPurpose: string;
  hasOwnTravelPurpose?: boolean;
  travelPurposeDescription?: string;
  departureDate?: string;
  returnDate?: string;
  destination?: string;
  hasInvitation?: boolean;
  invitationFile?: string;
  travelWithOthers: boolean;
  travelAsGroup?: boolean;
  groupName?: string;
  companions?: Array<{ name: string; relationship: string }>;
  [key: string]: string | boolean | number | Array<unknown> | object | undefined;
}

export interface Step5Data {
  hasBeenToUSA: boolean;
  hasUSVisa: boolean;
  lastVisaDate?: string;
  visaNumber?: string;
  isSameVisaType?: boolean;
  isSameCountry?: boolean;
  hasVisaRejections: boolean;
  rejectionVisaType?: string;
  rejectionDate?: string;
  visaRejections?: Array<{ visaType: string; rejectionDate: string; reason?: string }>;
  hasPreviousDS160?: boolean;
  previousDS160File?: string;
  [key: string]: string | boolean | number | Array<unknown> | object | undefined;
}

export interface Step6Data {
  address: string;
  city: string;
  stateProvince?: string;
  country: string;
  zipCode: string;
  phone: string;
  email: string;
  socialMediaLinks: string[];
  [key: string]: string | boolean | number | Array<unknown> | object | undefined;
}

export interface Step7Data {
  hasSpouse?: boolean;
  spouseFullName?: string;
  spouseDateOfBirth?: string;
  spouseCitizenship?: string;
  wasSpouseInUSA?: boolean;
  spouseUSAEntryDate?: string;
  spouseUSAStayDuration?: string;
  spouseUSAStayDurationType?: string;
  fatherSurname: string;
  fatherName: string;
  fatherDateOfBirth?: string;
  isFatherDateOfBirthUnknown: boolean;
  isFatherInUSA: boolean;
  fatherUSAReason?: string;
  motherSurname: string;
  motherName: string;
  motherDateOfBirth?: string;
  isMotherDateOfBirthUnknown: boolean;
  isMotherInUSA: boolean;
  motherUSAReason?: string;
  hasRelativesInUSA: boolean;
  relatives?: Array<{ name: string; relationship: string }>;
  [key: string]: string | boolean | number | Array<unknown> | object | undefined;
}

export interface Step8Data {
  occupation: string;
  educationLocation?: string;
  isCurrentStudent?: boolean;
  hasJob?: boolean;
  hasBusiness?: boolean;
  // Employment fields
  companyName?: string;
  position?: string;
  workAddress?: string;
  workPhone?: string;
  workExperience?: string;
  income?: string;
  // Student fields
  universityName?: string;
  universityAddress?: string;
  faculty?: string;
  startDate?: string;
  endDate?: string;
  // Business/IP/Self-employed fields
  businessType?: string;
  businessName?: string;
  businessRegistrationType?: string;
  businessRegistrationNumber?: string;
  businessRegistrationDate?: string;
  businessActivity?: string;
  monthlyBusinessIncome?: string;
  hasEmployees?: boolean;
  employeeCount?: number;
  businessStatus?: string;
  businessAddress?: string;
  businessWebsite?: string;
  hasInternationalClients?: boolean;
  hasPermanentContracts?: boolean;
  paysTaxes?: boolean;
  businessExperienceYears?: number;
  hasBankStatements?: boolean;
  yearlyIncome?: string;
  hasOffice?: boolean;
  officeAddress?: string;
  [key: string]: string | boolean | number | Array<unknown> | object | undefined;
}

export interface Step9Data {
  visitedCountries: string[];
  [key: string]: string | boolean | number | Array<unknown> | object | undefined;
}