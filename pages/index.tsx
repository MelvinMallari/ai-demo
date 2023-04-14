import Head from "next/head";
import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    const searchResponse = await fetch("/api/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!searchResponse.ok) {
      setLoading(false);
      return;
    }

    const results = await searchResponse.json();
    setResults(results);
    console.log({ results });
    setLoading(false);
  };

  const parseYoutubeLink = (item) =>
    `https://www.youtube.com/watch?v=${item.video_id}&t=${Math.floor(
      item.start_time
    )}s`;

  const parseResults = () => {
    return (
      <>
        {results &&
          results.data &&
          results.data.map((item, index) => (
            <div key={index}>
              <a
                href={parseYoutubeLink(item)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.title}
              </a>
            </div>
          ))}
      </>
    );
  };

  return (
    <>
      <Head>
        <title>Webflow Video Search</title>
        <meta
          name="description"
          content="Use AI to search for videos on Webflow"
        />
      </Head>
      <div className="flex flex-col">
        <input
          type="text"
          value={query}
          placeholder="ask me anything"
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <button
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
          onClick={handleSearch}
        >
          Submit
        </button>
      </div>
      <div className="mt4">
        {loading ? <div>..loading</div> : <div>{parseResults()}</div>}
      </div>
    </>
  );
}
