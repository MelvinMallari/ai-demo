create table paul_graham (
  id bigserial primary key,
  video_id text,
  title text,
  url text,
  date text,
  content text,
  content_tokens bigint,
  embedding vector (1536)
);

create or replace function wf_search (
  query_embedding vector(1536),
  similarity_threshold float,
  match_count int
)
returns table (
  id bigint,
  video_id text,
  title text,
  start_time float,
  end_time float,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    video_embeddings.id,
    video_embeddings.video_id,
    video_embeddings.title,
    video_embeddings.start_time,
    video_embeddings.end_time,
    video_embeddings.content,
    1 - (video_embeddings.embedding <=> query_embedding) as similarity
from video_embeddings
where 1 - (video_embeddings.embedding <=> query_embedding) > similarity_threshold
order by video_embeddings.embedding <=> query_embedding
limit match_count;
end;
$$;
