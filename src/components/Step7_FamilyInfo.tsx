import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage, FieldArray, FormikProps } from 'formik';
import { step7Schema } from '../utils/validations';
import { Step7Data } from '../utils/types';

interface Step7Props {
  initialValues: Step7Data;
  onSubmit: (values: Step7Data) => void;
}

export interface Step7Ref {
  submitForm: () => void;
  isValid: boolean;
}

const Step7_FamilyInfo = forwardRef<Step7Ref, Step7Props>(({ initialValues, onSubmit }, ref) => {
  const formikRef = useRef<FormikProps<Step7Data>>(null);

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      formikRef.current?.submitForm();
    },
    isValid: formikRef.current?.isValid ?? false,
  }));

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Информация о семье</h2>
      <p className="text-gray-600 mb-6">
        Пожалуйста, предоставьте информацию о вашей семье и родственниках в США.
      </p>

      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        validationSchema={step7Schema}
        onSubmit={onSubmit}
      >
        {({ values }) => (
          <Form>
            <div className="grid grid-cols-1 gap-4">
              {/* Информация о супруге */}
              <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Информация о супруге</h3>
                
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Field
                      type="checkbox"
                      id="hasSpouse"
                      name="hasSpouse"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="hasSpouse" className="ml-2 block text-gray-700 font-medium">
                      У вас есть/была супруг(а)?
                    </label>
                  </div>
                  <div className="text-sm text-gray-500 italic">
                    Примечание: Если вы ранее выбрали &quot;Незамужем/холост&quot;, но хотите указать информацию о бывшем супруге, 
                    пожалуйста, отметьте этот пункт.
                  </div>
                </div>

                {values.hasSpouse && (
                  <div className="space-y-4">
                    <div className="mb-4">
                      <label htmlFor="spouseFullName" className="block text-gray-700 font-medium mb-2">
                        ФИО супруга(и)
                      </label>
                      <Field
                        type="text"
                        id="spouseFullName"
                        name="spouseFullName"
                        className="form-input"
                      />
                      <ErrorMessage
                        name="spouseFullName"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="spouseDateOfBirth" className="block text-gray-700 font-medium mb-2">
                        Дата рождения супруга(и)
                      </label>
                      <Field
                        type="date"
                        id="spouseDateOfBirth"
                        name="spouseDateOfBirth"
                        className="form-input"
                      />
                      <ErrorMessage
                        name="spouseDateOfBirth"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="spouseCitizenship" className="block text-gray-700 font-medium mb-2">
                        Гражданство супруга(и)
                      </label>
                      <Field
                        type="text"
                        id="spouseCitizenship"
                        name="spouseCitizenship"
                        className="form-input"
                      />
                      <ErrorMessage
                        name="spouseCitizenship"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <Field
                          type="checkbox"
                          id="wasSpouseInUSA"
                          name="wasSpouseInUSA"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="wasSpouseInUSA" className="ml-2 block text-gray-700 font-medium">
                          Был(а) ли супруг(а) в США ранее?
                        </label>
                      </div>
                    </div>

                    {values.wasSpouseInUSA && (
                      <div className="p-4 border border-gray-200 rounded-md">
                        <div className="mb-4">
                          <label htmlFor="spouseUSAEntryDate" className="block text-gray-700 font-medium mb-2">
                            Дата прибытия (ДД-МММ-ГГГГ)
                          </label>
                          <Field
                            type="date"
                            id="spouseUSAEntryDate"
                            name="spouseUSAEntryDate"
                            className="form-input"
                          />
                          <ErrorMessage
                            name="spouseUSAEntryDate"
                            component="div"
                            className="text-red-500 text-sm mt-1"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="mb-4">
                            <label htmlFor="spouseUSAStayDuration" className="block text-gray-700 font-medium mb-2">
                              Продолжительность пребывания
                            </label>
                            <Field
                              type="text"
                              id="spouseUSAStayDuration"
                              name="spouseUSAStayDuration"
                              className="form-input"
                            />
                            <ErrorMessage
                              name="spouseUSAStayDuration"
                              component="div"
                              className="text-red-500 text-sm mt-1"
                            />
                          </div>

                          <div className="mb-4">
                            <label htmlFor="spouseUSAStayDurationType" className="block text-gray-700 font-medium mb-2">
                              Единица измерения
                            </label>
                            <Field
                              as="select"
                              id="spouseUSAStayDurationType"
                              name="spouseUSAStayDurationType"
                              className="form-input"
                            >
                              <option value="">Выберите...</option>
                              <option value="years">Лет</option>
                              <option value="months">Месяцев</option>
                              <option value="weeks">Недель</option>
                              <option value="days">Дней</option>
                              <option value="less_than_24h">Менее 24 часов</option>
                            </Field>
                            <ErrorMessage
                              name="spouseUSAStayDurationType"
                              component="div"
                              className="text-red-500 text-sm mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Информация об отце */}
              <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Информация об отце</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label htmlFor="fatherSurname" className="block text-gray-700 font-medium mb-2">
                      Фамилия
                    </label>
                    <Field
                      type="text"
                      id="fatherSurname"
                      name="fatherSurname"
                      className="form-input"
                    />
                    <ErrorMessage
                      name="fatherSurname"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="fatherName" className="block text-gray-700 font-medium mb-2">
                      Имя
                    </label>
                    <Field
                      type="text"
                      id="fatherName"
                      name="fatherName"
                      className="form-input"
                    />
                    <ErrorMessage
                      name="fatherName"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Field
                      type="checkbox"
                      id="isFatherDateOfBirthUnknown"
                      name="isFatherDateOfBirthUnknown"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isFatherDateOfBirthUnknown" className="ml-2 block text-gray-700 font-medium">
                      Неизвестна дата рождения
                    </label>
                  </div>
                </div>

                {!values.isFatherDateOfBirthUnknown && (
                  <div className="mb-4">
                    <label htmlFor="fatherDateOfBirth" className="block text-gray-700 font-medium mb-2">
                      Дата рождения
                    </label>
                    <Field
                      type="date"
                      id="fatherDateOfBirth"
                      name="fatherDateOfBirth"
                      className="form-input"
                    />
                    <ErrorMessage
                      name="fatherDateOfBirth"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Field
                      type="checkbox"
                      id="isFatherInUSA"
                      name="isFatherInUSA"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isFatherInUSA" className="ml-2 block text-gray-700 font-medium">
                      Проживает ли отец в США?
                    </label>
                  </div>

                  {values.isFatherInUSA && (
                    <div className="mt-2">
                      <Field
                        type="text"
                        id="fatherUSAReason"
                        name="fatherUSAReason"
                        placeholder="Причина нахождения в США"
                        className="form-input"
                      />
                      <ErrorMessage
                        name="fatherUSAReason"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Информация о матери */}
              <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Информация о матери</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label htmlFor="motherSurname" className="block text-gray-700 font-medium mb-2">
                      Фамилия
                    </label>
                    <Field
                      type="text"
                      id="motherSurname"
                      name="motherSurname"
                      className="form-input"
                    />
                    <ErrorMessage
                      name="motherSurname"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="motherName" className="block text-gray-700 font-medium mb-2">
                      Имя
                    </label>
                    <Field
                      type="text"
                      id="motherName"
                      name="motherName"
                      className="form-input"
                    />
                    <ErrorMessage
                      name="motherName"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Field
                      type="checkbox"
                      id="isMotherDateOfBirthUnknown"
                      name="isMotherDateOfBirthUnknown"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isMotherDateOfBirthUnknown" className="ml-2 block text-gray-700 font-medium">
                      Неизвестна дата рождения
                    </label>
                  </div>
                </div>

                {!values.isMotherDateOfBirthUnknown && (
                  <div className="mb-4">
                    <label htmlFor="motherDateOfBirth" className="block text-gray-700 font-medium mb-2">
                      Дата рождения
                    </label>
                    <Field
                      type="date"
                      id="motherDateOfBirth"
                      name="motherDateOfBirth"
                      className="form-input"
                    />
                    <ErrorMessage
                      name="motherDateOfBirth"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Field
                      type="checkbox"
                      id="isMotherInUSA"
                      name="isMotherInUSA"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isMotherInUSA" className="ml-2 block text-gray-700 font-medium">
                      Проживает ли мать в США?
                    </label>
                  </div>

                  {values.isMotherInUSA && (
                    <div className="mt-2">
                      <Field
                        type="text"
                        id="motherUSAReason"
                        name="motherUSAReason"
                        placeholder="Причина нахождения в США"
                        className="form-input"
                      />
                      <ErrorMessage
                        name="motherUSAReason"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Информация о родственниках в США */}
              <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                <div className="mb-4">
                  <label htmlFor="hasRelativesInUSA" className="block text-gray-700 font-medium mb-2">
                    У вас есть родственники в США?
                  </label>
                  <div className="mt-2">
                    <label className="inline-flex items-center mr-4">
                      <Field type="radio" name="hasRelativesInUSA" value="true" className="form-radio" />
                      <span className="ml-2">Да</span>
                    </label>
                    <label className="inline-flex items-center">
                      <Field type="radio" name="hasRelativesInUSA" value="false" className="form-radio" />
                      <span className="ml-2">Нет</span>
                    </label>
                  </div>
                  <ErrorMessage name="hasRelativesInUSA" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {values.hasRelativesInUSA === true && (
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Информация о родственниках в США
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                      Пожалуйста, укажите всех родственников, которые легально находятся в США (имеют статус &ldquo;Green Card&rdquo; или являются гражданами США)
                    </p>

                    <FieldArray name="relatives">
                      {({ push, remove }) => (
                        <div>
                          {values.relatives && values.relatives.length > 0 ? (
                            values.relatives.map((relative, index) => (
                              <div key={index} className="flex flex-col md:flex-row gap-4 mb-4">
                                <div className="flex-1">
                                  <Field
                                    type="text"
                                    name={`relatives.${index}.name`}
                                    placeholder="ФИО родственника"
                                    className="form-input"
                                  />
                                  <ErrorMessage
                                    name={`relatives.${index}.name`}
                                    component="div"
                                    className="text-red-500 text-sm mt-1"
                                  />
                                </div>
                                <div className="flex-1">
                                  <Field
                                    type="text"
                                    name={`relatives.${index}.relationship`}
                                    placeholder="Кем приходится (брат, сестра и т.д.)"
                                    className="form-input"
                                  />
                                  <ErrorMessage
                                    name={`relatives.${index}.relationship`}
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
                            <div className="text-gray-500 mb-2">Нет добавленных родственников</div>
                          )}
                          <button
                            type="button"
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                            onClick={() => push({ name: '', relationship: '' })}
                          >
                            Добавить родственника
                          </button>
                        </div>
                      )}
                    </FieldArray>
                    {values.relatives && values.relatives.length === 0 && (
                      <ErrorMessage
                        name="relatives"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    )}
                  </div>
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

Step7_FamilyInfo.displayName = 'Step7_FamilyInfo';

export default Step7_FamilyInfo;