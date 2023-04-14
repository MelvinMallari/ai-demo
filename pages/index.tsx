import Youtube from "@/components/Youtube";
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
    setLoading(false);
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
      <div className="h-64 flex items-center justify-center bg-light-blue">
        <div className="custom-font text-6xl">Webflow video search</div>
      </div>
      <div className="flex items-center justify-center mt-8">
        <div className="w-1/2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                aria-hidden="true"
                className="w-5 h-5 text-gray-500 light:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            <input
              type="search"
              id="default-search"
              className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 light:bg-gray-700 light:border-gray-600 light:placeholder-gray-400 light:text-white light:focus:ring-blue-500 light:focus:border-blue-500"
              value={query}
              placeholder="ask me anything"
              onChange={(e) => setQuery(e.target.value)}
              required
            />
            <button
              type="submit"
              className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 light:bg-blue-600 light:hover:bg-blue-700 light:focus:ring-blue-800"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>

          <div className="mt4">
            {loading ? <div>..loading</div> : <Youtube data={results.data} />}
          </div>
        </div>
      </div>
    </>
  );
}
