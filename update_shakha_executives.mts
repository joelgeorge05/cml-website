import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const shakhaData = [
  {
    name_keyword: 'Thommankuthu',
    director_name: 'Fr. James Aikkaramattam',
    director_phone: '9446131957',
    joint_director_name: 'Sr. Mable FCC',
    joint_director_phone: '8078262169',
    president_name: 'Alex Jojo',
    president_phone: '9656405484',
  },
  {
    name_keyword: 'Koduvely',
    director_name: 'Fr Babu Mattathil CMI',
    director_phone: '9847433009',
    joint_director_name: 'Sr Amal Mariya SABS',
    joint_director_phone: '8157830360',
    president_name: 'Luswin Jaison',
    president_phone: '8078811268',
  },
  {
    name_keyword: 'Kaliyar',
    director_name: 'Fr. Thomas Pothanamuzhi',
    director_phone: '9447822014',
    joint_director_name: 'Sr. Rosmy SABS',
    joint_director_phone: '8075654816',
    president_name: 'Christo Joby',
    president_phone: '8590896705',
  },
  {
    name_keyword: 'Thennathoor',
    director_name: 'Fr Sebastian Thumbamattathil',
    director_phone: '8281136402',
    joint_director_name: 'Sr. Elsa Grace FCC',
    joint_director_phone: '7034477042',
    president_name: 'Georgin Jinish',
    president_phone: '8606279172',
  },
  {
    name_keyword: 'Vannappuram',
    director_name: 'Fr. Jacob Rathapillil',
    director_phone: '9947511494',
    joint_director_name: 'Sr. Daisa SD',
    joint_director_phone: '7560854415',
    president_name: 'Jeevan K J',
    president_phone: '9496089092',
  },
  {
    name_keyword: 'Paingottoor',
    director_name: 'Fr. Kuriakose Kodakkallil',
    director_phone: '9447523068',
    joint_director_name: 'Sr. Soumya FCC',
    joint_director_phone: '7306518880',
    president_name: 'Alen Emmanuel Boby',
    president_phone: '7994080020',
  },
  {
    name_keyword: 'Mullaringad',
    director_name: 'Fr Jacob Vattapillil',
    director_phone: '9961014934',
    joint_director_name: 'Sr Anupama SD',
    joint_director_phone: '6282537483',
    president_name: 'Amal Joshy',
    president_phone: '7510209472',
  },
  {
    name_keyword: 'Rajagiri',
    director_name: 'Fr. Sebastian Konthenpillil',
    director_phone: '9747499241',
    joint_director_name: 'Sr. Jeena Paul CMC',
    joint_director_phone: '7907816095',
    president_name: 'Antony J Chacko',
    president_phone: '9747499241',
  },
  {
    name_keyword: 'Mundanmudy',
    director_name: 'Fr Joseph Kochuputhanpurackal',
    director_phone: '9539881850',
    joint_director_name: 'Sr. Sherin SABS',
    joint_director_phone: '8281619541',
    president_name: 'Jeswin Jinson',
    president_phone: '9447876965',
  },
  {
    name_keyword: 'Njarakkad',
    director_name: 'Fr Antony Ovelil',
    director_phone: '7909246103',
    joint_director_name: 'Sr Nirmal SH',
    joint_director_phone: '8943898014',
    president_name: 'Savio Jojo',
    president_phone: '8590383939',
  },
  {
    name_keyword: 'Kadavoor',
    director_name: 'Fr Mathew Edattu',
    director_phone: '8113032243',
    joint_director_name: 'Jilsha George',
    joint_director_phone: '9605085935',
    president_name: 'George Baby',
    president_phone: '9562381251',
  },
  {
    name_keyword: 'Kodikula',
    director_name: 'Fr Johnson Pazhayapeedikayil',
    director_phone: '8304962687',
    joint_director_name: 'Mrs Mini Babu',
    joint_director_phone: '9495684460',
    president_name: 'Jose Juby',
    president_phone: '9447823623',
  },
  {
    name_keyword: 'Punnamattom',
    director_name: 'Fr. John Kadavan',
    director_phone: '9446801191',
    joint_director_name: 'Gisha Shaji',
    joint_director_phone: '9207330608',
    president_name: 'Alwin Vincent',
    president_phone: '9061370062',
  },
];

async function updateShakhas() {
  // First, fetch all units to see their names
  const { data: units, error } = await supabase.from('units').select('id, name');
  if (error) { console.error('Fetch error:', error); return; }
  
  console.log('Found units:', units.map(u => u.name));

  for (const shakha of shakhaData) {
    const match = units.find(u =>
      u.name.toLowerCase().includes(shakha.name_keyword.toLowerCase())
    );
    if (!match) {
      console.warn(`⚠️  No match found for keyword: ${shakha.name_keyword}`);
      continue;
    }

    const { error: updateError } = await supabase
      .from('units')
      .update({
        director_name: shakha.director_name,
        director_phone: shakha.director_phone,
        joint_director_name: shakha.joint_director_name,
        joint_director_phone: shakha.joint_director_phone,
        president_name: shakha.president_name,
        president_phone: shakha.president_phone,
      })
      .eq('id', match.id);

    if (updateError) {
      console.error(`❌ Failed to update ${match.name}:`, updateError.message);
    } else {
      console.log(`✅ Updated: ${match.name}`);
    }
  }

  console.log('\nDone!');
}

updateShakhas();
