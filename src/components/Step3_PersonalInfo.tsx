import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikProps } from 'formik';
import { step3Schema } from '../utils/validations';
import { Step3Data } from '../utils/types';

export interface Step3Ref {
  submitForm: () => void;
  isValid: boolean;
}

interface Step3Props {
  initialValues: Step3Data;
  onSubmit: (values: Step3Data) => void;
}

const maritalStatusOptions = [
  { value: '', label: 'Выберите...' },
  { value: 'single', label: 'Холост/Не замужем' },
  { value: 'married', label: 'Женат/Замужем' },
  { value: 'divorced', label: 'В разводе' },
  { value: 'widowed', label: 'Вдовец/Вдова' },
  { value: 'separated', label: 'В разводе де-факто' },
];

const Step3_PersonalInfo = forwardRef<Step3Ref, Step3Props>(({ initialValues, onSubmit }, ref) => {
  const formikRef = useRef<FormikProps<Step3Data>>(null);

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      if (formikRef.current) {
        formikRef.current.submitForm();
      }
    },
    isValid: formikRef.current?.isValid ?? false,
  }));

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Личная информация</h2>
      <p className="text-gray-600 mb-6">
        Пожалуйста, заполните информацию о себе. Все поля обязательны для заполнения.
      </p>

      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        validationSchema={step3Schema}
        onSubmit={onSubmit}
      >
        {({ values, isValid: _isValid }) => (
          <Form>
            <div className="grid grid-cols-1 gap-4">
              <div className="mb-4">
                <label htmlFor="fullNameCyrillic" className="block text-gray-700 font-medium mb-2">
                  Полное имя на родном языке (кириллица)
                </label>
                <Field
                  type="text"
                  id="fullNameCyrillic"
                  name="fullNameCyrillic"
                  className="form-input"
                />
                <ErrorMessage
                  name="fullNameCyrillic"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Field
                    type="checkbox"
                    id="hasOtherNames"
                    name="hasOtherNames"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasOtherNames" className="ml-2 block text-gray-700 font-medium">
                    Использовали ли вы другие имена?
                  </label>
                </div>
                {values.hasOtherNames && (
                  <div className="mt-2">
                    <Field
                      type="text"
                      id="otherNames"
                      name="otherNames"
                      placeholder="Введите другие имена/фамилии"
                      className="form-input"
                    />
                    <ErrorMessage
                      name="otherNames"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Пол</label>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <Field
                      type="radio"
                      id="male"
                      name="gender"
                      value="male"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <label htmlFor="male" className="ml-2 block text-gray-700">
                      Мужской
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Field
                      type="radio"
                      id="female"
                      name="gender"
                      value="female"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <label htmlFor="female" className="ml-2 block text-gray-700">
                      Женский
                    </label>
                  </div>
                </div>
                <ErrorMessage
                  name="gender"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="maritalStatus" className="block text-gray-700 font-medium mb-2">
                  Семейное положение
                </label>
                <Field
                  as="select"
                  id="maritalStatus"
                  name="maritalStatus"
                  className="form-input"
                >
                  {maritalStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="maritalStatus"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="cityOfBirth" className="block text-gray-700 font-medium mb-2">
                  Город рождения
                </label>
                <Field
                  type="text"
                  id="cityOfBirth"
                  name="cityOfBirth"
                  className="form-input"
                />
                <ErrorMessage
                  name="cityOfBirth"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="countryOfBirth" className="block text-gray-700 font-medium mb-2">
                  Страна рождения
                </label>
                <Field
                  type="text"
                  id="countryOfBirth"
                  name="countryOfBirth"
                  className="form-input"
                />
                <ErrorMessage
                  name="countryOfBirth"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Field
                    type="checkbox"
                    id="hasOtherCitizenship"
                    name="hasOtherCitizenship"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasOtherCitizenship" className="ml-2 block text-gray-700 font-medium">
                    Есть ли другое гражданство?
                  </label>
                </div>
                {values.hasOtherCitizenship && (
                  <div className="mt-2">
                    <Field
                      type="text"
                      id="otherCitizenship"
                      name="otherCitizenship"
                      placeholder="Укажите страну"
                      className="form-input"
                    />
                    <ErrorMessage
                      name="otherCitizenship"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Field
                    type="checkbox"
                    id="isPermanentResidentOtherCountry"
                    name="isPermanentResidentOtherCountry"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPermanentResidentOtherCountry" className="ml-2 block text-gray-700 font-medium">
                    Являетесь ли вы постоянным жителем другой страны?
                  </label>
                </div>
                {values.isPermanentResidentOtherCountry && (
                  <div className="mt-2">
                    <Field
                      type="text"
                      id="permanentResidenceCountry"
                      name="permanentResidenceCountry"
                      placeholder="Укажите страну"
                      className="form-input"
                    />
                    <ErrorMessage
                      name="permanentResidenceCountry"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="nationality" className="block text-gray-700 font-medium mb-2">
                  Национальность (гражданство)
                </label>
                <Field
                  type="text"
                  id="nationality"
                  name="nationality"
                  className="form-input"
                />
                <ErrorMessage
                  name="nationality"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Field
                    type="checkbox"
                    id="hasSSN"
                    name="hasSSN"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasSSN" className="ml-2 block text-gray-700 font-medium">
                    Имеется ли у вас номер социального страхования США (SSN)?
                  </label>
                </div>
                {values.hasSSN && (
                  <div className="mt-2">
                    <Field
                      type="text"
                      id="ssn"
                      name="ssn"
                      placeholder="Введите SSN"
                      className="form-input"
                    />
                    <ErrorMessage
                      name="ssn"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Field
                    type="checkbox"
                    id="hasTaxpayerId"
                    name="hasTaxpayerId"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasTaxpayerId" className="ml-2 block text-gray-700 font-medium">
                    Имеется ли у вас U.S. Taxpayer ID Number?
                  </label>
                </div>
                {values.hasTaxpayerId && (
                  <div className="mt-2">
                    <Field
                      type="text"
                      id="taxpayerId"
                      name="taxpayerId"
                      placeholder="Введите Taxpayer ID"
                      className="form-input"
                    />
                    <ErrorMessage
                      name="taxpayerId"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                )}
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
});

Step3_PersonalInfo.displayName = 'Step3_PersonalInfo';

export default Step3_PersonalInfo;