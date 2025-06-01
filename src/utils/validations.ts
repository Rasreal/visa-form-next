import * as Yup from 'yup';

// Basic field validations
export const validatePhone = (phone: string) =>
  /^\+7\s?\d{3}\s?\d{3}\s?\d{2}\s?\d{2}$/.test(phone);

export const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validateIIN = (iin: string) =>
  /^\d{12}$/.test(iin);

export const validateIDNumber = (idNumber: string) =>
  /^\d{9}$/.test(idNumber);

// Yup validation schemas for each step
export const step1Schema = Yup.object({
  visaDestination: Yup.string()
    .required('Выберите страну для получения визы')
    .nullable(),
  otherVisaDestination: Yup.string().when('visaDestination', {
    is: 'other',
    then: (schema) => schema.required('Укажите страну'),
    otherwise: (schema) => schema.nullable(),
  }),
});

export const step2Schema = Yup.object({
  surname: Yup.string().required('Фамилия обязательна'),
  name: Yup.string().required('Имя обязательно'),
  dateOfBirth: Yup.date().required('Дата рождения обязательна'),
  citizenship: Yup.string().required('Гражданство обязательно'),
  passportNumber: Yup.string(),
  passportIssueDate: Yup.date().required('Дата выдачи паспорта обязательна'),
  passportExpiryDate: Yup.date().required('Дата окончания паспорта обязательна'),
  iin: Yup.string()
    .matches(/^\d{12}$/, 'ИИН должен содержать 12 цифр')
    .required('ИИН обязателен'),
  idNumber: Yup.string()
    .matches(/^\d{9}$/, 'Номер удостоверения должен содержать 9 цифр'),
}).test('passport-or-id', 'Необходимо указать номер паспорта или номер удостоверения личности', function(values) {
  const { passportNumber, idNumber } = values || {};
  return Boolean((passportNumber && passportNumber.trim() !== '') || (idNumber && idNumber.trim() !== ''));
});

export const step3Schema = Yup.object({
  fullNameCyrillic: Yup.string().required('ФИО на кириллице обязательно'),
  hasOtherNames: Yup.boolean().required(),
  otherNames: Yup.string().when('hasOtherNames', {
    is: true,
    then: (schema) => schema.required('Необходимо указать другие имена'),
    otherwise: (schema) => schema,
  }),
  gender: Yup.string().oneOf(['male', 'female']).required('Пол обязателен'),
  maritalStatus: Yup.string().required('Семейное положение обязательно'),
  cityOfBirth: Yup.string().required('Город рождения обязателен'),
  countryOfBirth: Yup.string().required('Страна рождения обязательна'),
  hasOtherCitizenship: Yup.boolean().required(),
  otherCitizenship: Yup.string().when('hasOtherCitizenship', {
    is: true,
    then: (schema) => schema.required('Необходимо указать другое гражданство'),
    otherwise: (schema) => schema,
  }),
  isPermanentResidentOtherCountry: Yup.boolean().required(),
  permanentResidenceCountry: Yup.string().when('isPermanentResidentOtherCountry', {
    is: true,
    then: (schema) => schema.required('Необходимо указать страну постоянного проживания'),
    otherwise: (schema) => schema,
  }),
  nationality: Yup.string().required('Национальность обязательна'),
  hasSSN: Yup.boolean().required(),
  ssn: Yup.string().when('hasSSN', {
    is: true,
    then: (schema) => schema.required('Необходимо указать SSN'),
    otherwise: (schema) => schema,
  }),
  hasTaxpayerId: Yup.boolean().required(),
  taxpayerId: Yup.string().when('hasTaxpayerId', {
    is: true,
    then: (schema) => schema.required('Необходимо указать Taxpayer ID'),
    otherwise: (schema) => schema,
  }),
});

