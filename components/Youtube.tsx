function formatSeconds(sec: number) {
  const seconds = Math.floor(sec);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const formattedSeconds =
    remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;
  return `${formattedMinutes}:${formattedSeconds}`;
}

export default function Youtube({ data }) {
  const parseYoutubeLink = (item) =>
    `https://www.youtube.com/watch?v=${item.video_id}&t=${Math.floor(
      item.start_time
    )}s`;

  const YoutubeEmbed = ({ item }) => {
    const src = `https://www.youtube.com/embed/${
      item.video_id
    }?start=${Math.floor(item.start_time)}`;
    return (
      <div className="video-responsive">
        <iframe
          width="480"
          height="360"
          src={src}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Embedded youtube"
          className="rounded-lg"
        />
      </div>
    );
  };

  const Link = ({ item }) => {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        {item.content}{" "}
        <a
          href={parseYoutubeLink(item)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center font-medium text-blue-600 dark:text-blue-500 hover:underline"
        >
          [{formatSeconds(item.start_time)}]
          <svg
            aria-hidden="true"
            className="w-5 h-5 ml-1"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </a>
      </p>
    );
  };

  const parseResults = () => {
    return (
      <>
        {data &&
          data.map((item, index) => (
            <div key={index} className="flex py-6">
              <YoutubeEmbed item={item} />
              <div className="pl-6">
                <div className="text-center mb-4 font-semibold custom-font text-base">
                  {item.title}
                </div>
                <Link item={item} />
              </div>
            </div>
          ))}
      </>
    );
  };

  return (
    <>
      <div className="mt4">{parseResults()}</div>
    </>
  );
}
