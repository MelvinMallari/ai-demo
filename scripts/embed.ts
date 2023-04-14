import fs from "fs";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import tqdm from "tqdm";
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const embeddings = new OpenAIEmbeddings();

const retryOperation = async (
  operation: Function,
  maxRetries: number,
  delay = 1000
) => {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      retries++;
      if (retries === maxRetries) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

const generateEmbeddingsAndStore = async () => {
  const transcripts = JSON.parse(
    fs.readFileSync("scripts/batched_transcriptions.json", "utf-8")
  );
  for (const transcript of tqdm(transcripts)) {
    for (const segment of transcript.segments) {
      const { id, title, start, end, text } = segment;

      const embedding = await retryOperation(
        async () => await embeddings.embedQuery(text),
        5
      );
      await retryOperation(async () => {
        const { error, data } = await supabase
          .from("video_embeddings")
          .insert({
            video_id: id,
            title,
            start_time: start,
            end_time: end,
            content: text,
            embedding,
          })
          .select("*");

        if (error) {
          throw new Error(error.message);
        }
        return data;
      }, 5);

      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    console.log(`DONE WITH VIDEO 🎥 ${transcript.id} 🎥`);
  }
};

(async () => {
  try {
    await generateEmbeddingsAndStore();
  } catch (e) {
    console.error(e);
  }
  console.log("DONE 🔥");
})();
