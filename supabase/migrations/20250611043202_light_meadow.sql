/*
  # Create chapters table for reading application

  1. New Tables
    - `chapters`
      - `id` (uuid, primary key)
      - `name` (text, chapter title)
      - `title` (text, alternative title field)
      - `subtitle` (text, optional subtitle)
      - `author` (text, chapter author)
      - `content` (text, chapter content)
      - `category` (text, chapter category)
      - `tags` (text array, chapter tags)
      - `difficulty` (text, difficulty level)
      - `estimated_read_time` (integer, reading time in minutes)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `chapters` table
    - Add policies for public read access
    - Add policies for authenticated users to manage chapters
*/

CREATE TABLE IF NOT EXISTS chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text,
  subtitle text,
  author text NOT NULL DEFAULT 'Anonymous',
  content text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  tags text[] DEFAULT '{}',
  difficulty text NOT NULL DEFAULT 'Beginner' CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  estimated_read_time integer NOT NULL DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- Policies for public read access
CREATE POLICY "Anyone can read chapters"
  ON chapters
  FOR SELECT
  TO public
  USING (true);

-- Policies for authenticated users to manage chapters
CREATE POLICY "Authenticated users can insert chapters"
  ON chapters
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update chapters"
  ON chapters
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete chapters"
  ON chapters
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();