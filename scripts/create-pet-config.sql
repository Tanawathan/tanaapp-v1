-- 配置寵物互動參數
create table if not exists public.pet_action_config (
  action text primary key,
  hunger_change int default 0,         -- 正數表示 +hunger (更餓)，負數表示降低飢餓
  happiness_change int default 0,
  energy_change int default 0,
  health_change int default 0,
  experience_gain int default 0,
  chat_skill_change int default 0,
  service_skill_change int default 0,
  loyalty_skill_change int default 0,
  min_energy int default 0,            -- 動作需要的最小能量
  min_hunger int default 0,            -- 動作需要的最小飢餓值(例如餵食需要飢餓 > X)
  description text
);

-- 初始資料 (可依需要調整)
insert into public.pet_action_config(action,hunger_change,happiness_change,energy_change,health_change,experience_gain,chat_skill_change,service_skill_change,loyalty_skill_change,min_energy,min_hunger,description) values
  ('feed', -30, 15, 10, 0, 10, 0, 0, 0, 0, 10, '餵食: 降低飢餓, 提升快樂/能量'),
  ('pet', 0, 10, 0, 0, 5, 0, 0, 1, 0, 0, '撫摸: 提升快樂/忠誠'),
  ('play', 0, 20, -15, 0, 15, 0, 1, 0, 20, 0, '玩耍: 消耗能量, 提升快樂/服務技能'),
  ('chat', 0, 5, 0, 0, 8, 1, 0, 0, 0, 0, '聊天: 提升快樂/聊天技能'),
  ('exercise', 0, 0, -25, 10, 12, 0, 0, 0, 30, 0, '運動: 消耗能量, 提升健康'),
  ('rest', 0, 0, 30, 5, 0, 0, 0, 0, 0, 0, '休息: 恢復能量/些微健康')
  on conflict (action) do nothing;

-- 等級成長配置
create table if not exists public.pet_leveling_config (
  id int primary key default 1,
  experience_multiplier numeric not null default 1.2
);
insert into public.pet_leveling_config(id,experience_multiplier) values (1,1.2) on conflict (id) do nothing;
