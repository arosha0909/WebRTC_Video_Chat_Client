import React, { useEffect, useState, useReducer } from 'react';
import { createContext } from "react";
import socketIoClinet from "socket.io-client";
import { environment } from "../environment/environment";
import { useNavigate } from 'react-router-dom';
import Peer from 'peerjs';
import {v4 as uuidV4} from 'uuid'
import { peerReducer } from './peerReducer';
import { addPeerAction, removePeerAction } from './PeerActions';

export const RoomContext = createContext<null | any>(null);

const ws = socketIoClinet(environment.socket_uri)

export const RoomProvider: React.FunctionComponent<{ children: any }> = ({children}) => {
    const navigate = useNavigate();
    const [me, setMe] = useState<Peer>();
    const [stream, setStream] = useState<MediaStream>();
    const [peers, dispatch] = useReducer(peerReducer, {});

    const enterRoom = ({roomId} : {roomId: "string"}) => {
        console.log({roomId});
        navigate(`/room/${roomId}`);
    };

    const getUsers = ({participants}: {participants: string[]}) => {
        console.log(participants);
    };

    const removePeer = (peerId: string) => {
        dispatch(removePeerAction(peerId));
    }

    useEffect(() => {
        const meId = uuidV4();
        const peer = new Peer(meId);
        setMe(peer);

        try {
            navigator.mediaDevices.getUserMedia({video: true, audio: true}).then((stream) => {
                setStream(stream);
            });
        } catch (e) {
            console.error(e);
        }
        
        ws.on("room-created", enterRoom);
        ws.on("get-users", getUsers);
        ws.on("user-disconnected", removePeer);
    }, []);

    useEffect(() => {
        if (!me) return;
        if (!stream) return;

        ws.on("user-joined", ({peerId}) => {
            const call = me.call(peerId, stream);

            call.on("stream", (peerStream) => {
                dispatch(addPeerAction(peerId, peerStream));
            })
        });

        me.on("call", (call) => {
            call.answer(stream);

            call.on("stream", (peerStream) => {
                dispatch(addPeerAction(call.peer, peerStream));
            })
        });

    }, [me, stream])
    
    console.log({peers})
    
    return (
        <RoomContext.Provider value={{ws, me, stream}}>{children}</RoomContext.Provider>
    )
}