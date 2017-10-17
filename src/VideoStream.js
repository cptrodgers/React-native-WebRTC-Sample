import React, { Component } from 'react';
var WebRTC = require('react-native-webrtc');
var {
  RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription,
    RTCView,
    MediaStream,
    MediaStreamTrack,
    getUserMedia,
} = WebRTC;

import {
    Platform,
    StyleSheet,
    Text,
    View
} from 'react-native';


export default class VideoStream extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isFront: true,
            videoURL: null,
            text: ''
        };
    }

    componentDidMount() {
        console.log("Run component");
        this.setState({
            text: 'Hello'
        })
        const configuration = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
        const pc = new RTCPeerConnection(configuration);
        const isFront = this.state.isFront;
        MediaStreamTrack
            .getSources()
            .then(sourceInfos => {
                console.log(sourceInfos);
                let videoSourceId;
                for (let i = 0; i < sourceInfos.length; i++) {
                    const sourceInfo = sourceInfos[i];
                    if (sourceInfo.kind == "video" && sourceInfo.facing == (isFront ? "front" : "back")) {
                        videoSourceId = sourceInfo.id;
                    }
                }
                return getUserMedia({
                    audio: true,
                    video: {
                        mandatory: {
                            minWidth: 500, // Provide your own width, height and frame rate here
                            minHeight: 300,
                            minFrameRate: 30
                        },
                        facingMode: (isFront ? "user" : "environment"),
                        optional: (videoSourceId ? [{ sourceId: videoSourceId }] : [])
                    }
                });
            })
            .then(stream => {
                console.log('dddd', stream);
                this.setState({
                    videoURL: stream.toURL(),
                    text: stream.toURL()
                })
                pc.addStream(stream);
            })
            .catch((logError) => console.log(logError));

        pc.createOffer()
            .then(pc.setLocalDescription)
            .then(() => {
                // Send pc.localDescription to peer
            })
            .catch((e) => console.log(e));

        pc.onicecandidate = function (event) {
            // send event.candidate to peer
            console.log('onicecandidate', event)
        };
    }

    render() {
        console.log("Run render")
        return (
            <View>
                <Text>Address Streaming: {this.state.text}</Text>
                <RTCView streamURL={this.state.videoURL} style={styles.container} />
            </View>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        width: 200, 
        height: 200, 
        backgroundColor: 'powderblue'
    },
    videoFeed: {
        backgroundColor: 'grey',
        flex: 1,
        alignSelf: 'stretch',
    },
});