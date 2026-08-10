import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const creators = [
  {
    email: 'sarah.fitness@example.com',
    password: 'password123',
    fullName: 'Sarah Jenkins',
    bio: 'Fitness and wellness enthusiast sharing daily workouts and healthy recipes. Partnering with top wellness brands.',
    nicheCategories: ['Fitness', 'Wellness', 'Lifestyle'],
    totalEarnings: 14250.00,
    avatarUrl: 'https://i.pravatar.cc/150?u=sarah',
    socialLinks: { instagram: '@sarah.fit', tiktok: '@sarahj.fit' }
  },
  {
    email: 'mike.tech@example.com',
    password: 'password123',
    fullName: 'Mike Roberts',
    bio: 'Tech reviewer and gadget lover. Detailed hardware reviews and software tutorials.',
    nicheCategories: ['Tech', 'Gaming', 'Education'],
    totalEarnings: 8400.00,
    avatarUrl: 'https://i.pravatar.cc/150?u=mike',
    socialLinks: { youtube: '@miketech', twitter: '@mroberts_tech' }
  },
  {
    email: 'emma.style@example.com',
    password: 'password123',
    fullName: 'Emma Watson',
    bio: 'Sustainable fashion and minimalist lifestyle. Helping brands reach conscious consumers.',
    nicheCategories: ['Fashion', 'Sustainability', 'Beauty'],
    totalEarnings: 21500.00,
    avatarUrl: 'https://i.pravatar.cc/150?u=emma',
    socialLinks: { instagram: '@emma.style' }
  },
  {
    email: 'david.travel@example.com',
    password: 'password123',
    fullName: 'David Chen',
    bio: 'Digital nomad exploring the world. High-quality drone photography and travel guides.',
    nicheCategories: ['Travel', 'Photography', 'Lifestyle'],
    totalEarnings: 5200.00,
    avatarUrl: 'https://i.pravatar.cc/150?u=david',
    socialLinks: { instagram: '@davidchen.explores', youtube: '@davidtravels' }
  }
];

async function seed() {
  console.log("Starting creator seed...");

  for (const creator of creators) {
    console.log(`Creating auth user: ${creator.email}`);
    
    // Create user and inject all profile data into user_metadata
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: creator.email,
      password: creator.password,
      email_confirm: true,
      user_metadata: {
        full_name: creator.fullName,
        role: 'creator',
        bio: creator.bio,
        niche_categories: creator.nicheCategories,
        total_earnings: creator.totalEarnings,
        avatar_url: creator.avatarUrl,
        social_links: creator.socialLinks,
        is_seeded: true
      }
    });

    if (authError) {
      if ((authError as any).code === 'email_exists' || authError.message.includes('already registered')) {
        console.log(`User ${creator.email} already exists, updating metadata...`);
        // If they exist, let's find them and update them.
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = usersData.users.find(u => u.email === creator.email);
        if (existingUser) {
          await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
            user_metadata: {
              full_name: creator.fullName,
              role: 'creator',
              bio: creator.bio,
              niche_categories: creator.nicheCategories,
              total_earnings: creator.totalEarnings,
              avatar_url: creator.avatarUrl,
              social_links: creator.socialLinks,
              is_seeded: true
            }
          });
          console.log(`Updated existing user ${creator.email}`);
        }
        continue;
      }
      console.error(`Failed to create ${creator.email}:`, authError);
      continue;
    }

    console.log(`Successfully seeded ${creator.fullName}`);
  }

  console.log("Seed complete.");
}

seed().catch(console.error);
