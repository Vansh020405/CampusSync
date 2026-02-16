import { useEffect, useState } from 'react';
import { CampusRealtime, RealtimeEvent } from '@/lib/realtime';

export function useRealtime(callback?: (event: RealtimeEvent) => void) {
    const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);

    useEffect(() => {
        const unsubscribe = CampusRealtime.subscribe((event) => {
            setLastEvent(event);
            if (callback) callback(event);
        });

        return () => unsubscribe();
    }, [callback]);

    return {
        lastEvent,
        broadcast: CampusRealtime.broadcast.bind(CampusRealtime)
    };
}
