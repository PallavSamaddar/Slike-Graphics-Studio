import { useCallback, useEffect, useState } from 'react';
import { listUploadedVideos } from '../services/media.js';
import { useToast } from '../ui-kit';

// The videos uploaded through the upload SDK, fetched while `active`; refresh() asks again
// (after an upload ends).
export default function useUploadedVideos(active) {
  const toast = useToast();
  const [videos, setVideos] = useState([]);

  const refresh = useCallback(() => {
    listUploadedVideos()
      .then((res) => setVideos(res?.list || []))
      .catch((err) => toast(`Couldn't load uploaded videos: ${err.message}`, 'bad'));
  }, [toast]);

  useEffect(() => {
    if (active) refresh();
  }, [active, refresh]);

  return { videos, refresh };
}
