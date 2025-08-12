-- Pets core tables
create table if not exists public.virtual_pets (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'default',
  name text not null,
  species text not null,
  level int not null default 1,
  experience int not null default 0,
  experience_to_next int not null default 100,
  health int not null default 100,
  max_health int not null default 100,
  happiness int not null default 80,
  max_happiness int not null default 100,
  energy int not null default 90,
  max_energy int not null default 100,
  hunger int not null default 30,
  max_hunger int not null default 100,
  chat_skill int not null default 5,
  service_skill int not null default 5,
  loyalty_skill int not null default 5,
  mood text not null default 'happy',
  activity text not null default 'chatting',
  last_feed_time timestamptz not null default now() - interval '2 hours',
  last_interaction_time timestamptz not null default now() - interval '30 minutes',
  appearance jsonb not null default jsonb_build_object('color','orange','pattern','standard','accessories','[]','emoji','🦊'),
  total_interactions int not null default 0,
  total_feedings int not null default 0,
  days_alive int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pet_interactions (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.virtual_pets(id) on delete cascade,
  interaction_type text not null,
  experience_gained int not null default 0,
  result text,
  created_at timestamptz not null default now()
);

-- index for user specific queries
create index if not exists idx_virtual_pets_user_id on public.virtual_pets(user_id);
create index if not exists idx_pet_interactions_pet_id on public.pet_interactions(pet_id);

-- simple upsert to ensure default pet
insert into public.virtual_pets (user_id, name, species)
select 'default','阿狸','fox'
where not exists (select 1 from public.virtual_pets where user_id='default');
