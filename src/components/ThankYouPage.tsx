import React from 'react';
import Head from 'next/head';

interface ThankYouPageProps {
  agentId: string;
  userPhone?: string;
}

const ThankYouPage: React.FC<ThankYouPageProps> = ({ agentId, userPhone: _userPhone }) => {
  const handleWhatsAppRedirect = () => {
    // Create WhatsApp message with agent ID for reference
    const message = encodeURIComponent(
      `Здравствуйте! Я заполнил анкету на визу. Мой ID: ${agentId}`
    );

    // WhatsApp business number - replace with actual number
    const whatsappNumber = '+77064172408'; // Replace with actual WhatsApp business number
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${message}`;

    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
  };

  const handleStartNewForm = () => {
    // Clear localStorage and reload page to start fresh
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <>
      <Head>
        <title>Спасибо за заполнение анкеты!</title>
        <meta name="description" content="Анкета успешно заполнена" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Thank You Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Спасибо за заполнение анкеты!
          </h1>

          <p className="text-gray-600 mb-6">
            Ваша анкета успешно отправлена. Наш специалист свяжется с вами в ближайшее время для дальнейшей обработки вашего заявления.
          </p>

          {/* Agent ID for reference */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Номер вашей заявки:</p>
            <p className="font-mono text-sm text-gray-800 break-all">{agentId}</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* WhatsApp Button */}
            <button
              onClick={handleWhatsAppRedirect}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              <span>Связаться через WhatsApp</span>
            </button>

            {/* New Form Button */}
            <button
              onClick={handleStartNewForm}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Заполнить новую анкету
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Если у вас есть вопросы, вы можете связаться с нами через WhatsApp или по телефону.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ThankYouPage;
