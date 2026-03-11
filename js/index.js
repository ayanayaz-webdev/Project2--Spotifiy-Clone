console.log("lets write javascript code");
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }






  let songUl = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songUl.innerHTML = "";
  for (const song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      `<li>
                <img class="invert" src="img/music.svg" alt="">
                <div class="info">
                  <div> ${song.replaceAll("%20", " ")}</div>
                  <div>Ayan</div>
                </div>
                <div class="playnow">
                  <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="">
              </div>
   </li>`;
  }
  //Attach an event listener to each song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li"),
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs;
}

const playMusic = (track) => {
  // let audio = new Audio("/Songs/"+track)
  currentSong.src = `/${currFolder}/` + track;
  currentSong.play().catch(() => {});
  play.src = "img/pause.svg";
  document.querySelector(".songinfo").innerHTML = track;
  document.querySelector(".songtimeleft").innerHTML = "00:00";
  document.querySelector(".songtimeright").innerHTML = "00:00";
};

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:5500/Songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
 
  let anchors = div.getElementsByTagName("a");
 

  let cardConatiner = document.querySelector(".cardContainer");

  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/Songs/")) {
      let folder = e.href.split("/").slice(-2)[1];
      // Get the metadata of the folder
      let a = await fetch(`http://127.0.0.1:5500/Songs/${folder}/info.json`);
      let response = await a.json();
      cardConatiner.innerHTML =
        cardConatiner.innerHTML +
        `<div data-folder="${folder}" class="card">
              <div class="play">
                <svg
                  data-encore-id="icon"
                  role="img"
                  aria-hidden="true"
                  class="e-91000-icon e-91000-baseline"
                  viewBox="0 0 24 24"
                  height="24px"
                  width="24px"
                >
                  <path
                    d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606"
                  ></path>
                </svg>
              </div>
              <img src="/Songs/${folder}/cover.jpg" alt="" />

              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`;
    }
  }

  //  Load the playlist whenerever card is loaded
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  //get the list from all the songs
  await getSongs("Songs/ncs");
  //  playMusic(songs[0], true);

  // Display all the albums on the page
  displayAlbums();

  //Attach an event listner to play, next and prev song
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "/img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "/img/play.svg";
    }
  });






  //Listen for the time update
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtimeleft").innerHTML =
      `${secondsToMinutesSeconds(currentSong.currentTime)}`;
    document.querySelector(".songtimeright").innerHTML =
      `${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
    document.querySelector(".seekbar").style.background =
      `linear-gradient(to right,rgb(255, 255, 255) ${(currentSong.currentTime / currentSong.duration) * 100}%, #4d4d4d ${(currentSong.currentTime / currentSong.duration) * 100}%)`;
  });

  //Add Event Listener to the seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  //Add event listner to the hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  //Add event listner to the close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  //Add event listner to preivous
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  //Add event listner to next button
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  //Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
    });


    //Add event listner to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=> {
      console.log(e.target)
      if(e.target.src.includes("img/volume.svg")){
         e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
         currentSong.volume = 0;
         document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
      }
      else{
        e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
        currentSong.volume = .10;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
      }


    })

    //Add an event listner to play now side
         document.querySelector(".playnow>img").addEventListener("click", (e) => {
      console.log(e.target)
      if(e.target.src.includes("img/play.svg")){
        e.target.src = e.target.src.replace("img/play.svg", "img/pause-2.svg")
        currentSong.pause();
        console.log(e.target)
      }
      else{
        e.target.src = e.target.src.replace("img/pause-2.svg", "img/play.svg")
        currentSong.play();
        console.log(e.target)
      }
     })

}

main();
