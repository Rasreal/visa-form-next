import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FieldArray, FormikProps } from 'formik';
import { step4Schema } from '../utils/validations';
import { Step4Data } from '../utils/types';

interface Step4Props {
  initialValues: Step4Data;
  onSubmit: (values: Step4Data) => void;
  updateForm: (values: Step4Data) => void;
}

export interface Step4Ref {
  submitForm: () => void;
  isValid: boolean;
}

const travelPurposeOptions = [
  { value: '', label: 'Выберите...' },
  { value: 'tourism', label: 'Туризм' },
  { value: 'business', label: 'Бизнес' },
  { value: 'medical', label: 'Лечение' },
  { value: 'study', label: 'Учеба' },
  { value: 'visa', label: 'Визовая поддержка' },
  { value: 'other', label: 'Другое' },
];

const Step4_TravelPurpose = forwardRef<Step4Ref, Step4Props>(({ initialValues, onSubmit, updateForm }, ref) => {
  const formikRef = useRef<FormikProps<Step4Data>>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      formikRef.current?.submitForm();
    },
    isValid: isFormValid,
  }));

  // Update form validity when initial values change
  useEffect(() => {
    const isValid = Boolean(initialValues.travelPurpose && initialValues.travelPurpose !== '');
    setIsFormValid(isValid);
  }, [initialValues.travelPurpose]);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Цель поездки</h2>
      <p className="text-gray-600 mb-6">
        Пожалуйста, укажите цель вашей поездки в США и информацию о попутчиках, если таковые имеются.
      </p>

      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        validationSchema={step4Schema}
        onSubmit={(values) => {
          onSubmit(values);
        }}
      >
        {({ values, isValid: _isValid, setFieldValue }) => {
          // Update form validity when values change
          const currentValid = Boolean(values.travelPurpose && values.travelPurpose !== '');
          if (currentValid !== isFormValid) {
              setTimeout(() => {
                setIsFormValid(currentValid);
                updateForm(values);
              }, 0);
          }

          return (
          <Form>
            <div className="grid grid-cols-1 gap-4">
              <div className="mb-4">
                <label htmlFor="travelPurpose" className="block text-gray-700 font-medium mb-2">
                  Цель поездки (B1/B2)
                </label>
                <Field
                  as="select"
                  id="travelPurpose"
                  name="travelPurpose"
                  className="form-input"
                >
                  {travelPurposeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="travelPurpose"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Дополнительная информация о поездке</h3>
                
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Есть ли у вас своя цель поездки?
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="hasOwnTravelPurpose-yes"
                        name="hasOwnTravelPurpose"
                        checked={values.hasOwnTravelPurpose === true}
                        onChange={() => {
                          setFieldValue('hasOwnTravelPurpose', true);
                          updateForm({ ...values, hasOwnTravelPurpose: true });
                        }}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <label htmlFor="hasOwnTravelPurpose-yes" className="ml-2 block text-gray-700">
                        Да, у меня есть
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="hasOwnTravelPurpose-no"
                        name="hasOwnTravelPurpose"
                        checked={values.hasOwnTravelPurpose === false}
                        onChange={() => {
                          setFieldValue('hasOwnTravelPurpose', false);
                          updateForm({ ...values, hasOwnTravelPurpose: false });
                        }}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <label htmlFor="hasOwnTravelPurpose-no" className="ml-2 block text-gray-700">
                        Создайте за меня
                      </label>
                    </div>
                  </div>
                </div>

                {values.hasOwnTravelPurpose && (
                  <div className="space-y-4">
                    <div className="mb-4">
                      <label htmlFor="travelPurposeDescription" className="block text-gray-700 font-medium mb-2">
                        Описание цели поездки
                      </label>
                      <Field
                        as="textarea"
                        id="travelPurposeDescription"
                        name="travelPurposeDescription"
                        className="form-input"
                        rows="3"
                      />
                      <ErrorMessage
                        name="travelPurposeDescription"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="mb-4">
                        <label htmlFor="departureDate" className="block text-gray-700 font-medium mb-2">
                          Дата вылета
                        </label>
                        <Field
                          type="date"
                          id="departureDate"
                          name="departureDate"
                          className="form-input"
                        />
                        <ErrorMessage
                          name="departureDate"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <div className="mb-4">
                        <label htmlFor="returnDate" className="block text-gray-700 font-medium mb-2">
                          Дата возвращения
                        </label>
                        <Field
                          type="date"
                          id="returnDate"
                          name="returnDate"
                          className="form-input"
                        />
                        <ErrorMessage
                          name="returnDate"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="destination" className="block text-gray-700 font-medium mb-2">
                        Место назначения
                      </label>
                      <Field
                        type="text"
                        id="destination"
                        name="destination"
                        className="form-input"
                      />
                      <ErrorMessage
                        name="destination"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <Field
                          type="checkbox"
                          id="hasInvitation"
                          name="hasInvitation"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="hasInvitation" className="ml-2 block text-gray-700 font-medium">
                          У меня есть приглашение
                        </label>
                      </div>

                      {values.hasInvitation && (
                        <div className="mt-2">
                          <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                            <p className="text-gray-600 mb-2">Загрузите файл приглашения</p>
                            <input
                              type="file"
                              id="invitationFile"
                              name="invitationFile"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setFieldValue('invitationFile', file.name);
                                }
                              }}
                            />
                            <label
                              htmlFor="invitationFile"
                              className="bg-blue-500 text-white px-3 py-1 rounded cursor-pointer inline-block"
                            >
                              Выбрать файл
                            </label>
                            {values.invitationFile && (
                              <p className="text-green-600 mt-2">
                                Файл загружен: {values.invitationFile}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Field
                    type="checkbox"
                    id="travelWithOthers"
                    name="travelWithOthers"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="travelWithOthers" className="ml-2 block text-gray-700 font-medium">
                    Путешествуете с кем-либо?
                  </label>
                </div>

                {values.travelWithOthers && (
                  <div className="mt-4 mb-4 p-4 border border-gray-200 rounded-md">
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <Field
                          type="checkbox"
                          id="travelAsGroup"
                          name="travelAsGroup"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="travelAsGroup" className="ml-2 block text-gray-700 font-medium">
                          Путешествуете как часть группы или организации?
                        </label>
                      </div>

                      {values.travelAsGroup ? (
                        <div className="mt-2">
                          <Field
                            type="text"
                            id="groupName"
                            name="groupName"
                            placeholder="Название группы или организации"
                            className="form-input"
                          />
                          <ErrorMessage
                            name="groupName"
                            component="div"
                            className="text-red-500 text-sm mt-1"
                          />
                        </div>
                      ) : (
                        <div className="mt-4">
                          <label className="block text-gray-700 font-medium mb-2">
                            Информация о попутчиках
                          </label>
                          <FieldArray name="companions">
                            {({ push, remove }) => (
                              <div>
                                {values.companions && values.companions.length > 0 ? (
                                  values.companions.map((companion, index) => (
                                    <div key={index} className="flex flex-col md:flex-row gap-4 mb-4">
                                      <div className="flex-1">
                                        <Field
                                          type="text"
                                          name={`companions.${index}.name`}
                                          placeholder="Имя и фамилия"
                                          className="form-input"
                                        />
                                        <ErrorMessage
                                          name={`companions.${index}.name`}
                                          component="div"
                                          className="text-red-500 text-sm mt-1"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <Field
                                          type="text"
                                          name={`companions.${index}.relationship`}
                                          placeholder="Кем приходится"
                                          className="form-input"
                                        />
                                        <ErrorMessage
                                          name={`companions.${index}.relationship`}
                                          component="div"
                                          className="text-red-500 text-sm mt-1"
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        className="bg-red-500 text-white px-3 py-2 rounded"
                                        onClick={() => remove(index)}
                                      >
                                        Удалить
                                      </button>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-gray-500 mb-2">Нет добавленных попутчиков</div>
                                )}
                                <button
                                  type="button"
                                  className="bg-blue-500 text-white px-4 py-2 rounded"
                                  onClick={() => push({ name: '', relationship: '' })}
                                >
                                  Добавить попутчика
                                </button>
                              </div>
                            )}
                          </FieldArray>
                          {values.companions && values.companions.length === 0 && (
                            <ErrorMessage
                              name="companions"
                              component="div"
                              className="text-red-500 text-sm mt-1"
                            />
                          )}
                        </div>
                      )}
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

Step4_TravelPurpose.displayName = 'Step4_TravelPurpose';

export default Step4_TravelPurpose;