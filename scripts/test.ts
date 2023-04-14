import * as dotenv from "dotenv";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
dotenv.config();

/* Create instance */
const embeddings = new OpenAIEmbeddings();

/* Embed queries */
const res = await embeddings.embedQuery("Hello world");
console.log(res);