export const step4Schema = Yup.object({
  travelPurpose: Yup.string()
    .oneOf(['tourism', 'business', 'medical', 'study', 'visa', 'other'])
    .required('Цель поездки обязательна'),
  hasOwnTravelPurpose: Yup.boolean(),
  travelPurposeDescription: Yup.string().when('hasOwnTravelPurpose', {
    is: true,
    then: (schema) => schema.required('Описание цели поездки обязательно'),
    otherwise: (schema) => schema,
  }),
  departureDate: Yup.date().when('hasOwnTravelPurpose', {
    is: true,
    then: (schema) => schema.required('Дата вылета обязательна'),
    otherwise: (schema) => schema,
  }),
  returnDate: Yup.date().when('hasOwnTravelPurpose', {
    is: true,
    then: (schema) => schema.required('Дата возвращения обязательна'),
    otherwise: (schema) => schema,
  }),
  destination: Yup.string().when('hasOwnTravelPurpose', {
    is: true,
    then: (schema) => schema.required('Место назначения обязательно'),
    otherwise: (schema) => schema,
  }),
  hasInvitation: Yup.boolean(),
  invitationFile: Yup.string(),
  travelWithOthers: Yup.boolean(),
  travelAsGroup: Yup.boolean(),
  groupName: Yup.string(),
  companions: Yup.array(),
});

export const step5Schema = Yup.object({
  hasBeenToUSA: Yup.boolean(),
  visitYear: Yup.number().when('hasBeenToUSA', {
    is: true,
    then: (schema) => schema.required('Укажите год поездки')
      .min(1900, 'Год должен быть не меньше 1900')
      .max(new Date().getFullYear(), 'Год не может быть в будущем'),
    otherwise: (schema) => schema,
  }),
  visitPurpose: Yup.string().when('hasBeenToUSA', {
    is: true,
    then: (schema) => schema.required('Укажите причину поездки'),
    otherwise: (schema) => schema,
  }),
  visitDuration: Yup.string().when('hasBeenToUSA', {
    is: true,
    then: (schema) => schema.required('Укажите длительность пребывания'),
    otherwise: (schema) => schema,
  }),
  visitDurationType: Yup.string().when('hasBeenToUSA', {
    is: true,
    then: (schema) => schema.required('Укажите тип длительности'),
    otherwise: (schema) => schema,
  }),
  visitVisaType: Yup.string(),
  hasUSVisa: Yup.boolean(),
  lastVisaDate: Yup.date(),
  visaNumber: Yup.string(),
  isSameVisaType: Yup.boolean(),
  isSameCountry: Yup.boolean(),
  hasVisaRejections: Yup.boolean(),
  rejectionVisaType: Yup.string(),
  rejectionDate: Yup.date(),
  visaRejections: Yup.array().of(
    Yup.object({
      visaType: Yup.string(),
      rejectionDate: Yup.date(),
      reason: Yup.string(),
    })
  ),
  hasPreviousDS160: Yup.boolean(),
  previousDS160File: Yup.string(),
});

export const step6Schema = Yup.object({
  address: Yup.string().required('Адрес обязателен'),
  city: Yup.string().required('Город обязателен'),
  stateProvince: Yup.string(),
  country: Yup.string().required('Страна обязательна'),
  zipCode: Yup.string().required('Индекс обязателен'),
  phone: Yup.string()
    .matches(/^\+7\s\d{3}\s\d{3}\s\d{2}\s\d{2}$/, 'Формат: +7 XXX XXX XX XX')
    .required('Телефон обязателен'),
  email: Yup.string()
    .email('Неверный формат email'),
  socialMediaLinks: Yup.array()
    .of(Yup.string().url('Неверный формат ссылки')),
});

