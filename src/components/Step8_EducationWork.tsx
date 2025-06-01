import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikProps } from 'formik';
import { step8Schema } from '../utils/validations';
import { Step8Data } from '../utils/types';

interface Step8Props {
  initialValues: Step8Data;
  onSubmit: (values: Step8Data) => void;
  updateForm: (values: Step8Data) => void;
}

export interface Step8Ref {
  submitForm: () => void;
  isValid: boolean;
}

const occupationOptions = [
  { value: '', label: 'Выберите...' },
  { value: 'employed', label: 'Работаю по найму' },
  { value: 'student', label: 'Студент' },
  { value: 'business_owner', label: 'Владелец бизнеса' },
  { value: 'individual_entrepreneur', label: 'Индивидуальный предприниматель (ИП)' },
  { value: 'self_employed', label: 'Самозанятый' },
  { value: 'freelancer', label: 'Фрилансер' },
  { value: 'unemployed', label: 'Безработный' },
];

const businessRegistrationOptions = [
  { value: '', label: 'Выберите...' },
  { value: 'TOO', label: 'ТОО' },
  { value: 'IP', label: 'ИП' },
  { value: 'self_employed', label: 'Самозанятый' },
  { value: 'other', label: 'Другое' },
];

const businessStatusOptions = [
  { value: '', label: 'Выберите...' },
  { value: 'director', label: 'Директор' },
  { value: 'manager', label: 'Управляющий' },
  { value: 'individual', label: 'Индивидуально' },
];

