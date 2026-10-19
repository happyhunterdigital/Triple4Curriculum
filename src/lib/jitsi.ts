/**
 * Jitsi External API wrapper — embeds meet.jit.si rooms inside the app with
 * join/leave events so we can auto-record attendance. No server needed; the
 * media engine is Jitsi's, the product layer (branding, attendance) is ours.
 *
 * Docs: https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-external/
 */

const JITSI_API_SRC = 'https://meet.jit.si/external_api.js';

interface JitsiExternalApiCtor {
  new (domain: string, options: Record<string, unknown>): JitsiInstance;
}
interface JitsiInstance {
  addEventListener(event: string, handler: (e: Record<string, string>) => void): void;
  dispose(): void;
}
declare global {
  interface Window {
    JitsiMeetExternalAPI?: JitsiExternalApiCtor;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadJitsiScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.JitsiMeetExternalAPI) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = JITSI_API_SRC;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        scriptPromise = null;
        reject(new Error('Failed to load Jitsi external API script.'));
      };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

export interface LiveRoomCallbacks {
  /** Local participant joined the conference — record attendance here. */
  onJoined: (participantId: string) => void;
  /** Local participant left the conference. */
  onLeft: () => void;
  /** Conference fully closed (hang-up) — navigate away. */
  onClosed: () => void;
}

export interface LiveRoomOptions {
  /** Jitsi room name, e.g. triple4c-csc441monday0900 (from the live URL path). */
  roomName: string;
  /** Student/staff display name shown in the tile. */
  displayName?: string;
  /** Meeting subject shown in the header (course title). */
  subject?: string;
  container: HTMLElement;
  callbacks: LiveRoomCallbacks;
}

/** Extract the room path from a full Jitsi URL (https://meet.jit.si/RooM -> RooM). */
export function roomNameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname.replace(/^\/+/, '');
  } catch {
    return url.replace(/^https?:\/\/[^/]+\//, '');
  }
}

/** Create the embedded conference. Returns a dispose fn. */
export async function createLiveRoom(opts: LiveRoomOptions): Promise<() => void> {
  await loadJitsiScript();
  const Ctor = window.JitsiMeetExternalAPI;
  if (!Ctor) throw new Error('Jitsi External API unavailable.');

  const api = new Ctor('meet.jit.si', {
    roomName: opts.roomName,
    width: '100%',
    height: '100%',
    parentNode: opts.container,
    userInfo: { displayName: opts.displayName || 'Learner' },
    configOverwrite: {
      subject: opts.subject || 'Triple 4C Live Class',
      prejoinPageEnabled: true,          // mic/cam check + name confirm before join
      disableDeepLinking: true,          // stay in the embedded room
      startWithAudioMuted: false,
      startWithVideoMuted: false,
      disableMeetingName: false,
    },
    interfaceConfigOverwrite: {
      SHOW_JITSI_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      DEFAULT_BACKGROUND_COLOR: '#111315',
      TOOLBAR_BUTTONS: [
        'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
        'fodeviceselection', 'hangup', 'chat', 'recording', 'livestreaming',
        'settings', 'raisehand', 'videoquality', 'filmstrip',
        'invite', 'security', 'info', 'help', 'mute-everyone',
      ],
    },
  });

  api.addEventListener('videoConferenceJoined', (e) => opts.callbacks.onJoined(e.participantId || ''));
  api.addEventListener('videoConferenceLeft', () => opts.callbacks.onLeft());
  api.addEventListener('readyToClose', () => opts.callbacks.onClosed());

  return () => {
    try {
      api.dispose();
    } catch {
      // already disposed
    }
  };
}
