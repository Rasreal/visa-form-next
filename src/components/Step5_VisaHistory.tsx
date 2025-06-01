import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikProps, FieldArray } from 'formik';
import { step5Schema } from '../utils/validations';
import { Step5Data, VisaFormData } from '../utils/types';
import { searchApplicationsByPassport } from '../utils/supabase';

interface Step5Props {
  initialValues: Step5Data;
  onSubmit: (values: Step5Data) => void;
}

export interface Step5Ref {
  submitForm: () => void;
  isValid: boolean;
}

interface PreviousApplication {
  id: string;
  agent_id: string;
  form_data: VisaFormData;
  step_status: number;
  uploaded_files: Record<string, string>;
  whatsapp_redirected: boolean;
  created_at: string;
  updated_at: string;
}

const Step5_VisaHistory = forwardRef<Step5Ref, Step5Props>(({ initialValues, onSubmit }, ref) => {
  const [searchPassport, setSearchPassport] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [previousApplication, setPreviousApplication] = useState<PreviousApplication | null>(null);
  const formRef = useRef<FormikProps<Step5Data>>(null);
  const formikRef = useRef<FormikProps<Step5Data>>(null);

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      formikRef.current?.submitForm();
    },
    isValid: true, // Step 5 has no required fields, so always valid
  }));

  const handleSearchPreviousApplication = async () => {
    if (!searchPassport) {
      setSearchError('Введите номер паспорта для поиска');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setPreviousApplication(null);

    try {
      const { data, error } = await searchApplicationsByPassport(searchPassport);

      if (error) {
        console.error('API error:', error);
        throw new Error('Ошибка при поиске анкеты');
      }

      if (data) {
        console.log('Found application:', data);
        setPreviousApplication(data);
      } else {
        setSearchError('Предыдущая анкета не найдена. Проверьте номер паспорта.');
      }
    } catch (err) {
      setSearchError('Ошибка при поиске анкеты. Пожалуйста, попробуйте еще раз.');
      console.error('Error searching for previous application:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const loadPreviousApplicationData = () => {
    if (!previousApplication || !formRef.current) return;

    try {
      const prevFormData = previousApplication.form_data;

      // Set values in the current form
      formRef.current.setValues({
        ...formRef.current.values,
        hasBeenToUSA: prevFormData.hasBeenToUSA || formRef.current.values.hasBeenToUSA,
        hasUSVisa: prevFormData.hasUSVisa || formRef.current.values.hasUSVisa,
        lastVisaDate: prevFormData.lastVisaDate || formRef.current.values.lastVisaDate,
        visaNumber: prevFormData.visaNumber || formRef.current.values.visaNumber,
        isSameVisaType: prevFormData.isSameVisaType || formRef.current.values.isSameVisaType,
        isSameCountry: prevFormData.isSameCountry || formRef.current.values.isSameCountry,
        hasVisaRejections: true, // Force this to true since we're loading a rejected application
        rejectionVisaType: prevFormData.rejectionVisaType || formRef.current.values.rejectionVisaType,
        rejectionDate: prevFormData.rejectionDate || formRef.current.values.rejectionDate,
      });
    } catch (err) {
      console.error('Error loading previous application data:', err);
      setSearchError('Ошибка при загрузке данных из предыдущей анкеты.');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">История виз</h2>
      <p className="text-gray-600 mb-6">
        Пожалуйста, предоставьте информацию о ваших предыдущих визах в США, если таковые имеются.
      </p>

      <div className="p-4 border border-gray-200 rounded-lg mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Загрузить данные из предыдущей анкеты</h3>
        <p className="text-gray-600 mb-4">
          Если вы ранее подавали на визу и вам отказали, вы можете загрузить данные из предыдущей анкеты.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="col-span-2">
            <input
              type="text"
              value={searchPassport}
              onChange={(e) => setSearchPassport(e.target.value)}
              placeholder="Введите номер паспорта"
              className="form-input w-full"
            />
          </div>
          <div>
            <button
              type="button"
              onClick={handleSearchPreviousApplication}
              disabled={isSearching}
              className="btn-primary w-[100px] py-2 rounded-full flex items-center justify-center"
            >
              {isSearching ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Поиск...
                </>
              ) : (
                <>
                  <svg className="-ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Поиск
                </>
              )}
            </button>
          </div>
        </div>

        {searchError && (
          <div className="text-red-500 text-sm mb-4">{searchError}</div>
        )}

        {previousApplication && (
          <div className="bg-green-50 p-4 rounded-md mb-4">
            <p className="text-green-800 font-medium">Найдена предыдущая анкета!</p>
            <p className="text-green-600 text-sm">
              Дата создания: {new Date(previousApplication.created_at).toLocaleDateString()}
            </p>
            <button
              type="button"
              onClick={loadPreviousApplicationData}
              className="btn-secondary mt-2"
            >
              Загрузить данные
            </button>
          </div>
        )}
      </div>

      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        validationSchema={step5Schema}
        onSubmit={(values) => {
          onSubmit(values);
        }}
      >
        {(formikProps) => {
          // Store reference to formik props for use in loadPreviousApplicationData
          formRef.current = formikProps;

          return (
            <Form>
              <div className="p-4 border border-gray-200 rounded-lg mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Предыдущая анкета DS-160</h3>
                <p className="text-gray-600 mb-4">
                  Есть ли у вас анкета от другой визовой компании? Загрузите её
                </p>

                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Field
                      type="checkbox"
                      id="hasPreviousDS160"
                      name="hasPreviousDS160"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="hasPreviousDS160" className="ml-2 block text-gray-700 font-medium">
                      У меня есть предыдущая анкета DS-160
                    </label>
                  </div>
                </div>

                {formikProps.values.hasPreviousDS160 && (
                  <div className="mt-2">
                    <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                      <p className="text-gray-600 mb-2">Загрузите файл предыдущей анкеты</p>
                      <input
                        type="file"
                        id="previousDS160File"
                        name="previousDS160File"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            formikProps.setFieldValue('previousDS160File', file.name);
                          }
                        }}
                      />
                      <label
                        htmlFor="previousDS160File"
                        className="bg-blue-500 text-white px-3 py-1 rounded cursor-pointer inline-block"
                      >
                        Выбрать файл
                      </label>
                      {formikProps.values.previousDS160File && (
                        <p className="text-green-600 mt-2">
                          Файл загружен: {formikProps.values.previousDS160File}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Field
                      type="checkbox"
                      id="hasBeenToUSA"
                      name="hasBeenToUSA"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="hasBeenToUSA" className="ml-2 block text-gray-700 font-medium">
                      Были ли вы в США ранее?
                    </label>
                  </div>
                </div>

                {formikProps.values.hasBeenToUSA && (
                  <div className="p-4 border border-gray-200 rounded-lg mb-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Информация о прошлых посещениях США</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="mb-4">
                        <label htmlFor="visitYear" className="block text-gray-700 font-medium mb-2">
                          Год поездки
                        </label>
                        <Field
                          type="number"
                          id="visitYear"
                          name="visitYear"
                          min="1900"
                          max={new Date().getFullYear()}
                          className="form-input"
                        />
                      </div>

                      <div className="mb-4">
                        <label htmlFor="visitPurpose" className="block text-gray-700 font-medium mb-2">
                          Причина поездки
                        </label>
                        <Field
                          type="text"
                          id="visitPurpose"
                          name="visitPurpose"
                          className="form-input"
                          placeholder="Например: туризм, учеба, бизнес"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="mb-4">
                        <label htmlFor="visitDuration" className="block text-gray-700 font-medium mb-2">
                          Длительность пребывания
                        </label>
                        <div className="flex items-center">
                          <Field
                            type="number"
                            id="visitDuration"
                            name="visitDuration"
                            min="1"
                            className="form-input w-2/3"
                          />
                          <Field
                            as="select"
                            id="visitDurationType"
                            name="visitDurationType"
                            className="form-input w-1/3 ml-2"
                          >
                            <option value="days">дней</option>
                            <option value="weeks">недель</option>
                            <option value="months">месяцев</option>
                            <option value="years">лет</option>
                          </Field>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label htmlFor="visitVisaType" className="block text-gray-700 font-medium mb-2">
                          Тип визы (если была)
                        </label>
                        <Field
                          type="text"
                          id="visitVisaType"
                          name="visitVisaType"
                          className="form-input"
                          placeholder="Например: B1/B2, F1, и т.д."
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Field
                      type="checkbox"
                      id="hasUSVisa"
                      name="hasUSVisa"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="hasUSVisa" className="ml-2 block text-gray-700 font-medium">
                      Имели ли вы ранее визу США?
                    </label>
                  </div>

                  {formikProps.values.hasUSVisa && (
                    <div className="mt-4 mb-4 p-4 border border-gray-200 rounded-md">
                      <div className="mb-4">
                        <label htmlFor="lastVisaDate" className="block text-gray-700 font-medium mb-2">
                          Дата последней визы
                        </label>
                        <Field
                          type="date"
                          id="lastVisaDate"
                          name="lastVisaDate"
                          className="form-input"
                        />
                        <ErrorMessage
                          name="lastVisaDate"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <div className="mb-4">
                        <label htmlFor="visaNumber" className="block text-gray-700 font-medium mb-2">
                          Номер визы
                        </label>
                        <Field
                          type="text"
                          id="visaNumber"
                          name="visaNumber"
                          className="form-input"
                        />
                        <ErrorMessage
                          name="visaNumber"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <Field
                            type="checkbox"
                            id="isSameVisaType"
                            name="isSameVisaType"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label htmlFor="isSameVisaType" className="ml-2 block text-gray-700 font-medium">
                            Подаете ли вы на такой же тип визы?
                          </label>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <Field
                            type="checkbox"
                            id="isSameCountry"
                            name="isSameCountry"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label htmlFor="isSameCountry" className="ml-2 block text-gray-700 font-medium">
                            Подаете ли вы с той же страны, где получали визу?
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Rest of the form content */}
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Field
                      type="checkbox"
                      id="hasVisaRejections"
                      name="hasVisaRejections"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="hasVisaRejections" className="ml-2 block text-gray-700 font-medium">
                      Были ли отказы в визе США?
                    </label>
                  </div>

                  {formikProps.values.hasVisaRejections && (
                    <div className="mt-4 mb-4 p-4 border border-gray-200 rounded-md">
                      <h4 className="text-lg font-medium text-gray-800 mb-4">Отказы в визе США</h4>

                      {/* Keep legacy fields for backward compatibility */}
                      {formikProps.values.rejectionVisaType && formikProps.values.rejectionDate && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-sm text-yellow-800 mb-2">Найдены данные из предыдущей версии:</p>
                          <p className="text-sm"><strong>Тип визы:</strong> {formikProps.values.rejectionVisaType}</p>
                          <p className="text-sm"><strong>Дата отказа:</strong> {formikProps.values.rejectionDate}</p>
                          <button
                            type="button"
                            className="mt-2 text-sm bg-blue-500 text-white px-3 py-1 rounded"
                            onClick={() => {
                              const newRejection = {
                                visaType: formikProps.values.rejectionVisaType || '',
                                rejectionDate: formikProps.values.rejectionDate || '',
                                reason: ''
                              };
                              const currentRejections = formikProps.values.visaRejections || [];
                              formikProps.setFieldValue('visaRejections', [...currentRejections, newRejection]);
                              formikProps.setFieldValue('rejectionVisaType', '');
                              formikProps.setFieldValue('rejectionDate', '');
                            }}
                          >
                            Перенести в новый формат
                          </button>
                        </div>
                      )}

                      <FieldArray name="visaRejections">
                        {({ push, remove }) => (
                          <div>
                            {formikProps.values.visaRejections && formikProps.values.visaRejections.length > 0 ? (
                              formikProps.values.visaRejections.map((rejection, index) => (
                                <div key={index} className="mb-4 p-4 border border-gray-300 rounded-md">
                                  <div className="flex justify-between items-center mb-3">
                                    <h5 className="font-medium text-gray-700">Отказ #{index + 1}</h5>
                                    <button
                                      type="button"
                                      className="text-red-500 hover:text-red-700"
                                      onClick={() => remove(index)}
                                    >
                                      Удалить
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label htmlFor={`visaRejections.${index}.visaType`} className="block text-gray-700 font-medium mb-2">
                                        Тип визы
                                      </label>
                                      <Field
                                        type="text"
                                        id={`visaRejections.${index}.visaType`}
                                        name={`visaRejections.${index}.visaType`}
                                        className="form-input"
                                        placeholder="B1/B2, F1, и т.д."
                                      />
                                      <ErrorMessage
                                        name={`visaRejections.${index}.visaType`}
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                      />
                                    </div>

                                    <div>
                                      <label htmlFor={`visaRejections.${index}.rejectionDate`} className="block text-gray-700 font-medium mb-2">
                                        Дата отказа
                                      </label>
                                      <Field
                                        type="date"
                                        id={`visaRejections.${index}.rejectionDate`}
                                        name={`visaRejections.${index}.rejectionDate`}
                                        className="form-input"
                                      />
                                      <ErrorMessage
                                        name={`visaRejections.${index}.rejectionDate`}
                                        component="div"
                                        className="text-red-500 text-sm mt-1"
                                      />
                                    </div>
                                  </div>

                                  <div className="mt-3">
                                    <label htmlFor={`visaRejections.${index}.reason`} className="block text-gray-700 font-medium mb-2">
                                      Причина отказа (необязательно)
                                    </label>
                                    <Field
                                      as="textarea"
                                      id={`visaRejections.${index}.reason`}
                                      name={`visaRejections.${index}.reason`}
                                      className="form-input"
                                      rows="2"
                                      placeholder="Укажите причину отказа, если известна"
                                    />
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-gray-500 mb-4">Нет добавленных отказов в визе</div>
                            )}

                            <button
                              type="button"
                              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                              onClick={() => push({ visaType: '', rejectionDate: '', reason: '' })}
                            >
                              Добавить отказ в визе
                            </button>
                          </div>
                        )}
                      </FieldArray>

                      {/* Legacy fields for backward compatibility - hidden but still validated */}
                      <div style={{ display: 'none' }}>
                        <Field
                          type="text"
                          name="rejectionVisaType"
                        />
                        <Field
                          type="date"
                          name="rejectionDate"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
});

Step5_VisaHistory.displayName = 'Step5_VisaHistory';

export default Step5_VisaHistory;