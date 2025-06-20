import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikProps } from 'formik';
import { step2Schema } from '../utils/validations';
import FileUpload from './FileUpload';
import { ExtractedDocumentData } from '../utils/ocr';
import { Step2Data } from '../utils/types';

export interface Step2Ref {
  submitForm: () => void;
  isValid: boolean;
}

interface Step2Props {
  initialValues: Step2Data;
  onSubmit: (values: Step2Data) => void;
  uploadedFiles: { [key: string]: string };
  setUploadedFiles: (files: { [key: string]: string }) => void;
  deployedMode?: boolean;
}

const Step2_DocumentUpload = forwardRef<Step2Ref, Step2Props>(({
  initialValues,
  onSubmit,
  uploadedFiles,
  setUploadedFiles,
  deployedMode = false,
}, ref) => {
  const [formValues, setFormValues] = useState(initialValues);
  const formikRef = useRef<FormikProps<Step2Data>>(null);
  const [isDocumentUploaded, setIsDocumentUploaded] = useState(false);

  useEffect(() => {
    // Check if at least one document is uploaded
    const hasUploads = Object.keys(uploadedFiles).length > 0;
    setIsDocumentUploaded(hasUploads);
  }, [uploadedFiles]);

  // Add a function to check if we have enough data to proceed
  const canProceed = () => {
    // We can proceed if at least one document is uploaded
    return Object.keys(uploadedFiles).length > 0;
  };

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      if (formikRef.current) {
        formikRef.current.submitForm();
      }
    },
    // Allow proceeding if we have uploads, even if form validation fails
    isValid: canProceed() || (formikRef.current?.isValid && isDocumentUploaded) || false,
  }));

  const handleDocumentExtract = (documentType: string, data: ExtractedDocumentData, filePath?: string) => {
    console.log(`Document ${documentType} extracted:`, { 
      data: data ? 'present' : 'missing', 
      filePath: filePath ? 'present' : 'missing',
      dataFields: data ? Object.keys(data) : []
    });
    
    // Always mark as uploaded if we have a file path, even if OCR extraction failed
    if (filePath) {
      // Update uploaded files tracking
      setUploadedFiles({
        ...uploadedFiles,
        [documentType]: filePath,
      });
      
      // Show success message
      setIsDocumentUploaded(true);
      
      // Only update form values if data is actually extracted
      if (data && Object.keys(data).length > 0) {
        setFormValues((prev) => ({
          ...prev,
          ...data,
        }));
      } else {
        console.log('No OCR data extracted, but file was uploaded successfully');
      }
    } else {
      console.warn(`Document ${documentType} upload failed: No file path returned`);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Загрузите документы</h2>
      <p className="text-gray-600 mb-6">
        Пожалуйста, загрузите скан или фото вашего паспорта и удостоверения личности.
        Мы автоматически извлечем данные, которые вы сможете проверить и отредактировать.
        <br />
        <strong>Примечание:</strong> Достаточно указать номер паспорта ИЛИ номер удостоверения личности.
      </p>

      {isDocumentUploaded && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Документ успешно загружен! Вы можете продолжить после заполнения данных.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <FileUpload
          label="Загрузите скан/фото паспорта"
          name="passport"
          onExtract={(data, filePath) => handleDocumentExtract('passport', data, filePath)}
          deployedMode={deployedMode}
        />

        <FileUpload
          label="Загрузите скан/фото удостоверения личности"
          name="idCard"
          onExtract={(data, filePath) => handleDocumentExtract('idCard', data, filePath)}
          deployedMode={deployedMode}
        />
      </div>

      {!isDocumentUploaded && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Требуется:</strong> Необходимо загрузить хотя бы один документ для перехода к следующему шагу.
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Если возникает ошибка при загрузке, попробуйте уменьшить размер файла или выбрать другой формат (JPG вместо PDF).
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Проверьте и отредактируйте данные
        </h3>

        <Formik
          innerRef={formikRef}
          initialValues={formValues}
          validationSchema={step2Schema}
          onSubmit={(values) => {
            if (isDocumentUploaded) {
              onSubmit(values);
            }
          }}
          enableReinitialize
        >
          {({ isValid: _isValid }) => (
            <Form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="surname" className="block text-gray-700 font-medium mb-2">
                    Фамилия (Surname)
                  </label>
                  <Field
                    type="text"
                    id="surname"
                    name="surname"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="surname"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                    Имя (Name)
                  </label>
                  <Field
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="dateOfBirth" className="block text-gray-700 font-medium mb-2">
                    Дата рождения
                  </label>
                  <Field
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="dateOfBirth"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="citizenship" className="block text-gray-700 font-medium mb-2">
                    Гражданство
                  </label>
                  <Field
                    type="text"
                    id="citizenship"
                    name="citizenship"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="citizenship"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="passportNumber" className="block text-gray-700 font-medium mb-2">
                    Номер паспорта <span className="text-gray-500 text-sm">(или номер удостоверения)</span>
                  </label>
                  <Field
                    type="text"
                    id="passportNumber"
                    name="passportNumber"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="passportNumber"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="passportIssueDate" className="block text-gray-700 font-medium mb-2">
                    Дата выдачи паспорта
                  </label>
                  <Field
                    type="date"
                    id="passportIssueDate"
                    name="passportIssueDate"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="passportIssueDate"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="passportExpiryDate" className="block text-gray-700 font-medium mb-2">
                    Дата окончания паспорта
                  </label>
                  <Field
                    type="date"
                    id="passportExpiryDate"
                    name="passportExpiryDate"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="passportExpiryDate"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="iin" className="block text-gray-700 font-medium mb-2">
                    ИИН
                  </label>
                  <Field
                    type="text"
                    id="iin"
                    name="iin"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="iin"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="idNumber" className="block text-gray-700 font-medium mb-2">
                    Номер удостоверения личности <span className="text-gray-500 text-sm">(или номер паспорта)</span>
                  </label>
                  <Field
                    type="text"
                    id="idNumber"
                    name="idNumber"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="idNumber"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
});

Step2_DocumentUpload.displayName = 'Step2_DocumentUpload';

export default Step2_DocumentUpload;