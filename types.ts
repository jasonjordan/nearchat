export interface Location {
  latitude: number;
  longitude: number;
}

export interface OtherUser {
  id: string; 
  callsign: string;
  location: Location;
}

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'disconnected';

// --- WebSocket API Message Types ---

// C2S: Client-to-Server
export interface C2S_JoinChannel {
  type: 'joinChannel';
  payload: {
    callsign: string;
    location: Location;
    receiveRadius: number; // Added so server knows what we want to hear
  };
}

export interface C2S_LocationUpdate {
  type: 'locationUpdate';
  payload: {
    location: Location;
    receiveRadius: number; // Keep server updated on our radius
  };
}

// Store and Forward: We send the whole message at once
export interface C2S_AudioMessage {
  type: 'audioMessage';
  payload: {
    audioBlob: string; // Base64 encoded WebM/Ogg/WAV
    duration: number;
  };
}

export type C2S_Message = C2S_JoinChannel | C2S_LocationUpdate | C2S_AudioMessage;

// S2C: Server-to-Client
export interface S2C_ChannelState {
    type: 'channelState';
    payload: {
        users: { callsign: string; location: Location }[];
    }
}

export interface S2C_UserJoined {
    type: 'userJoined';
    payload: {
        callsign: string;
        location: Location;
    }
}

export interface S2C_UserLeft {
    type: 'userLeft';
    payload: {
        callsign: string;
    }
}

export interface S2C_UserLocationUpdated {
    type: 'userLocationUpdated';
    payload: {
        callsign: string;
        location: Location;
    }
}

export interface S2C_AudioMessage {
    type: 'audioMessage';
    payload: {
        from: string; // callsign
        location: Location; // Sender location at time of recording
        audioBlob: string; // Base64 encoded audio
    }
}

export type S2C_Message = S2C_ChannelState | S2C_UserJoined | S2C_UserLeft | S2C_UserLocationUpdated | S2C_AudioMessage;