const Step8_EducationWork = forwardRef<Step8Ref, Step8Props>(({ initialValues, onSubmit, updateForm }, ref) => {
  const formikRef = useRef<FormikProps<Step8Data>>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      formikRef.current?.submitForm();
    },
    isValid: isFormValid,
  }));

  // Update the useEffect for validation check in the Step8_EducationWork component
  useEffect(() => {
    // Check if the occupation is set
    const hasOccupation = Boolean(initialValues.occupation && initialValues.occupation !== '');
    
    // Check if education location is filled (required field)
    const hasEducationInfo = Boolean(initialValues.educationLocation && initialValues.educationLocation.trim() !== '');
    
    // Check if student form is complete when user is a student
    const isStudentFormComplete = !initialValues.isCurrentStudent || (
      Boolean(initialValues.universityName) && 
      Boolean(initialValues.universityAddress) && 
      Boolean(initialValues.faculty) && 
      Boolean(initialValues.startDate) && 
      Boolean(initialValues.endDate)
    );
    
    // Form is valid only when all required conditions are met
    const formValid = hasOccupation && hasEducationInfo && isStudentFormComplete;
    
    setIsFormValid(formValid);
  }, [
    initialValues.occupation, 
    initialValues.educationLocation,
    initialValues.isCurrentStudent,
    initialValues.universityName,
    initialValues.universityAddress,
    initialValues.faculty,
    initialValues.startDate,
    initialValues.endDate
  ]);

  const isBusinessOccupation = (occupation: string) =>
    ['business_owner', 'individual_entrepreneur', 'self_employed', 'freelancer'].includes(occupation);

  const isRegisteredBusiness = (occupation: string) =>
    ['business_owner', 'individual_entrepreneur'].includes(occupation);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Образование и деятельность</h2>
      <p className="text-gray-600 mb-6">
        Пожалуйста, предоставьте информацию о вашем текущем занятии, образовании или работе.
      </p>

      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        validationSchema={step8Schema}
        onSubmit={onSubmit}
      >
        {({ values, isValid: _isValid, setFieldValue }) => {

          // Update form validity when values change
          const currentValid = Boolean(values.occupation && values.occupation !== '');
          if (currentValid !== isFormValid) {
            setTimeout(() => {
              updateForm({  ...values });
              setIsFormValid(currentValid);
            }, 0);
          }

          return (
          <Form>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg mb-4">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Информация об образовании</h3>
                
                <div className="mb-4">
                  <label htmlFor="educationLocation" className="block text-gray-700 font-medium mb-2">
                    Где вы получали образование?
                  </label>
                  <Field
                    type="text"
                    id="educationLocation"
                    name="educationLocation"
                    className="form-input"
                    placeholder="Например: Казахстан, Алматы"
                  />
                  <ErrorMessage
                    name="educationLocation"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Field
                      type="checkbox"
                      id="isCurrentStudent"
                      name="isCurrentStudent"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isCurrentStudent" className="ml-2 block text-gray-700 font-medium">
                      Я еще не закончил обучение (текущий студент)
                    </label>
                  </div>
                </div>

                {values.isCurrentStudent && (
                  <div className="p-4 border border-gray-200 rounded-md mb-4">
                    <h4 className="text-md font-medium text-gray-700 mb-3">Информация об учебе</h4>

                    <div className="mb-4">
                      <label htmlFor="universityName" className="block text-gray-700 font-medium mb-2">
                        Название учебного заведения
                      </label>
                      <Field
                        type="text"
                        id="universityName"
                        name="universityName"
                        className="form-input"
                      />
                      <ErrorMessage
                        name="universityName"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="universityAddress" className="block text-gray-700 font-medium mb-2">
                        Адрес учебного заведения
                      </label>
                      <Field
                        type="text"
                        id="universityAddress"
                        name="universityAddress"
                        className="form-input"
                      />
                      <ErrorMessage
                        name="universityAddress"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="faculty" className="block text-gray-700 font-medium mb-2">
                        Факультет / специальность
                      </label>
                      <Field
                        type="text"
                        id="faculty"
                        name="faculty"
                        className="form-input"
                      />
                      <ErrorMessage
                        name="faculty"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="mb-4">
                        <label htmlFor="startDate" className="block text-gray-700 font-medium mb-2">
                          Дата начала обучения
                        </label>
                        <Field
                          type="date"
                          id="startDate"
                          name="startDate"
                          className="form-input"
                        />
                        <ErrorMessage
                          name="startDate"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <div className="mb-4">
                        <label htmlFor="endDate" className="block text-gray-700 font-medium mb-2">
                          Ожидаемая дата окончания
                        </label>
                        <Field
                          type="date"
                          id="endDate"
                          name="endDate"
                          className="form-input"
                        />
                        <ErrorMessage
                          name="endDate"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="occupation" className="block text-gray-700 font-medium mb-2">
                  Какая у вас занятость?
                </label>
                <Field
                  as="select"
                  id="occupation"
                  name="occupation"
                  className="form-input"
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const newValue = e.target.value;
                    setFieldValue('occupation', newValue);
                    
                    // Auto set job and business flags based on occupation
                    if (newValue === 'employed') {
                      setFieldValue('hasJob', true);
                      setFieldValue('hasBusiness', false);
                    } else if (['business_owner', 'individual_entrepreneur', 'self_employed', 'freelancer'].includes(newValue)) {
                      setFieldValue('hasBusiness', true);
                      setFieldValue('hasJob', false);
                    } else if (newValue === 'unemployed') {
                      setFieldValue('hasJob', false);
                      setFieldValue('hasBusiness', false);
                    }
                    
                    updateForm({ ...values, occupation: newValue });
                  }}
                >
                  {occupationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="occupation"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Employment Information Section */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Field
                    type="checkbox"
                    id="hasJob"
                    name="hasJob"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    disabled={values.occupation === 'employed'}
                  />
                  <label htmlFor="hasJob" className="ml-2 block text-gray-700 font-medium">
                    У меня есть работа
                  </label>
                </div>
              </div>

              {(values.occupation === 'employed' || values.hasJob) && (
                <div className="p-4 border border-gray-200 rounded-lg mb-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Информация о работе</h3>

                  <div className="mb-4">
                    <label htmlFor="companyName" className="block text-gray-700 font-medium mb-2">
                      Название компании/организации
                    </label>
                    <Field
                      type="text"
                      id="companyName"
                      name="companyName"
                      className="form-input"
                    />
                    <ErrorMessage
                      name="companyName"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="position" className="block text-gray-700 font-medium mb-2">
                      Должность
                    </label>
                    <Field
                      type="text"
                      id="position"
                      name="position"
                      className="form-input"
                    />
                    <ErrorMessage
                      name="position"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="workAddress" className="block text-gray-700 font-medium mb-2">
                      Адрес работы
                    </label>
                    <Field
                      type="text"
                      id="workAddress"
                      name="workAddress"
                      className="form-input"
                    />
                    <ErrorMessage
                      name="workAddress"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="workPhone" className="block text-gray-700 font-medium mb-2">
                      Телефон работы
                    </label>
                    <Field
                      type="text"
                      id="workPhone"
                      name="workPhone"
                      className="form-input"
                    />
                    <ErrorMessage
                      name="workPhone"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="workExperience" className="block text-gray-700 font-medium mb-2">
                      Как давно работаете
                    </label>
                    <Field
                      type="text"
                      id="workExperience"
                      name="workExperience"
                      className="form-input"
                      placeholder="Например: 3 года"
                    />
                    <ErrorMessage
                      name="workExperience"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="income" className="block text-gray-700 font-medium mb-2">
                      Месячный доход (в тенге)
                    </label>
                    <Field
                      type="text"
                      id="income"
                      name="income"
                      className="form-input"
                      placeholder="Например: 300000"
                    />
                    <ErrorMessage
                      name="income"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Business Section */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Field
                    type="checkbox"
                    id="hasBusiness"
                    name="hasBusiness"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    disabled={isBusinessOccupation(values.occupation)}
                  />
                  <label htmlFor="hasBusiness" className="ml-2 block text-gray-700 font-medium">
                    У меня есть бизнес/предпринимательская деятельность
                  </label>
                </div>
              </div>

              {(isBusinessOccupation(values.occupation) || values.hasBusiness) && (
                <div className="p-4 border border-gray-200 rounded-lg mb-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Информация о бизнесе / предпринимательской деятельности
                  </h3>

                  {/* General Business Information */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-700 mb-3">Общая информация</h4>

                    <div className="mb-4">
                      <label htmlFor="businessActivity" className="block text-gray-700 font-medium mb-2">
                        Основной вид деятельности
                      </label>
                      <Field
                        type="text"
                        id="businessActivity"
                        name="businessActivity"
                        className="form-input"
                        placeholder="Например: Торговля, IT-услуги, консалтинг"
                      />
                      <ErrorMessage
                        name="businessActivity"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="monthlyBusinessIncome" className="block text-gray-700 font-medium mb-2">
                        Среднемесячный доход от бизнеса
                      </label>
                      <Field
                        type="text"
                        id="monthlyBusinessIncome"
                        name="monthlyBusinessIncome"
                        className="form-input"
                        placeholder="Например: 500000 тенге"
                      />
                      <ErrorMessage
                        name="monthlyBusinessIncome"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="businessExperienceYears" className="block text-gray-700 font-medium mb-2">
                        Сколько лет вы ведёте деятельность в этой сфере?
                      </label>
                      <Field
                        type="number"
                        id="businessExperienceYears"
                        name="businessExperienceYears"
                        className="form-input"
                        min="0"
                        placeholder="Например: 5"
                      />
                      <ErrorMessage
                        name="businessExperienceYears"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>

                  {/* Registered Business Information */}
                  {isRegisteredBusiness(values.occupation) && (
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-gray-700 mb-3">Информация о регистрации</h4>

                      <div className="mb-4">
                        <label htmlFor="businessName" className="block text-gray-700 font-medium mb-2">
                          Название бизнеса / ИП
                        </label>
                        <Field
                          type="text"
                          id="businessName"
                          name="businessName"
                          className="form-input"
                        />
                        <ErrorMessage
                          name="businessName"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="mb-4">
                          <label htmlFor="businessRegistrationType" className="block text-gray-700 font-medium mb-2">
                            Форма регистрации бизнеса
                          </label>
                          <Field
                            as="select"
                            id="businessRegistrationType"
                            name="businessRegistrationType"
                            className="form-input"
                          >
                            {businessRegistrationOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage
                            name="businessRegistrationType"
                            component="div"
                            className="text-red-500 text-sm mt-1"
                          />
                        </div>

                        <div className="mb-4">
                          <label htmlFor="businessRegistrationNumber" className="block text-gray-700 font-medium mb-2">
                            Регистрационный номер (БИН или ИИН)
                          </label>
                          <Field
                            type="text"
                            id="businessRegistrationNumber"
                            name="businessRegistrationNumber"
                            className="form-input"
                          />
                          <ErrorMessage
                            name="businessRegistrationNumber"
                            component="div"
                            className="text-red-500 text-sm mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="mb-4">
                          <label htmlFor="businessRegistrationDate" className="block text-gray-700 font-medium mb-2">
                            Дата регистрации
                          </label>
                          <Field
                            type="date"
                            id="businessRegistrationDate"
                            name="businessRegistrationDate"
                            className="form-input"
                          />
                          <ErrorMessage
                            name="businessRegistrationDate"
                            component="div"
                            className="text-red-500 text-sm mt-1"
                          />
                        </div>

                        <div className="mb-4">
                          <label htmlFor="businessStatus" className="block text-gray-700 font-medium mb-2">
                            Ваш текущий статус в бизнесе
                          </label>
                          <Field
                            as="select"
                            id="businessStatus"
                            name="businessStatus"
                            className="form-input"
                          >
                            {businessStatusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage
                            name="businessStatus"
                            component="div"
                            className="text-red-500 text-sm mt-1"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label htmlFor="businessAddress" className="block text-gray-700 font-medium mb-2">
                          Адрес регистрации бизнеса
                        </label>
                        <Field
                          type="text"
                          id="businessAddress"
                          name="businessAddress"
                          className="form-input"
                        />
                        <ErrorMessage
                          name="businessAddress"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <Field
                            type="checkbox"
                            id="hasEmployees"
                            name="hasEmployees"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label htmlFor="hasEmployees" className="ml-2 block text-gray-700 font-medium">
                            У вас есть сотрудники?
                          </label>
                        </div>

                        {values.hasEmployees && (
                          <div className="mt-4">
                            <label htmlFor="employeeCount" className="block text-gray-700 font-medium mb-2">
                              Сколько сотрудников работает в вашем бизнесе?
                            </label>
                            <Field
                              type="number"
                              id="employeeCount"
                              name="employeeCount"
                              className="form-input"
                              min="1"
                              placeholder="Например: 5"
                            />
                            <ErrorMessage
                              name="employeeCount"
                              component="div"
                              className="text-red-500 text-sm mt-1"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Business Operations */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-700 mb-3">Деятельность и клиенты</h4>

                    <div className="mb-4">
                      <label htmlFor="businessWebsite" className="block text-gray-700 font-medium mb-2">
                        Веб-сайт или Instagram страницы бизнеса (если есть)
                      </label>
                      <Field
                        type="url"
                        id="businessWebsite"
                        name="businessWebsite"
                        className="form-input"
                        placeholder="https://example.com или https://instagram.com/username"
                      />
                      <ErrorMessage
                        name="businessWebsite"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <Field
                            type="checkbox"
                            id="hasInternationalClients"
                            name="hasInternationalClients"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label htmlFor="hasInternationalClients" className="ml-2 block text-gray-700 font-medium">
                            Работаете ли вы с иностранными клиентами?
                          </label>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <Field
                            type="checkbox"
                            id="hasPermanentContracts"
                            name="hasPermanentContracts"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label htmlFor="hasPermanentContracts" className="ml-2 block text-gray-700 font-medium">
                            Есть ли у вас постоянные контракты с клиентами?
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-700 mb-3">Доходы и налоги</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <Field
                            type="checkbox"
                            id="paysTaxes"
                            name="paysTaxes"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label htmlFor="paysTaxes" className="ml-2 block text-gray-700 font-medium">
                            Платите ли вы налоги с этого вида деятельности?
                          </label>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <Field
                            type="checkbox"
                            id="hasBankStatements"
                            name="hasBankStatements"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label htmlFor="hasBankStatements" className="ml-2 block text-gray-700 font-medium">
                            Имеете ли вы банковские выписки/доходы?
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="yearlyIncome" className="block text-gray-700 font-medium mb-2">
                        Примерный годовой доход (в тенге/долларах)
                      </label>
                      <Field
                        type="text"
                        id="yearlyIncome"
                        name="yearlyIncome"
                        className="form-input"
                        placeholder="Например: 6000000 тенге или 40000 USD"
                      />
                      <ErrorMessage
                        name="yearlyIncome"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>

                  {/* Office Information */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-700 mb-3">Помещение/офис</h4>

                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <Field
                          type="checkbox"
                          id="hasOffice"
                          name="hasOffice"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="hasOffice" className="ml-2 block text-gray-700 font-medium">
                          Имеете ли вы помещение/офис?
                        </label>
                      </div>

                      {values.hasOffice && (
                        <div className="mt-4">
                          <label htmlFor="officeAddress" className="block text-gray-700 font-medium mb-2">
                            Укажите адрес офиса
                          </label>
                          <Field
                            type="text"
                            id="officeAddress"
                            name="officeAddress"
                            className="form-input"
                          />
                          <ErrorMessage
                            name="officeAddress"
                            component="div"
                            className="text-red-500 text-sm mt-1"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </Form>
          );
        }}
      </Formik>
    </div>
  );
});

Step8_EducationWork.displayName = 'Step8_EducationWork';

export default Step8_EducationWork;