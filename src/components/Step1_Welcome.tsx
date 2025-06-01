import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikProps } from 'formik';
import { step1Schema } from '../utils/validations';
import { Step1Data } from '../utils/types';

export interface Step1Ref {
  submitForm: () => void;
  isValid: boolean;
}

interface Step1Props {
  initialValues: Step1Data;
  onSubmit: (values: Step1Data) => void;
}

const countryOptions = [
  { value: '', label: 'Выберите страну...' },
  { value: 'usa', label: 'США' },
  { value: 'canada', label: 'Канада' },
  { value: 'uk', label: 'Великобритания' },
  { value: 'australia', label: 'Австралия' },
  { value: 'schengen', label: 'Шенген' },
  { value: 'other', label: 'Другое' },
];

const Step1_Welcome = forwardRef<Step1Ref, Step1Props>(({ initialValues, onSubmit }, ref) => {
  const formikRef = useRef<FormikProps<Step1Data>>(null);
  const [selectedCountry, setSelectedCountry] = useState(initialValues.visaDestination || '');

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      if (formikRef.current) {
        formikRef.current.submitForm();
      }
    },
    isValid: formikRef.current?.isValid ?? false,
  }));
  
  // Update selectedCountry when formikRef.current.values.visaDestination changes
  useEffect(() => {
    if (formikRef.current?.values.visaDestination) {
      setSelectedCountry(formikRef.current.values.visaDestination);
    }
  }, [formikRef.current?.values?.visaDestination]);

  return (
    <div className="text-center">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Добро пожаловать в сервис заполнения анкеты на визу</h1>
      <p className="text-lg text-gray-600 mb-8">Для начала выберите страну, для которой вы хотите получить визу.</p>

      <Formik
        innerRef={formikRef}
        initialValues={{
          ...initialValues,
          otherVisaDestination: initialValues.otherVisaDestination || ''
        }}
        validationSchema={step1Schema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue, isValid: _isValid, dirty: _dirty }) => (
          <Form>
            <div className="max-w-md mx-auto">
              <Field
                as="select"
                id="visaDestination"
                name="visaDestination"
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const value = e.target.value;
                  setFieldValue('visaDestination', value);
                  setSelectedCountry(value);
                  if (value !== 'other') {
                    setFieldValue('otherVisaDestination', '');
                  }
                }}
              >
                {countryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Field>
              <ErrorMessage
                name="visaDestination"
                component="div"
                className="mt-2 text-red-600 text-sm"
              />

              {selectedCountry === 'other' && (
                <div className="mt-4">
                  <Field
                    type="text"
                    id="otherVisaDestination"
                    name="otherVisaDestination"
                    placeholder="Введите название страны"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  />
                  <ErrorMessage
                    name="otherVisaDestination"
                    component="div"
                    className="mt-2 text-red-600 text-sm"
                  />
                </div>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
});

Step1_Welcome.displayName = 'Step1_Welcome';

export default Step1_Welcome;