-- Supabase 대시보드 > SQL Editor 에서 실행하세요.
create table if not exists workout_logs (
  id bigint generated always as identity primary key,
  nickname text not null default '익명',
  log_date date not null default current_date,
  exercise text not null,
  set_no int not null default 1,
  weight numeric,
  reps int,
  condition text,
  created_at timestamptz not null default now()
);

alter table workout_logs enable row level security;

-- 수업/개인용: 누구나 읽고 쓰기 (anon 키). 공개 서비스라면 인증을 붙이세요.
create policy "anon all" on workout_logs for all using (true) with check (true);