export const step7Schema = Yup.object({
  hasSpouse: Yup.boolean(),
  spouseFullName: Yup.string().when('hasSpouse', {
    is: true,
    then: (schema) => schema.required('ФИО супруга(и) обязательно'),
    otherwise: (schema) => schema,
  }),
  spouseDateOfBirth: Yup.date().when('hasSpouse', {
    is: true,
    then: (schema) => schema.required('Дата рождения супруга(и) обязательна'),
    otherwise: (schema) => schema,
  }),
  spouseCitizenship: Yup.string().when('hasSpouse', {
    is: true,
    then: (schema) => schema.required('Гражданство супруга(и) обязательно'),
    otherwise: (schema) => schema,
  }),
  wasSpouseInUSA: Yup.boolean().when('hasSpouse', {
    is: true,
    then: (schema) => schema.required(),
    otherwise: (schema) => schema,
  }),
  spouseUSAEntryDate: Yup.date().when(['hasSpouse', 'wasSpouseInUSA'], {
    is: (hasSpouse: boolean, wasSpouseInUSA: boolean) => hasSpouse && wasSpouseInUSA,
    then: (schema) => schema.required('Дата прибытия в США обязательна'),
    otherwise: (schema) => schema,
  }),
  spouseUSAStayDuration: Yup.string().when(['hasSpouse', 'wasSpouseInUSA'], {
    is: (hasSpouse: boolean, wasSpouseInUSA: boolean) => hasSpouse && wasSpouseInUSA,
    then: (schema) => schema.required('Продолжительность пребывания обязательна'),
    otherwise: (schema) => schema,
  }),
  spouseUSAStayDurationType: Yup.string().when(['hasSpouse', 'wasSpouseInUSA'], {
    is: (hasSpouse: boolean, wasSpouseInUSA: boolean) => hasSpouse && wasSpouseInUSA,
    then: (schema) => schema.required('Тип продолжительности обязателен'),
    otherwise: (schema) => schema,
  }),
  fatherSurname: Yup.string(),
  fatherName: Yup.string(),
  fatherDateOfBirth: Yup.date(),
  isFatherDateOfBirthUnknown: Yup.boolean(),
  isFatherInUSA: Yup.boolean(),
  fatherUSAReason: Yup.string(),
  motherSurname: Yup.string(),
  motherName: Yup.string(),
  motherDateOfBirth: Yup.date(),
  isMotherDateOfBirthUnknown: Yup.boolean(),
  isMotherInUSA: Yup.boolean(),
  motherUSAReason: Yup.string(),
  hasRelativesInUSA: Yup.boolean(),
  relatives: Yup.array(),
});

