# Visa Application Form

A Next.js application for collecting visa application information with OCR document scanning functionality.

## Features

- Multi-step form for collecting visa application information
- OCR document scanning to extract data from passport and ID card
- Automatic form filling from scanned documents
- Form validation using Formik and Yup
- Storage of application data in Supabase
- WhatsApp integration for support
- Responsive design with TailwindCSS

## Requirements

- Node.js 14.x or higher
- NPM 6.x or higher
- Supabase account

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/visa-form.git
cd visa-form
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Create Supabase tables and storage buckets:

You can use the provided `supabase-setup.sql` file to set up your database schema, or follow these steps:

```sql
CREATE TABLE public.visa_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id TEXT NOT NULL,
  step_status INTEGER DEFAULT 1,
  form_data JSONB DEFAULT '{}'::JSONB,
  uploaded_files JSONB DEFAULT '{}'::JSONB,
  whatsapp_redirected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX visa_applications_agent_id_idx ON public.visa_applications (agent_id);
```

5. Set up Supabase Storage buckets and RLS policies:

   1. Create two storage buckets: `passport_documents` and `supporting_documents`.
   2. Add the following RLS policies to each bucket:

   For `passport_documents`:
   ```sql
   -- Allow anonymous uploads
   CREATE POLICY "Allow insert for all users"
   ON storage.objects
   FOR INSERT
   TO anon, authenticated
   WITH CHECK (bucket_id = 'passport_documents');
   
   -- Allow read access based on agent_id
   CREATE POLICY "Read passport documents"
   ON storage.objects
   FOR SELECT
   USING (bucket_id = 'passport_documents' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

   For `supporting_documents`:
   ```sql
   -- Allow anonymous uploads
   CREATE POLICY "Allow insert for all users"
   ON storage.objects
   FOR INSERT
   TO anon, authenticated
   WITH CHECK (bucket_id = 'supporting_documents');
   
   -- Allow read access based on agent_id
   CREATE POLICY "Read supporting documents"
   ON storage.objects
   FOR SELECT
   USING (bucket_id = 'supporting_documents' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

## Development

To start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000.

## Building for Production

To build the application for production:

```bash
npm run build
```

To start the production server:

```bash
npm run start
```

## Usage

1. Access the form via the URL: `http://localhost:3000/?agent_id=your_agent_id`
2. Fill out each step of the form
3. Upload documents to automatically extract data
4. Submit the form to be redirected to WhatsApp support

## Troubleshooting

### File Upload Issues

If you encounter issues with file uploads:

1. Ensure your Supabase storage buckets have the correct RLS policies
2. Check that the `uploadDir` in `tmp` is writable by the server
3. Review the server logs for detailed error messages
4. Verify that your Supabase project URL and anon key are correct in the `.env` file

## License

This project is licensed under the MIT License - see the LICENSE file for details. 