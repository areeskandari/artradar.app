-- Optional: Realtime RAG dataset schema (pgvector-based)
-- Run in Supabase SQL Editor if you want embeddings-based retrieval.
-- Requires: enable extension vector.

create extension if not exists vector;

-- Normalized "documents" for RAG (one row per entity)
create table if not exists rag_documents (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('gallery','event','artist','news')),
  source_id uuid not null,
  title text not null,
  url text,
  content text not null,
  updated_at timestamptz not null default now(),
  unique (source_type, source_id)
);

-- Chunks for embeddings retrieval
create table if not exists rag_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references rag_documents(id) on delete cascade,
  chunk_index int not null,
  chunk_text text not null,
  embedding vector(1536), -- adjust to your embedding model dimension
  created_at timestamptz not null default now()
);

create index if not exists rag_chunks_document_id_idx on rag_chunks(document_id);
create index if not exists rag_chunks_embedding_idx on rag_chunks using ivfflat (embedding vector_cosine_ops);

-- Vector search helper
create or replace function match_rag_chunks(query_embedding vector(1536), match_count int default 10)
returns table (document_id uuid, chunk_text text, similarity float)
language sql
stable
as $$
  select
    document_id,
    chunk_text,
    (1 - (embedding <=> query_embedding))::float as similarity
  from rag_chunks
  where embedding is not null
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- Realtime sync from source tables -> rag_documents
create or replace function refresh_rag_document(p_source_type text, p_source_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title text;
  v_url text;
  v_content text;
begin
  if p_source_type = 'gallery' then
    select
      g.name,
      '/galleries/' || g.slug,
      concat_ws(E'\n',
        'Gallery: ' || g.name,
        case when g.area is null then null else 'Area: ' || g.area end,
        case when g.type is null then null else 'Type: ' || g.type end,
        case when g.address is null then null else 'Address: ' || g.address end,
        case when g.website is null then null else 'Website: ' || g.website end,
        case when g.instagram is null then null else 'Instagram: ' || g.instagram end,
        case when g.description is null then null else 'Description: ' || g.description end
      )
    into v_title, v_url, v_content
    from galleries g
    where g.id = p_source_id;
  elsif p_source_type = 'event' then
    select
      e.title,
      '/events/' || e.slug,
      concat_ws(E'\n',
        'Event: ' || e.title,
        case when e.event_type is null then null else 'Type: ' || e.event_type end,
        case when e.start_date is null then null else 'Start: ' || e.start_date::text end,
        case when e.end_date is null then null else 'End: ' || e.end_date::text end,
        case when e.location is null then null else 'Location: ' || e.location end,
        case when e.ticket_info is null then null else 'Tickets: ' || e.ticket_info end,
        case when e.description is null then null else 'Description: ' || e.description end
      )
    into v_title, v_url, v_content
    from events e
    where e.id = p_source_id;
  elsif p_source_type = 'artist' then
    select
      a.name,
      '/artists/' || a.slug,
      concat_ws(E'\n',
        'Artist: ' || a.name,
        case when a.nationality is null then null else 'Nationality: ' || a.nationality end,
        case when a.city is null then null else 'City: ' || a.city end,
        case when a.website is null then null else 'Website: ' || a.website end,
        case when a.instagram is null then null else 'Instagram: ' || a.instagram end,
        case when a.bio is null then null else 'Bio: ' || a.bio end
      )
    into v_title, v_url, v_content
    from artists a
    where a.id = p_source_id;
  elsif p_source_type = 'news' then
    select
      n.title,
      '/news/' || n.slug,
      concat_ws(E'\n',
        'News: ' || n.title,
        case when n.publish_date is null then null else 'Publish date: ' || n.publish_date::text end,
        case when n.content is null then null else 'Content: ' || n.content end
      )
    into v_title, v_url, v_content
    from news n
    where n.id = p_source_id;
  else
    raise exception 'Unknown source_type %', p_source_type;
  end if;

  if v_title is null then
    delete from rag_documents where source_type = p_source_type and source_id = p_source_id;
    return;
  end if;

  insert into rag_documents (source_type, source_id, title, url, content, updated_at)
  values (p_source_type, p_source_id, v_title, v_url, v_content, now())
  on conflict (source_type, source_id)
  do update set title = excluded.title, url = excluded.url, content = excluded.content, updated_at = now();
end;
$$;

create or replace function rag_on_gallery_change()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'DELETE') then
    delete from rag_documents where source_type = 'gallery' and source_id = old.id;
    return old;
  end if;
  perform refresh_rag_document('gallery', new.id);
  return new;
end;
$$;

create or replace function rag_on_event_change()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'DELETE') then
    delete from rag_documents where source_type = 'event' and source_id = old.id;
    return old;
  end if;
  perform refresh_rag_document('event', new.id);
  return new;
end;
$$;

create or replace function rag_on_artist_change()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'DELETE') then
    delete from rag_documents where source_type = 'artist' and source_id = old.id;
    return old;
  end if;
  perform refresh_rag_document('artist', new.id);
  return new;
end;
$$;

create or replace function rag_on_news_change()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'DELETE') then
    delete from rag_documents where source_type = 'news' and source_id = old.id;
    return old;
  end if;
  perform refresh_rag_document('news', new.id);
  return new;
end;
$$;

drop trigger if exists rag_gallery_trigger on galleries;
create trigger rag_gallery_trigger
after insert or update or delete on galleries
for each row execute function rag_on_gallery_change();

drop trigger if exists rag_event_trigger on events;
create trigger rag_event_trigger
after insert or update or delete on events
for each row execute function rag_on_event_change();

drop trigger if exists rag_artist_trigger on artists;
create trigger rag_artist_trigger
after insert or update or delete on artists
for each row execute function rag_on_artist_change();

drop trigger if exists rag_news_trigger on news;
create trigger rag_news_trigger
after insert or update or delete on news
for each row execute function rag_on_news_change();

