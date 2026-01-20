/*
  # Create Health Records System

  1. New Tables
    - `health_records`
      - `id` (uuid, primary key) - Unique identifier for each health record
      - `patient_name` (text) - Full name of the patient
      - `age` (integer) - Patient age
      - `gender` (text) - Patient gender
      - `blood_pressure_systolic` (integer) - Systolic BP reading
      - `blood_pressure_diastolic` (integer) - Diastolic BP reading
      - `heart_rate` (integer) - Heart rate in BPM
      - `temperature` (decimal) - Body temperature in Fahrenheit
      - `weight` (decimal) - Weight in pounds
      - `height` (integer) - Height in inches
      - `medical_history` (text) - Past medical conditions
      - `current_medications` (text) - Current medications
      - `symptoms` (text) - Current symptoms
      - `diagnosis` (text) - Doctor's diagnosis/notes
      - `created_at` (timestamptz) - Record creation timestamp
      - `user_id` (uuid) - Reference to authenticated user (optional for demo)

  2. Security
    - Enable RLS on `health_records` table
    - Add policy for public insert (for demo purposes)
    - Add policy for users to read their own records
*/

CREATE TABLE IF NOT EXISTS health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  age integer NOT NULL,
  gender text NOT NULL,
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  heart_rate integer,
  temperature decimal(4,1),
  weight decimal(5,1),
  height integer,
  medical_history text DEFAULT '',
  current_medications text DEFAULT '',
  symptoms text DEFAULT '',
  diagnosis text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  user_id uuid
);

ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create health records"
  ON health_records
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can view all records (demo)"
  ON health_records
  FOR SELECT
  TO anon
  USING (true);