insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recursos',
  'recursos',
  true,
  52428800,
  array[
    'audio/mpeg',
    'audio/mp3',
    'audio/m4a',
    'audio/x-m4a',
    'audio/wav',
    'audio/x-wav',
    'audio/mp4',
    'audio/aac',
    'audio/ogg',
    'audio/webm'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read recursos" on storage.objects;
create policy "Public can read recursos"
on storage.objects
for select
using (bucket_id = 'recursos');

drop policy if exists "Therapists can upload recursos" on storage.objects;
create policy "Therapists can upload recursos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'recursos'
  and exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.rol in ('terapeuta', 'admin')
  )
);

drop policy if exists "Therapists can update recursos" on storage.objects;
create policy "Therapists can update recursos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'recursos'
  and exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.rol in ('terapeuta', 'admin')
  )
)
with check (
  bucket_id = 'recursos'
  and exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.rol in ('terapeuta', 'admin')
  )
);

drop policy if exists "Therapists can delete recursos" on storage.objects;
create policy "Therapists can delete recursos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'recursos'
  and exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.rol in ('terapeuta', 'admin')
  )
);
