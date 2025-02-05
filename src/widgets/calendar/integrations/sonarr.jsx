import { DateTime } from "luxon";
import { useEffect, useContext } from "react";

import useWidgetAPI from "../../../utils/proxy/use-widget-api";
import { EventContext } from "../../../utils/contexts/calendar";
import Error from "../../../components/services/widget/error";

export default function Integration({ config, params }) {
  const { setEvents } = useContext(EventContext);
  const { data: sonarrData, error: sonarrError } = useWidgetAPI(config, "calendar",
    { ...params, includeSeries: 'true', includeEpisodeFile: 'false', includeEpisodeImages: 'false',  ...config?.params ?? {} }
  );

  useEffect(() => {
    if (!sonarrData || sonarrError) {
      return;
    }

    const eventsToAdd = {};

    sonarrData?.forEach(event => {
      const title = `${event.series.title ?? event.title} - S${event.seasonNumber}E${event.episodeNumber}`;

      eventsToAdd[title] = {
        title,
        date: DateTime.fromISO(event.airDateUtc),
        color: config?.color ?? 'teal'
      };
    })

    setEvents((prevEvents) => ({ ...prevEvents, ...eventsToAdd }));
  }, [sonarrData, sonarrError, config, setEvents]);

  const error = sonarrError ?? sonarrData?.error;
  return error && <Error error={{ message: `${config.type}: ${error.message ?? error}`}} />
}
