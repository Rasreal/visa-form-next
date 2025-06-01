-- Supabase SQL setup for Visa Application project

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create visa_applications table
CREATE TABLE IF NOT EXISTS public.visa_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  step_status INTEGER NOT NULL DEFAULT 1,
  uploaded_files JSONB NOT NULL DEFAULT '{}'::jsonb,
  whatsapp_redirected BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster searches by agent_id
CREATE INDEX IF NOT EXISTS idx_visa_applications_agent_id ON public.visa_applications(agent_id);

-- Create storage bucket policies
-- First, create the buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('passport_documents', 'Passport Documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('supporting_documents', 'Supporting Documents', false)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS (Row Level Security) policies

-- Enable RLS
ALTER TABLE public.visa_applications ENABLE ROW LEVEL SECURITY;

-- Create policy for read access to visa_applications
CREATE POLICY "Read visa applications by agent_id"
  ON public.visa_applications
  FOR SELECT
  USING (auth.uid()::text = agent_id);

-- Create policy for insert access to visa_applications
CREATE POLICY "Insert visa applications"
  ON public.visa_applications
  FOR INSERT
  WITH CHECK (auth.uid()::text = agent_id);

-- Create policy for update access to visa_applications
CREATE POLICY "Update visa applications by agent_id"
  ON public.visa_applications
  FOR UPDATE
  USING (auth.uid()::text = agent_id)
  WITH CHECK (auth.uid()::text = agent_id);

-- Storage bucket policies for passport_documents
CREATE POLICY "Read passport documents"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'passport_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Insert passport documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'passport_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage bucket policies for supporting_documents
CREATE POLICY "Read supporting documents"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'supporting_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Insert supporting documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'supporting_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create OCR history table to track document processing
CREATE TABLE IF NOT EXISTS public.ocr_processing_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT NOT NULL,
  document_type TEXT NOT NULL,
  document_path TEXT NOT NULL,
  processing_status TEXT NOT NULL,
  extracted_data JSONB DEFAULT NULL,
  error_message TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster searches by agent_id in OCR history
CREATE INDEX IF NOT EXISTS idx_ocr_history_agent_id ON public.ocr_processing_history(agent_id);

-- Enable RLS on OCR history
ALTER TABLE public.ocr_processing_history ENABLE ROW LEVEL SECURITY;

-- Create policy for read access to OCR history
CREATE POLICY "Read OCR history by agent_id"
  ON public.ocr_processing_history
  FOR SELECT
  USING (auth.uid()::text = agent_id);

-- Create policy for insert access to OCR history
CREATE POLICY "Insert OCR history"
  ON public.ocr_processing_history
  FOR INSERT
  WITH CHECK (auth.uid()::text = agent_id); 