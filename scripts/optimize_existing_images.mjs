import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function optimizeOfficeBearers() {
  console.log('--- OPTIMIZING OFFICE BEARERS ---');
  const { data: bearers, error } = await supabase.from('office_bearers').select('*');
  if (error) {
    console.error('Error fetching bearers:', error);
    return;
  }

  console.log(`Found ${bearers.length} bearers. Checking photos...`);

  for (const bearer of bearers) {
    const url = bearer.photo_url;
    if (!url) continue;

    if (url.includes('supabase.co/storage/v1/object/public/images/') && !url.endsWith('.webp')) {
      console.log(`Optimizing photo for ${bearer.name}: ${url}`);

      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.error(`Failed to fetch image for ${bearer.name}`);
          continue;
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Compress and resize to 300x300 (square profile) at 80% quality
        const compressedBuffer = await sharp(buffer)
          .resize(300, 300, { fit: 'cover' })
          .webp({ quality: 80 })
          .toBuffer();

        const bucketName = 'images';
        const newFileName = `bearers/${bearer.id}_optimized.webp`;

        console.log(`Uploading optimized WebP for ${bearer.name}...`);
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(newFileName, compressedBuffer, {
            contentType: 'image/webp',
            upsert: true,
          });

        if (uploadError) {
          console.error(`Upload error for ${bearer.name}:`, uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(newFileName);

        console.log(`Updating database photoUrl for ${bearer.name} to: ${publicUrl}`);
        const { error: updateError } = await supabase
          .from('office_bearers')
          .update({ photo_url: publicUrl })
          .eq('id', bearer.id);

        if (updateError) {
          console.error(`Update error for ${bearer.name}:`, updateError);
        } else {
          console.log(`Successfully optimized ${bearer.name}!`);
        }
      } catch (err) {
        console.error(`Error processing ${bearer.name}:`, err);
      }
    } else {
      console.log(`Skipping ${bearer.name} (already optimized or external url)`);
    }
  }
}

async function optimizeShakhas() {
  console.log('\n--- OPTIMIZING SHAKHAS ---');
  const { data: units, error } = await supabase.from('units').select('*');
  if (error) {
    console.error('Error fetching units:', error);
    return;
  }

  console.log(`Found ${units.length} units. Checking photos...`);

  for (const unit of units) {
    const url = unit.bg_photo;
    if (!url) continue;

    if (url.includes('supabase.co/storage/v1/object/public/images/') && !url.endsWith('.webp')) {
      console.log(`Optimizing photo for unit ${unit.name}: ${url}`);

      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.error(`Failed to fetch image for ${unit.name}`);
          continue;
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Compress and resize to 800px width (landscape banner) at 80% quality
        const compressedBuffer = await sharp(buffer)
          .resize(800, null, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();

        const bucketName = 'images';
        const newFileName = `shakhas/${unit.id}_optimized.webp`;

        console.log(`Uploading optimized WebP for ${unit.name}...`);
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(newFileName, compressedBuffer, {
            contentType: 'image/webp',
            upsert: true,
          });

        if (uploadError) {
          console.error(`Upload error for ${unit.name}:`, uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(newFileName);

        console.log(`Updating database bg_photo for ${unit.name} to: ${publicUrl}`);
        const { error: updateError } = await supabase
          .from('units')
          .update({ bg_photo: publicUrl })
          .eq('id', unit.id);

        if (updateError) {
          console.error(`Update error for ${unit.name}:`, updateError);
        } else {
          console.log(`Successfully optimized ${unit.name}!`);
        }
      } catch (err) {
        console.error(`Error processing ${unit.name}:`, err);
      }
    } else {
      console.log(`Skipping ${unit.name} (already optimized or local/external url: ${url})`);
    }
  }
}

async function run() {
  await optimizeOfficeBearers();
  await optimizeShakhas();
  console.log('\nAll optimizations complete!');
}

run();
