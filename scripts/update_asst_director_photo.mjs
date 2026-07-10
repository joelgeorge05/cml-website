/**
 * One-shot script: upload a new photo for the Assistant Director
 * and update their record in the Supabase `office_bearers` table.
 *
 * Usage: node scripts/update_asst_director_photo.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://ayoqlfospgjcklucurig.supabase.co';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5b3FsZm9zcGdqY2tsdWN1cmlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTY4ODI3NCwiZXhwIjoyMDk3MjY0Mjc0fQ.HzoOWTfz9ZGWfLmEzsPld-9sBaF8JHxyCOxYkUQ0AvU';

const IMAGE_PATH =
  'C:\\Users\\Acer\\Downloads\\WhatsApp Image 2026-07-05 at 1.42.42 PM.jpeg';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  // 1. Read the local image file
  console.log('Reading image file...');
  const fileBuffer = readFileSync(IMAGE_PATH);
  const blob = new Blob([fileBuffer], { type: 'image/jpeg' });

  const fileName = `bearers/asst_director_${Date.now()}.jpg`;

  // 2. Upload to Supabase Storage bucket "images"
  console.log('Uploading to Supabase Storage...');
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('images')
    .upload(fileName, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (uploadError) {
    console.error('Upload failed:', uploadError.message);
    process.exit(1);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(fileName);

  console.log('Uploaded! Public URL:', publicUrl);

  // 3. Find the Assistant Director row
  const { data: bearers, error: fetchError } = await supabase
    .from('office_bearers')
    .select('id, name, designation')
    .ilike('designation', '%assistant director%');

  if (fetchError) {
    console.error('Fetch failed:', fetchError.message);
    process.exit(1);
  }

  if (!bearers || bearers.length === 0) {
    console.error('No bearer with designation containing "assistant director" found.');
    console.log('Listing all bearers so you can pick the right ID:');
    const { data: all } = await supabase.from('office_bearers').select('id, name, designation');
    console.table(all);
    process.exit(1);
  }

  console.log('Found bearer(s):', bearers);

  // 4. Update each matching bearer's photoUrl
  for (const bearer of bearers) {
    const { error: updateError } = await supabase
      .from('office_bearers')
      .update({ photo_url: publicUrl })
      .eq('id', bearer.id);

    if (updateError) {
      console.error(`Failed to update ${bearer.name}:`, updateError.message);
    } else {
      console.log(`✅ Updated photo for: ${bearer.name} (${bearer.designation})`);
    }
  }

  console.log('\nDone! Refresh the website to see the new photo.');
}

main().catch(console.error);
