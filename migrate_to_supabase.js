import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Replace these with your actual Supabase credentials from the .env file
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌  Missing env vars. Make sure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const DB_FILE = path.join(__dirname, 'db.json');

async function migrate() {
  console.log('🚀 Starting migration from db.json → Supabase...\n');
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));

  // 1. Settings
  if (db.settings) {
    const { error } = await supabase.from('settings').insert([{
      support_desk: db.settings.supportDesk,
      email: db.settings.email,
      motto_primary: db.settings.mottoPrimary,
      motto_secondary: db.settings.mottoSecondary,
      hero_intro: db.settings.heroIntro,
      parish_units_count: db.settings.parishUnitsCount
    }]);
    if (error) console.error('❌ Settings:', error.message);
    else console.log('✅ Settings inserted');
  }

  // 2. Announcements
  if (db.announcements?.length) {
    const data = db.announcements.map(({ id, isSticky, ...r }) => ({ ...r, is_sticky: isSticky }));
    const { error } = await supabase.from('announcements').insert(data);
    if (error) console.error('❌ Announcements:', error.message);
    else console.log(`✅ ${data.length} announcements inserted`);
  }

  // 3. News
  if (db.news?.length) {
    const data = db.news.map(({ id, imageUrl, isFeatured, ...r }) => ({ ...r, image_url: imageUrl, is_featured: isFeatured }));
    const { error } = await supabase.from('news').insert(data);
    if (error) console.error('❌ News:', error.message);
    else console.log(`✅ ${data.length} news items inserted`);
  }

  // 4. Office Bearers
  if (db.officeBearers?.length) {
    const data = db.officeBearers.map(({ id, photoUrl, servicePeriod, orderIndex, houseName, ...r }) => ({
      ...r,
      photo_url: photoUrl,
      service_period: servicePeriod,
      order_index: orderIndex,
      house_name: houseName
    }));
    const { error } = await supabase.from('office_bearers').insert(data);
    if (error) console.error('❌ Office Bearers:', error.message);
    else console.log(`✅ ${data.length} office bearers inserted`);
  }

  // 5. Units
  if (db.units?.length) {
    const data = db.units.map(u => ({
      id: u.id,
      name: u.name,
      patron_saint: u.patronSaint,
      contact_number: u.contactNumber,
      bg_photo: u.bgPhoto,
      stats_members: u.stats?.members ?? 0,
      stats_families: u.stats?.families ?? 0,
      stats_directors_count: u.stats?.directorsCount ?? 0,
      description: u.description,
      order_index: u.orderIndex
    }));
    const { error } = await supabase.from('units').insert(data);
    if (error) console.error('❌ Units:', error.message);
    else console.log(`✅ ${data.length} units inserted`);
  }

  // 6. Events
  if (db.events?.length) {
    const data = db.events.map(({ id, imageUrl, ...r }) => ({ ...r, image_url: imageUrl }));
    const { error } = await supabase.from('events').insert(data);
    if (error) console.error('❌ Events:', error.message);
    else console.log(`✅ ${data.length} events inserted`);
  }

  // 7. Gallery Albums + Images
  if (db.galleryAlbums?.length) {
    for (const album of db.galleryAlbums) {
      const { data: inserted, error } = await supabase
        .from('gallery_albums')
        .insert([{ title: album.title, category: album.category, description: album.description, cover_image_url: album.coverImageUrl }])
        .select().single();
      if (error) { console.error(`❌ Album "${album.title}":`, error.message); continue; }

      if (album.images?.length) {
        const imgs = album.images.map(img => ({ album_id: inserted.id, image_url: img.imageUrl, caption: img.caption }));
        const { error: ie } = await supabase.from('gallery_images').insert(imgs);
        if (ie) console.error(`❌ Images for "${album.title}":`, ie.message);
      }
    }
    console.log(`✅ ${db.galleryAlbums.length} gallery albums inserted`);
  }

  // 8. Downloads
  if (db.downloads?.length) {
    const data = db.downloads.map(d => ({
      title: d.title,
      type: d.category,
      file_url: d.downloadUrl,
      size: d.fileSize,
      date: d.uploadDate
    }));
    const { error } = await supabase.from('downloads').insert(data);
    if (error) console.error('❌ Downloads:', error.message);
    else console.log(`✅ ${data.length} downloads inserted`);
  }

  console.log('\n🎉 Migration complete!');
}

migrate();
