import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import relativeTime from "dayjs/plugin/relativeTime";
import holomems from "./data/holomems.json";
import Clock from "./components/Clock";
import ChannelInfo from "./components/ChannelInfo";
import Video from "./components/Video";

dayjs.extend(calendar);
dayjs.extend(relativeTime);

type ResponseChannel = {
  english_name: string;
  id: string;
  name: string;
  org: string;
  photo: string;
  suborg: string;
  type: string;
};

type ResponseChannelInfo = {
  banner: string;
  english_name: string;
  id: string;
  name: string;
  photo: string;
  subscriber_count: number;
  twitter: string;
  video_count: number;
  view_count: number;
};

type ResponseVideo = {
  available_at: string;
  channel: ResponseChannel;
  duration: number;
  id: string;
  live_viewers: number;
  published_at: string;
  start_scheduled: string;
  status: string;
  title: string;
  topic_id: string;
  type: string;
};

export default function App() {
  const queryClient = useQueryClient();
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);

  const liveUpcomingVideos = useQuery({
    queryKey: ["live_upcoming"],
    queryFn: async () => {
      console.log("fetching live upcoming");
      console.log(dayjs().toLocaleString());
      const channelIds = holomems.map((holomem) => holomem.channelId);
      const channelIdsQuery = channelIds.join(",");
      const res = await fetch(
        "https://holodex.net/api/v2/users/live?channels=" + channelIdsQuery,
        {
          headers: {
            "X-APIKEY": import.meta.env.VITE_HOLODEX_API_KEY,
          },
        }
      );
      return await res.json();
    },
    retry: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 300000, // 5 min x 60 s x 1000 ms
  });

  async function handleGetProfile(e: React.MouseEvent<HTMLElement>) {
    setCurrentChannel(e.target.getAttribute("data-channelid"));
    await queryClient.invalidateQueries({ queryKey: ["channel"] });
    await queryClient.refetchQueries({ queryKey: ["channel"] });
  }

  if (liveUpcomingVideos.isPending) {
    return <p>Loading...</p>;
  }

  if (liveUpcomingVideos.isError) {
    return <p>Error: {liveUpcomingVideos.error.message}</p>;
  }

  const filteredSortedVideos = liveUpcomingVideos.data
    .filter((video: ResponseVideo) => {
      if (video.channel.org !== "Hololive") return false;

      const threshold = dayjs().add(2, "day");
      const videoStart = dayjs(video.start_scheduled);
      if (videoStart.isBefore(threshold)) return true;
    })
    .sort((a: ResponseVideo, b: ResponseVideo) => {
      const aStart = dayjs(a.start_scheduled);
      const bStart = dayjs(b.start_scheduled);
      return aStart.isAfter(bStart) ? 1 : -1;
    });

  return (
    <>
      {currentChannel && <ChannelInfo channelId={currentChannel} />}
      <Clock />
      {filteredSortedVideos.map((video: ResponseVideo, index: number) => {
        return (
          <Video
            video={video}
            onClickGetProfile={handleGetProfile}
            key={index}
          />
        );
      })}
    </>
  );
}
