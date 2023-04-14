import { supabase } from "../../utils";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

export const config = {
  runtime: "edge",
};

const embeddings = new OpenAIEmbeddings();

const handler = async (req: Request): Promise<Response> => {
  try {
    // get the search query from the request body
    const { query } = (await req.json()) as { query: string };

    // embeddings for the query
    const query_embedding = await embeddings.embedQuery(query);

    // uses query embedings to search for similar chunks in Supabase
    const { data, error } = await supabase.rpc("wf_search", {
      query_embedding,
      similarity_threshold: 0.8, // higher is more similar
      match_count: 6, // number of results to return
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ data }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
};

export default handler;
