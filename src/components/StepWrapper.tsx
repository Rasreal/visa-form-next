import React, { ReactNode } from 'react';

interface StepWrapperProps {
  title: string;
  step: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSubmitForm?: () => void;
  canGoNext: boolean;
  isFormValid?: boolean;
  children: ReactNode;
}

const StepWrapper: React.FC<StepWrapperProps> = ({
  title,
  step,
  totalSteps,
  onNext,
  onPrev,
  onSubmitForm,
  canGoNext,
  isFormValid = true,
  children,
}) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl mx-auto my-8 border-2 border-primary-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-800 mb-4">{title}</h1>
        <div className="flex items-center mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary-600 h-2.5 rounded-full"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-600 ml-2 font-medium">
            {step} из {totalSteps}
          </span>
        </div>
      </div>

      <div className="mb-6 border-t border-b border-gray-200 py-6">{children}</div>

      <div className="flex justify-between mt-8">
        {step > 1 ? (
          <button
            onClick={onPrev}
            className="bg-white text-primary-700 border border-primary-300 hover:bg-primary-50 px-4 py-2 rounded-md shadow-sm"
            type="button"
          >
            Назад
          </button>
        ) : (
          <div></div>
        )}
        <button
          onClick={() => {
            if (onSubmitForm) {
              onSubmitForm();
            } else {
              onNext();
            }
          }}
          className={`bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md shadow-sm ${!canGoNext || !isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!canGoNext || !isFormValid}
          type="button"
        >
          {step === totalSteps ? 'Завершить' : 'Далее'}
        </button>
      </div>
    </div>
  );
};

export default StepWrapper;