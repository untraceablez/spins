// scripts/player.js

const Player = {
    playlist: [],
    index: 0,
    sound: null,
    shuffle: true, // Shuffle by default as requested

    init: function() {
        // Fetch the playlist and then initialize the player
        fetch('playlist.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok. Is the playlist.json file available?');
                }
                return response.json();
            })
            .then(data => {
                if (data.length === 0) {
                    console.error("Playlist is empty. Make sure `generate_playlist.sh` ran correctly.");
                    trackUpdate({ title: "Playlist is empty", artist: "Please run generate_playlist.sh", album: "" });
                    return;
                }
                // The paths in playlist.json are absolute, like "/mnt/music/..."
                // We need to make them relative to the music server.
                // The music server serves from "/mnt/music", so we strip that part.
                // We also need to serve them from our new server on port 8000
                this.playlist = data.map(track => 'http://localhost:8000' + track.substring('/mnt/music'.length));
                
                if (this.shuffle) {
                    this.shufflePlaylist();
                }
                
                // Start playing the first track
                this.playTrack(this.index);
            })
            .catch(error => {
                console.error('Error loading playlist:', error);
                // Display an error to the user
                trackUpdate({ title: "Error", artist: "Could not load playlist.json", album: "See console for details." });
            });
    },

    playTrack: function(index) {
        // If there's an existing sound, stop it first
        if (this.sound) {
            this.sound.unload();
        }

        this.index = index;
        const trackUrl = this.playlist[this.index];

        this.sound = new Howl({
            src: [trackUrl],
            html5: true, // Required for large files like FLAC
            format: [trackUrl.split('.').pop()],
            onplay: () => {
                playStateChanged(1); // Playing
                // We don't have metadata from the file, so we'll just show the filename.
                // A more advanced solution would be to use a library to read the file metadata.
                const fileName = trackUrl.split('/').pop();
                trackUpdate({ title: fileName, artist: "Unknown Artist", album: "Unknown Album" });
                artworkUpdate(""); // No artwork for now
            },
            onpause: () => {
                playStateChanged(2); // Paused
            },
            onstop: () => {
                playStateChanged(0); // Stopped
            },

            onend: () => {
                // When a track ends, play the next one.
                // This implements the "repeating" part of the request.
                this.nextTrack();
            },
            onloaderror: (id, err) => {
                console.error('Error loading track:', trackUrl, err);
                artworkUpdate("");
                trackUpdate({ title: "Load Error", artist: "Check console for details.", album: "" });
                // Try playing the next track
                setTimeout(() => this.nextTrack(), 2000);
            },
            onplayerror: (id, err) => {
                console.error('Error playing track:', trackUrl, err);
                artworkUpdate("");
                trackUpdate({ title: "Playback Error", artist: "Check console and server.", album: "" });
                // Try playing the next track
                setTimeout(() => this.nextTrack(), 2000);
            }
        });

        this.sound.play();
    },

    playPause: function() {
        if (!this.sound) return;

        if (this.sound.playing()) {
            this.sound.pause();
        } else {
            this.sound.play();
        }
    },

    nextTrack: function() {
        if (this.playlist.length === 0) return;
        
        let newIndex = this.index + 1;
        if (newIndex >= this.playlist.length) {
            newIndex = 0; // Loop back to the start
        }
        
        // If shuffle is still on, re-shuffle the playlist when we loop
        if (newIndex === 0 && this.shuffle) {
            this.shufflePlaylist();
        }

        this.playTrack(newIndex);
    },

    previousTrack: function() {
        if (this.playlist.length === 0) return;

        let newIndex = this.index - 1;
        if (newIndex < 0) {
            newIndex = this.playlist.length - 1; // Go to the end
        }
        this.playTrack(newIndex);
    },

    shufflePlaylist: function() {
        // Simple Fisher-Yates shuffle
        for (let i = this.playlist.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.playlist[i], this.playlist[j]] = [this.playlist[j], this.playlist[i]];
        }
        console.log("Playlist shuffled.");
    },

    // These functions are called by the UI but don't have a direct mapping yet.
    // We will leave them here for future implementation if needed.
    rating: function() {
        // Not implemented with Howler.js basic playback
        return 0;
    },
    setRating: function(rating) {
        // Not implemented
        console.log("Rating functionality is not implemented in this version.");
    }
};

// We need to call the init function when the page loads.
// The existing `init()` function in index.html is for the animator.
// Let's call our player init after the page has loaded.
window.addEventListener('load', () => {
    Player.init();
});
