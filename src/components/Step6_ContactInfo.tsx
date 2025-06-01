import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage, FieldArray, FormikProps, FieldProps } from 'formik';
import { step6Schema } from '../utils/validations';
import { Step6Data } from '../utils/types';

export interface Step6Ref {
  submitForm: () => void;
  isValid: boolean;
}

interface Step6Props {
  initialValues: Step6Data;
  onSubmit: (values: Step6Data) => void;
}

const Step6_ContactInfo = forwardRef<Step6Ref, Step6Props>(({ initialValues, onSubmit }, ref) => {
  const formikRef = useRef<FormikProps<Step6Data>>(null);

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      formikRef.current?.submitForm();
    },
    isValid: formikRef.current?.isValid ?? false,
  }));

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Контактная информация</h2>
      <p className="text-gray-600 mb-6">
        Пожалуйста, предоставьте вашу контактную информацию и ссылки на социальные сети.
      </p>

      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        validationSchema={step6Schema}
        onSubmit={onSubmit}
      >
        {({ values, isValid: _isValid, setFieldValue }) => (
          <Form>
            <div className="grid grid-cols-1 gap-4">
              <div className="mb-4">
                <label htmlFor="address" className="block text-gray-700 font-medium mb-2">
                  Домашний адрес (улица, дом)
                </label>
                <Field
                  type="text"
                  id="address"
                  name="address"
                  className="form-input"
                />
                <ErrorMessage
                  name="address"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="city" className="block text-gray-700 font-medium mb-2">
                    Город
                  </label>
                  <Field
                    type="text"
                    id="city"
                    name="city"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="city"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="stateProvince" className="block text-gray-700 font-medium mb-2">
                    Штат/Область/Провинция
                  </label>
                  <Field
                    type="text"
                    id="stateProvince"
                    name="stateProvince"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="stateProvince"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="country" className="block text-gray-700 font-medium mb-2">
                  Страна
                </label>
                <Field
                  type="text"
                  id="country"
                  name="country"
                  className="form-input"
                />
                <ErrorMessage
                  name="country"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="zipCode" className="block text-gray-700 font-medium mb-2">
                  Почтовый индекс
                </label>
                <Field
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  className="form-input"
                />
                <ErrorMessage
                  name="zipCode"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                  Телефон (+7 XXX XXX XX XX)
                </label>
                <Field name="phone">
                  {({ field, form }: FieldProps) => {
                    // Handle phone number input with better UX
                    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                      // Always preserve the +7 prefix
                      let input = e.target.value;
                      
                      // If user tries to delete the prefix, preserve it
                      if (!input.startsWith('+7')) {
                        if (input.startsWith('+')) {
                          input = '+7' + input.slice(1);
                        } else {
                          input = '+7 ' + input.replace(/^\+7\s?/, '');
                        }
                      }
                      
                      // Extract only digits after +7
                      let digits = input.slice(2).replace(/\D/g, '');
                      
                      // Format the phone number
                      let formatted = '+7';
                      if (digits.length > 0) {
                        formatted += ' ' + digits.slice(0, 3);
                      }
                      if (digits.length > 3) {
                        formatted += ' ' + digits.slice(3, 6);
                      }
                      if (digits.length > 6) {
                        formatted += ' ' + digits.slice(6, 8);
                      }
                      if (digits.length > 8) {
                        formatted += ' ' + digits.slice(8, 10);
                      }
                      
                      // Limit to 10 digits (excluding the +7)
                      if (digits.length > 10) {
                        digits = digits.slice(0, 10);
                        const parts = [
                          digits.slice(0, 3),
                          digits.slice(3, 6),
                          digits.slice(6, 8),
                          digits.slice(8, 10)
                        ].filter(Boolean);
                        
                        formatted = '+7 ' + parts.join(' ');
                      }
                      
                      form.setFieldValue('phone', formatted);
                    };
                    
                    // Handle paste event
                    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
                      e.preventDefault();
                      const pastedText = e.clipboardData.getData('text');
                      
                      // Extract digits only
                      const digits = pastedText.replace(/\D/g, '');
                      
                      // Format the pasted number
                      let formatted = '+7';
                      const cleanDigits = digits.replace(/^7/, '').slice(0, 10); // Remove leading 7 if present
                      
                      if (cleanDigits.length > 0) {
                        formatted += ' ' + cleanDigits.slice(0, 3);
                      }
                      if (cleanDigits.length > 3) {
                        formatted += ' ' + cleanDigits.slice(3, 6);
                      }
                      if (cleanDigits.length > 6) {
                        formatted += ' ' + cleanDigits.slice(6, 8);
                      }
                      if (cleanDigits.length > 8) {
                        formatted += ' ' + cleanDigits.slice(8, 10);
                      }
                      
                      form.setFieldValue('phone', formatted);
                    };
                    
                    return (
                      <input
                        {...field}
                        type="tel"
                        id="phone"
                        className="form-input"
                        placeholder="+7 ___ ___ __ __"
                        value={field.value || '+7 '}
                        onChange={handlePhoneChange}
                        onPaste={handlePaste}
                        onFocus={(e) => {
                          // If field is empty, initialize with +7 prefix
                          if (!e.target.value || e.target.value === '') {
                            form.setFieldValue('phone', '+7 ');
                          }
                          
                          // Place cursor at the end
                          const len = e.target.value.length;
                          e.target.setSelectionRange(len, len);
                        }}
                      />
                    );
                  }}
                </Field>
                <ErrorMessage
                  name="phone"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
                <div className="text-sm text-gray-500 mt-1">
                  Формат: +7 XXX XXX XX XX (казахстанский номер)
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                  Email
                </label>
                <Field
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Ссылки на социальные сети (желательно минимум одна)
                </label>
                <FieldArray name="socialMediaLinks">
                  {({ push, remove }) => (
                    <div>
                      {values.socialMediaLinks && values.socialMediaLinks.length > 0 ? (
                        values.socialMediaLinks.map((link, index) => (
                          <div key={index} className="flex items-center gap-2 mb-2">
                            <Field
                              type="text"
                              name={`socialMediaLinks.${index}`}
                              className="form-input flex-1"
                              placeholder="https://..."
                            />
                            <button
                              type="button"
                              className="bg-red-500 text-white px-2 py-1 rounded"
                              onClick={() => remove(index)}
                            >
                              Удалить
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 mb-2">Нет добавленных ссылок</div>
                      )}
                      <button
                        type="button"
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={() => push('')}
                      >
                        Добавить ссылку
                      </button>
                    </div>
                  )}
                </FieldArray>
                {values.socialMediaLinks && values.socialMediaLinks.length === 0 && (
                  <ErrorMessage
                    name="socialMediaLinks"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                )}
              </div>
            </div>

            {/* Hidden submit button - will be triggered by StepWrapper */}
            <button type="submit" style={{ display: 'none' }} />
          </Form>
        )}
      </Formik>
    </div>
  );
});

Step6_ContactInfo.displayName = 'Step6_ContactInfo';

export default Step6_ContactInfo;