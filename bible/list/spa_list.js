// JavaScript Recovery Version Verse Reference Requester and Printer
var rcvApp = document.querySelector('.js-app'),
    rcvForm = document.querySelector('.js-form'),
    rcvInput = document.querySelector('.js-input'),
    rcvOutput = document.querySelector('.js-output');

rcvForm.addEventListener('submit', handleSubmit);
rcvForm.addEventListener('keyup', handleKeyUp);

var api_url = "https://api.lsm.org/txo.php?Lang=spa&String=";
var req_resp = "&Out=json&file=1b1975c21-926f1-343cb-88744-3b658452c049d";
async function fetch_verses_async(vlist) {
    var vreq = new XMLHttpRequest();
    vreq.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            verseout_parse(this.responseText);
        }
    };
    var verselist = document.getElementById(vlist).value;
    var req_string = api_url + verselist + req_resp;
    vreq.open("GET", req_string, true);
    vreq.send();
}

function verseout_parse(vrefres) {
    var versearray = JSON.parse(vrefres);
    var dispurl = "https://texto.versionrecobro.org/";
    var out = "";
    var i;
    out = "<p class=\"reflist\"> <b>Verse(s):</b> " + versearray.detected + "</p>";
    for (i = 0; i < versearray.verses.length; i++) {
        out += "<p id=\"vlist-"+ i +"\" class=\"verse\"><a href=" + dispurl + versearray.verses[i].urlpfx + " class=\"ref\">" + versearray.verses[i].ref + "</a> <span> " + versearray.verses[i].text + "</span></p>";
    }
    if (versearray.message !="") {
//		out += "<p class=\"app_ui--message\">" + versearray.message.replace(/Error:/i,"") + "</p>";
    }
    out += "</p><p class=\"bottom-copyright\">" + versearray.copyright + "</p>";
    document.getElementById("displayv").innerHTML = out;
}

function handleSubmit(event) {
    event.preventDefault();
    checkSubmittedState();
    fetch_verses_async('reflist')
}

function handleKeyUp(event) {
    var inputIsReady = inputReady(event.target.value);
    if (inputIsReady) {
        checkInputLength(event.target.value);
        checkSubmittedState();
    } else {
        rcvOutput.classList.add('hidden');
    }
}

function checkSubmittedState() {
    if (!rcvApp.classList.contains('submitted')) {
        rcvApp.classList.add('submitted');
    }
}

function checkInputLength(value) {
    if (value.length > 1) {
        fetch_verses_async('reflist');
        rcvOutput.classList.remove('hidden');
    } else if (value.length < 1) {
        rcvOutput.classList.add('hidden');
    } else if (rcvOutput.classList.contains('hidden')) {
        rcvOutput.classList.remove('hidden');
    }
}

function inputReady(value) {
    var pattern = /\d/;
    return pattern.test(value);
}

// Debugging

// rcvInput.value = 'Genesis 1';
// fetch_verses_async('reflist');
// checkSubmittedState();
