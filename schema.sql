create table if not exists todos (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title VARCHAR ( 255 ) NOT NULL,
  done BOOL,
  user_id VARCHAR (255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1st enable row level security for your table      
alter table todos enable row level security;
  
-- 2nd create policies for your table
create policy "Individuals can create todos." on todos for
  insert with check (auth.user_id() = user_id);
  
create policy "Individuals can view their own todos. " on todos for
  select using (auth.user_id() = user_id);
  
create policy "Individuals can update their own todos." on todos for
  update using (auth.user_id() = user_id);
  
create policy "Individuals can delete their own todos." on todos for
  delete using (auth.user_id() = user_id);

ALTER DEFAULT PRIVILEGES 
  IN SCHEMA public 
  GRANT SELECT, UPDATE, INSERT, DELETE ON TABLES 
  TO authenticated;
ALTER DEFAULT PRIVILEGES 
  IN SCHEMA public 
  GRANT SELECT, UPDATE, INSERT, DELETE ON TABLES 
  TO anonymous;