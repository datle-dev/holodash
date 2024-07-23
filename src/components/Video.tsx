import dayjs from "dayjs";

export default function Video({ video, onClickGetProfile }) {
  return (
    <article className="border">
      <p>{video.channel.english_name}</p>
      <button
        data-channelid={video.channel.id}
        type="button"
        onClick={onClickGetProfile}
      >
        Profile
      </button>
      <a href={"http://youtube.com/channel/" + video.channel.id}>
        Channel
      </a>
      <p>{video.topic_id}</p>
      <a href={"https://youtube.com/watch?v=" + video.id}>
        {video.title}
      </a>
      {dayjs(video.start_scheduled).isAfter(dayjs()) ? (
        <>
          <p>Starts {dayjs(video.start_scheduled).fromNow()}</p>
          <p>{dayjs(video.start_scheduled).calendar()}</p>
        </>
      ) : (
        <>
          <p>
            LIVE! {video.live_viewers.toLocaleString()} watching now
          </p>
          <p>Started {dayjs(video.start_scheduled).fromNow()}</p>
          <p>{dayjs(video.start_scheduled).calendar()}</p>
        </>
      )}
      <p>{dayjs(video.start_scheduled).format("h:mm A [on] MMM DD")}</p>
    </article>
  );
}