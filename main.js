import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDUgTAyO5NgAPv6G9peylTBvIyem7sMF0w",
  authDomain: "zawgtwinmeh.firebaseapp.com",
  projectId: "zawgtwinmeh",
  storageBucket: "zawgtwinmeh.firebasestorage.app",
  messagingSenderId: "655399885638",
  appId: "1:655399885638:web:cc8d2e24ba1418ee466347",
  measurementId: "G-5EBBM23JWD"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const gameArea = document.getElementById("game-area");
const startPage = document.getElementById("start-page");

const usernameInput = document.getElementById("un-li");
const passwordInput = document.getElementById("pw-li");
const loginButton = document.querySelector("#login-section button");

function checkRam() {
    let eightgigs = true;
    if ('deviceMemory' in navigator) {
        const memory = navigator.deviceMemory;
        if (memory => 6) {
            return true
        } else {
            return false
        }
    } else {
        alert('navigator.deviceMemory API is not supported.');
        return true
    }
}


async function loadGames() {

    let eightgigs = checkRam();

    gameArea.innerHTML = "";

    const response = await fetch("https://raw.githubusercontent.com/ilovebananasoup/andrewlovesmillie/refs/heads/main/games.json");
    let games = await response.json();
    games = games.sort((a,b) => {
        return a.name.localeCompare(b.name);
    })

    games.forEach(game => {
        if (!eightgigs && game.needs8gbRam) {
            return
        }
        const gameDiv = document.createElement("div");
        gameDiv.className = "game";

        const imgDiv = document.createElement("div");
        imgDiv.className = "game-img";
        imgDiv.style.backgroundImage = `url('${game.img}')`;

        const titleDiv = document.createElement("div");
        titleDiv.className = "game-title";
        titleDiv.textContent = game.name;

        gameDiv.onclick = () => openGame(game.url);

        gameDiv.appendChild(imgDiv);
        gameDiv.appendChild(titleDiv);

        gameArea.appendChild(gameDiv);
    });
}





function openGame(url) {
    const win = window.open("", "_blank");
    if (!win) return;

    const doc = win.document;

    doc.open();
    doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                html,body{
                    margin:0;
                    height:100%;
                    overflow:hidden;
                }
                iframe{
                    width:100%;
                    height:100%;
                    border:none;
                }
            </style>
        </head>

        <body>
            <iframe src="${url}" sandbox="allow-scripts allow-forms allow-pointer-lock allow-same-origin"></iframe>
        </body>
        </html>
    `);
    doc.close();
}




function emailFromUsername(username){
    return username + "@blapowpow.com";
}


async function login(username, password){

    const email = emailFromUsername(username);

    try{

        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        console.log("logged in:", userCredential.user.uid);

    }catch(err){

        if(
            err.code === "auth/user-not-found" ||
            err.code === "auth/invalid-login-credentials"
        ){

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            console.log("created account:", userCredential.user.uid);

            await saveSettings(userCredential.user, {
                favorites: [],
                created: Date.now()
            });

        }else{
            alert(err.message);
        }

    }

}

async function logout(){
    await signOut(auth);
}

async function signup(username,password){

    const email = emailFromUsername(username);

    const userCredential = await createUserWithEmailAndPassword(auth,email,password);

    await saveSettings(userCredential.user,{
        favorites:[],
        created:Date.now()
    });

}



async function saveSettings(user, settings){
    await setDoc(doc(db,"users",user.uid),settings,{merge:true});
}




loginButton.onclick = async () => {

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if(!username || !password){
        alert("enter username and password");
        return;
    }

    await login(username,password);

};




onAuthStateChanged(auth,(user)=>{

    if(user){

        console.log("logged in:",user.uid);

        startPage.style.display = "none";

        loadSettings(user);

        loadGames();

    }else{

        console.log("not logged in");

        startPage.style.display = "flex";

    }

});

async function loadSettings(user){

    const ref = doc(db,"users",user.uid);
    const snap = await getDoc(ref);

    if(!snap.exists()) return;

    const settings = snap.data();

    if(settings.test === "zawg"){
        alert("test")
    }

}

window.login = login;
window.signup = signup;
window.saveSettings = saveSettings;
window.auth = auth;
window.logout = logout;