export const step8Schema = Yup.object({
  occupation: Yup.string()
    .oneOf(['employed', 'student', 'unemployed', 'business_owner', 'individual_entrepreneur', 'self_employed', 'freelancer'])
    .required('Род занятий обязателен'),
  educationLocation: Yup.string().required('Укажите где вы получали образование'),
  isCurrentStudent: Yup.boolean(),
  hasJob: Yup.boolean(),
  hasBusiness: Yup.boolean(),

  // Common fields for all employment types
  companyName: Yup.string().when('hasJob', {
    is: true,
    then: (schema) => schema.required('Название компании/организации обязательно'),
    otherwise: (schema) => schema,
  }),
  workAddress: Yup.string().when('hasJob', {
    is: true,
    then: (schema) => schema.required('Адрес работы обязателен'),
    otherwise: (schema) => schema,
  }),
  workExperience: Yup.string().when('hasJob', {
    is: true,
    then: (schema) => schema.required('Стаж работы обязателен'),
    otherwise: (schema) => schema,
  }),
  income: Yup.string().when('hasJob', {
    is: true,
    then: (schema) => schema.required('Ежемесячный доход обязателен'),
    otherwise: (schema) => schema,
  }),

  // Employment-specific fields
  position: Yup.string().when(['occupation', 'hasJob'], {
    is: (occupation: string, hasJob: boolean) => occupation === 'employed' || hasJob,
    then: (schema) => schema.required('Должность обязательна'),
    otherwise: (schema) => schema,
  }),
  workPhone: Yup.string().when(['occupation', 'hasJob'], {
    is: (occupation: string, hasJob: boolean) => occupation === 'employed' || hasJob,
    then: (schema) => schema.required('Телефон работы обязателен'),
    otherwise: (schema) => schema,
  }),

  // Student fields
  universityName: Yup.string().when(['occupation', 'isCurrentStudent'], {
    is: (occupation: string, isCurrentStudent: boolean) => occupation === 'student' || isCurrentStudent,
    then: (schema) => schema.required('Название университета обязательно'),
    otherwise: (schema) => schema,
  }),
  universityAddress: Yup.string().when(['occupation', 'isCurrentStudent'], {
    is: (occupation: string, isCurrentStudent: boolean) => occupation === 'student' || isCurrentStudent,
    then: (schema) => schema.required('Адрес университета обязателен'),
    otherwise: (schema) => schema,
  }),
  faculty: Yup.string().when(['occupation', 'isCurrentStudent'], {
    is: (occupation: string, isCurrentStudent: boolean) => occupation === 'student' || isCurrentStudent,
    then: (schema) => schema.required('Факультет обязателен'),
    otherwise: (schema) => schema,
  }),
  startDate: Yup.date().when(['occupation', 'isCurrentStudent'], {
    is: (occupation: string, isCurrentStudent: boolean) => occupation === 'student' || isCurrentStudent,
    then: (schema) => schema.required('Дата начала обучения обязательна'),
    otherwise: (schema) => schema,
  }),
  endDate: Yup.date().when(['occupation', 'isCurrentStudent'], {
    is: (occupation: string, isCurrentStudent: boolean) => occupation === 'student' || isCurrentStudent,
    then: (schema) => schema.required('Дата окончания обучения обязательна'),
    otherwise: (schema) => schema,
  }),

  // Business fields
  businessType: Yup.string().when(['occupation', 'hasBusiness'], {
    is: (occupation: string, hasBusiness: boolean) => 
      ['business_owner', 'individual_entrepreneur', 'self_employed', 'freelancer'].includes(occupation) || hasBusiness,
    then: (schema) => schema.required('Тип деятельности обязателен'),
    otherwise: (schema) => schema,
  }),
  businessName: Yup.string().when(['occupation', 'hasBusiness'], {
    is: (occupation: string, hasBusiness: boolean) => 
      ['business_owner', 'individual_entrepreneur'].includes(occupation) || hasBusiness,
    then: (schema) => schema.required('Название бизнеса/ИП обязательно'),
    otherwise: (schema) => schema,
  }),
  businessRegistrationType: Yup.string().when(['occupation', 'hasBusiness'], {
    is: (occupation: string, hasBusiness: boolean) => 
      ['business_owner', 'individual_entrepreneur'].includes(occupation) || hasBusiness,
    then: (schema) => schema.required('Форма регистрации обязательна'),
    otherwise: (schema) => schema,
  }),
  businessRegistrationNumber: Yup.string().when(['occupation', 'hasBusiness'], {
    is: (occupation: string, hasBusiness: boolean) => 
      ['business_owner', 'individual_entrepreneur'].includes(occupation) || hasBusiness,
    then: (schema) => schema.required('Регистрационный номер обязателен'),
    otherwise: (schema) => schema,
  }),
  businessRegistrationDate: Yup.date().when(['occupation', 'hasBusiness'], {
    is: (occupation: string, hasBusiness: boolean) => 
      ['business_owner', 'individual_entrepreneur'].includes(occupation) || hasBusiness,
    then: (schema) => schema.required('Дата регистрации обязательна'),
    otherwise: (schema) => schema,
  }),
  businessActivity: Yup.string().when(['occupation', 'hasBusiness'], {
    is: (occupation: string, hasBusiness: boolean) => 
      ['business_owner', 'individual_entrepreneur', 'self_employed', 'freelancer'].includes(occupation) || hasBusiness,
    then: (schema) => schema.required('Основной вид деятельности обязателен'),
    otherwise: (schema) => schema,
  }),
  monthlyBusinessIncome: Yup.string().when(['occupation', 'hasBusiness'], {
    is: (occupation: string, hasBusiness: boolean) => 
      ['business_owner', 'individual_entrepreneur', 'self_employed', 'freelancer'].includes(occupation) || hasBusiness,
    then: (schema) => schema.required('Среднемесячный доход обязателен'),
    otherwise: (schema) => schema,
  }),
  hasEmployees: Yup.boolean().when('occupation', {
    is: (value: string) => ['business_owner', 'individual_entrepreneur'].includes(value),
    then: (schema) => schema.required(),
    otherwise: (schema) => schema,
  }),
  employeeCount: Yup.number().when(['occupation', 'hasEmployees'], {
    is: (occupation: string, hasEmployees: boolean) =>
      ['business_owner', 'individual_entrepreneur'].includes(occupation) && hasEmployees,
    then: (schema) => schema.min(1, 'Количество сотрудников должно быть больше 0').required('Количество сотрудников обязательно'),
    otherwise: (schema) => schema,
  }),
  businessStatus: Yup.string().when('occupation', {
    is: (value: string) => ['business_owner', 'individual_entrepreneur'].includes(value),
    then: (schema) => schema.required('Статус в бизнесе обязателен'),
    otherwise: (schema) => schema,
  }),
  businessAddress: Yup.string().when('occupation', {
    is: (value: string) => ['business_owner', 'individual_entrepreneur'].includes(value),
    then: (schema) => schema.required('Адрес регистрации бизнеса обязателен'),
    otherwise: (schema) => schema,
  }),
  businessWebsite: Yup.string().when('occupation', {
    is: (value: string) => ['business_owner', 'individual_entrepreneur', 'self_employed', 'freelancer'].includes(value),
    then: (schema) => schema.url('Неверный формат URL'),
    otherwise: (schema) => schema,
  }),
  hasInternationalClients: Yup.boolean().when('occupation', {
    is: (value: string) => ['business_owner', 'individual_entrepreneur', 'self_employed', 'freelancer'].includes(value),
    then: (schema) => schema.required(),
    otherwise: (schema) => schema,
  }),
  hasPermanentContracts: Yup.boolean().when('occupation', {
    is: (value: string) => ['business_owner', 'individual_entrepreneur', 'self_employed', 'freelancer'].includes(value),
    then: (schema) => schema.required(),
    otherwise: (schema) => schema,
  }),
  paysTaxes: Yup.boolean().when('occupation', {
    is: (value: string) => ['business_owner', 'individual_entrepreneur', 'self_employed', 'freelancer'].includes(value),
    then: (schema) => schema.required(),
    otherwise: (schema) => schema,
  }),
  businessExperienceYears: Yup.number().when('occupation', {
    is: (value: string) => ['business_owner', 'individual_entrepreneur', 'self_employed', 'freelancer'].includes(value),
    then: (schema) => schema.min(0, 'Опыт не может быть отрицательным').required('Количество лет деятельности обязательно'),
    otherwise: (schema) => schema,
  }),
  hasBankStatements: Yup.boolean().when('occupation', {
    is: (value: string) => ['business_owner', 'individual_entrepreneur', 'self_employed', 'freelancer'].includes(value),
    then: (schema) => schema.required(),
    otherwise: (schema) => schema,
  }),
  yearlyIncome: Yup.string().when('occupation', {
    is: (value: string) => ['business_owner', 'individual_entrepreneur', 'self_employed', 'freelancer'].includes(value),
    then: (schema) => schema.required('Примерный годовой доход обязателен'),
    otherwise: (schema) => schema,
  }),
  hasOffice: Yup.boolean().when('occupation', {
    is: (value: string) => ['business_owner', 'individual_entrepreneur', 'self_employed', 'freelancer'].includes(value),
    then: (schema) => schema.required(),
    otherwise: (schema) => schema,
  }),
  officeAddress: Yup.string().when(['occupation', 'hasOffice'], {
    is: (occupation: string, hasOffice: boolean) =>
      ['business_owner', 'individual_entrepreneur', 'self_employed', 'freelancer'].includes(occupation) && hasOffice,
    then: (schema) => schema.required('Адрес офиса обязателен'),
    otherwise: (schema) => schema,
  }),
});

export const step9Schema = Yup.object({
  visitedCountries: Yup.array()
    .min(1, 'Укажите хотя бы одну страну')
    .required('Список стран обязателен'),
});