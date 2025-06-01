import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { Formik, Form, ErrorMessage, FieldArray, FormikProps } from 'formik';
import { step9Schema } from '../utils/validations';
import { Step9Data } from '../utils/types';

export interface Step9Ref {
  submitForm: () => void;
  isValid: boolean;
}

interface Step9Props {
  initialValues: Step9Data;
  onSubmit: (values: Step9Data) => void;
}

// Список популярных стран для быстрого добавления
const popularCountries = [
  'Турция', 'Египет', 'ОАЭ', 'Таиланд', 'Китай',
  'Германия', 'Франция', 'Италия', 'Испания', 'Великобритания'
];

const Step9_TravelHistory = forwardRef<Step9Ref, Step9Props>(({ initialValues, onSubmit }, ref) => {
  const [customCountry, setCustomCountry] = useState('');
  const formikRef = useRef<FormikProps<Step9Data>>(null);

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
      <h2 className="text-xl font-semibold text-gray-800 mb-6">История поездок</h2>
      <p className="text-gray-600 mb-6">
        Пожалуйста, укажите страны, которые вы посещали ранее.
      </p>

      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        validationSchema={step9Schema}
        onSubmit={onSubmit}
      >
        {({ values, isValid: _isValid, setFieldValue }) => {
            return (
          <Form>
            <div className="grid grid-cols-1 gap-4">
              <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">В каких странах вы были ранее?</h3>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {popularCountries.map((country) => (
                      <button
                        key={country}
                        type="button"
                        className={`px-3 py-1 rounded-full text-sm font-medium
                          ${values.visitedCountries.includes(country)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        onClick={() => {
                          if (values.visitedCountries.includes(country)) {
                            setFieldValue(
                              'visitedCountries',
                              values.visitedCountries.filter((c) => c !== country)
                            );
                          } else {
                            setFieldValue(
                              'visitedCountries',
                              [...values.visitedCountries, country]
                            );
                          }
                        }}
                      >
                        {country}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="text"
                      value={customCountry}
                      onChange={(e) => setCustomCountry(e.target.value)}
                      placeholder="Другая страна..."
                      className="form-input flex-1"
                    />
                    <button
                      type="button"
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                      disabled={!customCountry.trim()}
                      onClick={() => {
                        if (customCountry.trim() && !values.visitedCountries.includes(customCountry.trim())) {
                          setFieldValue(
                            'visitedCountries',
                            [...values.visitedCountries, customCountry.trim()]
                          );
                          setCustomCountry('');
                        }
                      }}
                    >
                      Добавить
                    </button>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Выбранные страны:
                    </label>
                    <FieldArray name="visitedCountries">
                      {({ remove }) => (
                        <div>
                          {values.visitedCountries.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {values.visitedCountries.map((country, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                                >
                                  <span>{country}</span>
                                  <button
                                    type="button"
                                    className="text-blue-500 hover:text-blue-700"
                                    onClick={() => remove(index)}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-500 mb-2">Нет выбранных стран</div>
                          )}
                        </div>
                      )}
                    </FieldArray>
                    <ErrorMessage
                      name="visitedCountries"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Form>
        )}}
      </Formik>
    </div>
  );
});

Step9_TravelHistory.displayName = 'Step9_TravelHistory';

export default Step9_TravelHistory;