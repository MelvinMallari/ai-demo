export default function Youtube({ data }) {
  const parseYoutubeLink = (item) =>
    `https://www.youtube.com/watch?v=${item.video_id}&t=${Math.floor(
      item.start_time
    )}s`;

  const parseResults = () => {
    return (
      <>
        {data &&
          data.map((item, index) => (
            <div key={index} className="flex">
              <img
                src={`https://img.youtube.com/vi/${item.video_id}/hqdefault.jpg`}
                alt=""
              />
              <div>
                <div>{item.title}</div>
                <a
                  href={parseYoutubeLink(item)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.content}
                </a>
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
