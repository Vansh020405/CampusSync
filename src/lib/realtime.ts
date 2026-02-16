// Real-time Event System Foundation
// This module provides a unified interface for broadcasting and listening to campus events.
// It currently uses the BroadcastChannel API for local multi-tab sync, 
// and is architected to be easily swappable for Supabase Realtime, Firebase, or WebSockets.

export type RealtimeEvent =
    | { type: 'ATTENDANCE_UPDATE'; data: { studentId: string; subject: string; percentage: number } }
    | { type: 'NEW_BROADCAST'; data: { id: string; senderName: string; message: string; section: string; timestamp: Date } }
    | { type: 'CLASS_CANCELLED'; data: { facultyId: string; subject: string; date: string } };

const CHANNEL_NAME = 'campus_sync_realtime';

export class CampusRealtime {
    private static channel: BroadcastChannel | null = typeof window !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null;

    static broadcast(event: RealtimeEvent) {
        if (this.channel) {
            this.channel.postMessage(event);
        }

        // FUTURE: Add backend sync here
        // await supabase.from('realtime_events').insert(event);
    }

    static subscribe(callback: (event: RealtimeEvent) => void) {
        if (!this.channel) return () => { };

        const handler = (msg: MessageEvent<RealtimeEvent>) => callback(msg.data);
        this.channel.addEventListener('message', handler);

        return () => {
            this.channel?.removeEventListener('message', handler);
        };
    }
}
