-- 保留每隻寵物最新 500 筆互動紀錄，刪除更舊的
with ranked as (
  select id, pet_id, created_at,
         row_number() over (partition by pet_id order by created_at desc) as rn
  from public.pet_interactions
)
delete from public.pet_interactions
where id in (
  select id from ranked where rn > 500
);
