import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

type ChannelParamsType = {
  channelId: string,
}

type ResponseChannel = {
  english_name: string,
  id: string,
  name: string,
  org: string,
  photo: string,
  suborg: string,
  type: string
}

type ResponseVideo = {
  available_at: string,
  channel: ResponseChannel,
  duration: number,
  id: string,
  live_viewers: number,
  published_at: string,
  start_scheduled: string,
  status: string,
  title: string,
  topic_id: string,
  type: string
}

export default function ChannelInfo({ channelId }: ChannelParamsType) {
  const channel = useQuery({
    queryKey: ["channel", "info"],
    queryFn: async () => await fetchChannel(channelId),
    retry: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const recentStreams = useQuery({
    queryKey: ["channel", "recent_streams"],
    queryFn: async () => await fetchRecentStreams(channelId),
    retry: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  if (channel.isFetching) {
    return <p>Fetching channel...</p>
  }

  if (recentStreams.isFetching) {
    return <p>Fetching recent streams...</p>
  }

  if (channel.isPending || recentStreams.isPending) {
    return <p>Loading profile and recent streams...</p>;
  }

  if (channel.isError) {
    return <p>Error: {channel.error.message}</p>;
  }

  if (recentStreams.isError) {
    return <p>Error: {recentStreams.error.message}</p>;
  }

  return (
    <>
      <h2>Channel</h2>
      {channel && (
        <div>
          <p>{channel.data.name}</p>
          <p>{channel.data.english_name}</p>
          <p>subscribers: {channel.data.subscriber_count.toLocaleString()}</p>
          <p>videos: {channel.data.video_count.toLocaleString()}</p>
          <p>views: {channel.data.view_count.toLocaleString()}</p>
        </div>
      )}

      <h2>Recent Streams</h2>
      {recentStreams.data.map((video: ResponseVideo, index: number) => {
        return (
          <div key={index}>
            <p>{video.title}</p>
            <a href={'https://youtube.com/watch?v=' + video.id}>Open in Youtube</a>
            <a href={'https://holodex.net/watch/' + video.id}>Open in Holodex</a>
          </div>
        )
      })}
    </>
  );
}

async function fetchChannel(channelId: string) {
  const res = await fetch("https://holodex.net/api/v2/channels/" + channelId, {
    headers: {
      "X-APIKEY": import.meta.env.VITE_HOLODEX_API_KEY,
    },
  })
  return await res.json()
}

async function fetchRecentStreams(channelId: string) {
  const queryObj = {
    channel_id: channelId,
    status: "past",
    type: "stream",
    sort: "start_actual",
    order: "asc",
    limit: 6,
    from: dayjs().subtract(3, "day").toISOString(),
    to: dayjs().toISOString(),
  };
  const queryParams = new URLSearchParams(queryObj);

  const res = await fetch("https://holodex.net/api/v2/videos?" + queryParams, {
    headers: {
      "X-APIKEY": import.meta.env.VITE_HOLODEX_API_KEY,
    },
  })
  return await res.json()
}
